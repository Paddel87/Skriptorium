"""Unit tests of the access protection: hashing, policy, Pwned Passwords, sessions, throttle."""

import hashlib
from datetime import timedelta
from pathlib import Path

import httpx
import pytest

from skriptorium.api.access import (
    CredentialStore,
    FailureThrottle,
    PasswordHasher,
    PasswordPolicy,
    PasswordRejected,
    PwnedPasswords,
    PwnedUnavailable,
    SessionStore,
    SetupCodeInvalid,
)
from skriptorium.api.access import sessions as sessions_module
from skriptorium.api.access import throttle as throttle_module
from skriptorium.storage import DocumentStore
from tests.api.conftest import PASSWORD, FakeBreached, FakeClock, cheap_hasher

# --- passwords ------------------------------------------------------------------------------


def test_default_hash_uses_asvs_parameters_and_verifies() -> None:
    hasher = PasswordHasher()
    stored = hasher.hash(PASSWORD)
    assert stored.startswith("scrypt$n=131072,r=8,p=1$")
    assert hasher.verify(PASSWORD, stored)
    assert not hasher.verify(PASSWORD + " ", stored)


def test_hash_is_salted_and_password_used_exactly() -> None:
    hasher = cheap_hasher()
    first, second = hasher.hash(PASSWORD), hasher.hash(PASSWORD)
    assert first != second
    assert not hasher.verify(PASSWORD.upper(), first)
    assert not hasher.verify(PASSWORD[:-1], first)


@pytest.mark.parametrize(
    "stored",
    ["", "scrypt", "scrypt$n=1024$abc", "bcrypt$n=1024,r=8,p=1$AAAA$AAAA", "scrypt$x$A$A"],
)
def test_malformed_hash_never_matches(stored: str) -> None:
    assert not cheap_hasher().verify(PASSWORD, stored)


def test_password_of_128_characters_works() -> None:
    hasher = cheap_hasher()
    long_password = "ä" * 128
    assert hasher.verify(long_password, hasher.hash(long_password))


# --- policy --------------------------------------------------------------------------------


def _policy(breached: FakeBreached | None = None) -> PasswordPolicy:
    return PasswordPolicy(breached or FakeBreached())


@pytest.mark.parametrize(
    ("password", "reason"),
    [
        ("a" * 14, "too_short"),
        ("a" * 129, "too_long"),
        ("mein Skriptorium ist toll", "context_word"),
        ("das PASSWORT lautet lang", "context_word"),
        ("es war einmal in der Salzmark", "context_word"),
    ],
)
def test_policy_rejects(password: str, reason: str) -> None:
    with pytest.raises(PasswordRejected) as caught:
        _policy().check(password, ["Salzmark", "salzmark", "Rom"])
    assert caught.value.reason == reason


def test_policy_accepts_any_composition_and_short_world_names() -> None:
    policy = _policy()
    policy.check("a" * 15)
    policy.check("🙂" * 15)
    policy.check("Rom und Karthago am Meer", ["Rom"])  # world names under 4 characters ignored


def test_policy_rejects_breached_and_passes_unavailability_on() -> None:
    breached = FakeBreached(breached={"correct horse battery"})
    with pytest.raises(PasswordRejected) as caught:
        _policy(breached).check("correct horse battery")
    assert caught.value.reason == "breached"
    with pytest.raises(PwnedUnavailable):
        _policy(FakeBreached(unavailable=True)).check(PASSWORD)


def test_policy_does_not_ask_the_service_for_rejected_passwords() -> None:
    breached = FakeBreached()
    with pytest.raises(PasswordRejected):
        _policy(breached).check("zu kurz")
    assert breached.asked == []


# --- Pwned Passwords --------------------------------------------------------------------------


def _suffix(password: str) -> tuple[str, str]:
    digest = hashlib.sha1(password.encode(), usedforsecurity=False).hexdigest().upper()
    return digest[:5], digest[5:]


def test_pwned_sends_only_prefix_with_padding_and_finds_match() -> None:
    prefix, suffix = _suffix(PASSWORD)
    seen: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request)
        return httpx.Response(200, text=f"0000000000000000000000000000000000A:0\r\n{suffix}:42\r\n")

    assert PwnedPasswords(httpx.MockTransport(handler)).is_breached(PASSWORD)
    assert str(seen[0].url) == f"https://api.pwnedpasswords.com/range/{prefix}"
    assert seen[0].headers["Add-Padding"] == "true"
    assert PASSWORD not in str(seen[0].url)


def test_pwned_ignores_padding_entries_and_other_suffixes() -> None:
    _, suffix = _suffix(PASSWORD)

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, text=f"{suffix}:0\nABCDEF:3\n\n")

    assert not PwnedPasswords(httpx.MockTransport(handler)).is_breached(PASSWORD)


def test_pwned_unavailable_on_error_status_and_network_error() -> None:
    def failing(request: httpx.Request) -> httpx.Response:
        return httpx.Response(503)

    def broken(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("down", request=request)

    with pytest.raises(PwnedUnavailable):
        PwnedPasswords(httpx.MockTransport(failing)).is_breached(PASSWORD)
    with pytest.raises(PwnedUnavailable):
        PwnedPasswords(httpx.MockTransport(broken)).is_breached(PASSWORD)


# --- sessions ------------------------------------------------------------------------------


def test_session_tokens_are_long_random_and_not_stored(clock: FakeClock) -> None:
    store = SessionStore(clock)
    token, session = store.create("Firefox")
    other, _ = store.create("Handy")
    assert token != other
    assert len(token) >= 43  # 32 bytes Base64: 256 bits (ASVS 7.2.3)
    assert token not in repr(store.__dict__)
    assert store.touch(token) == session


def test_session_idle_timeout_and_activity(clock: FakeClock) -> None:
    store = SessionStore(clock)
    token, _ = store.create("x")
    clock.advance(sessions_module.IDLE_TIMEOUT - timedelta(seconds=1))
    assert store.touch(token) is not None
    clock.advance(sessions_module.IDLE_TIMEOUT - timedelta(seconds=1))
    assert store.touch(token) is not None  # activity restarted the idle time
    clock.advance(sessions_module.IDLE_TIMEOUT)
    assert store.touch(token) is None
    assert store.touch(token) is None


def test_session_absolute_lifetime(clock: FakeClock) -> None:
    store = SessionStore(clock)
    token, _ = store.create("x")
    for _ in range(4):
        clock.advance(timedelta(days=6))
        assert store.touch(token) is not None
    clock.advance(timedelta(days=6) - timedelta(seconds=1))
    assert store.list() != []
    clock.advance(timedelta(seconds=1))  # 30 days after creation
    assert store.list() == []
    assert store.touch(token) is None


def test_session_limit_ends_oldest(clock: FakeClock) -> None:
    store = SessionStore(clock)
    tokens = []
    for index in range(sessions_module.MAX_SESSIONS + 1):
        clock.advance(timedelta(minutes=1))
        tokens.append(store.create(f"Gerät {index}")[0])
    assert store.touch(tokens[0]) is None
    assert all(store.touch(token) for token in tokens[1:])
    assert store.list()[0].client == "Gerät 5"


def test_session_renew_end_and_end_all(clock: FakeClock) -> None:
    store = SessionStore(clock)
    token, session = store.create("x" * 500)
    assert len(session.client) == 120
    renewed = store.renew(token)
    assert renewed is not None
    new_token, same = renewed
    assert same.id == session.id
    assert store.touch(token) is None
    assert store.renew("unbekannt") is None
    second, other = store.create("y")
    assert store.end_by_id(other.id)
    assert not store.end_by_id(other.id)
    store.create("z")
    store.end_all(except_id=session.id)
    assert [s.id for s in store.list()] == [session.id]
    store.end(new_token)
    store.end("unbekannt")
    assert store.list() == []
    assert store.touch(second) is None


# --- throttle ------------------------------------------------------------------------------


def test_throttle_blocks_one_client_only_within_window(clock: FakeClock) -> None:
    throttle = FailureThrottle(clock)
    for _ in range(throttle_module.MAX_FAILURES - 1):
        throttle.record_failure("1.2.3.4")
    assert not throttle.blocked("1.2.3.4")
    throttle.record_failure("1.2.3.4")
    assert throttle.blocked("1.2.3.4")
    assert not throttle.blocked("5.6.7.8")
    clock.advance(throttle_module.WINDOW)
    assert not throttle.blocked("1.2.3.4")


# --- credentials ---------------------------------------------------------------------------


def _credentials(tmp_path: Path, clock: FakeClock) -> CredentialStore:
    return CredentialStore(DocumentStore(tmp_path), cheap_hasher(), clock)


def test_credentials_without_password(tmp_path: Path, clock: FakeClock) -> None:
    credentials = _credentials(tmp_path, clock)
    assert not credentials.has_password()
    assert not credentials.verify_password(PASSWORD)
    assert not credentials.setup_code_valid("irgendwas")
    with pytest.raises(SetupCodeInvalid):
        credentials.set_password_with_code("irgendwas", PASSWORD)


def test_setup_code_sets_password_once(tmp_path: Path, clock: FakeClock) -> None:
    credentials = _credentials(tmp_path, clock)
    code = credentials.create_setup_code()
    assert len(code) >= 22  # 16 bytes: 128 bits
    stored = (tmp_path / "system" / "zugang.md").read_text(encoding="utf-8")
    assert code not in stored
    assert not credentials.setup_code_valid(code + "x")
    credentials.set_password_with_code(code, PASSWORD)
    assert credentials.verify_password(PASSWORD)
    assert PASSWORD not in (tmp_path / "system" / "zugang.md").read_text(encoding="utf-8")
    with pytest.raises(SetupCodeInvalid):
        credentials.set_password_with_code(code, "ein ganz anderes Passwort")


def test_setup_code_expires_after_24_hours(tmp_path: Path, clock: FakeClock) -> None:
    credentials = _credentials(tmp_path, clock)
    code = credentials.create_setup_code()
    clock.advance(timedelta(hours=24))
    assert not credentials.setup_code_valid(code)


def test_new_setup_code_keeps_password_and_change_keeps_code(
    tmp_path: Path, clock: FakeClock
) -> None:
    credentials = _credentials(tmp_path, clock)
    credentials.set_password(PASSWORD)
    code = credentials.create_setup_code()
    assert credentials.verify_password(PASSWORD)
    credentials.set_password("noch ein anderes langes Wort")
    assert credentials.setup_code_valid(code)
    assert not credentials.verify_password(PASSWORD)
