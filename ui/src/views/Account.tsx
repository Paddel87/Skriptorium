import { useCallback, useState, type SyntheticEvent } from "react";
import { api, describeError } from "../api";
import { useLoad } from "../useLoad";
import { ErrorText, Field } from "./Common";
import { PasswordNote } from "./PasswordNote";

/** Change the password and see or end sessions (ASVS 6.2.3, 7.4.3, 7.5.2). */
export function Account() {
  return (
    <div className="stack">
      <PasswordChange />
      <Sessions />
    </div>
  );
}

function PasswordChange() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [endOthers, setEndOthers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(event: SyntheticEvent) {
    event.preventDefault();
    setDone(false);
    if (next !== repeat) {
      setError("Die beiden neuen Passwörter stimmen nicht überein.");
      return;
    }
    setError(null);
    try {
      await api.changePassword(current, next, endOthers);
      setCurrent("");
      setNext("");
      setRepeat("");
      setDone(true);
    } catch (reason: unknown) {
      setError(describeError(reason));
    }
  }

  return (
    <form className="card" onSubmit={(event) => void submit(event)}>
      <h2>Passwort ändern</h2>
      <Field label="Bisheriges Passwort">
        <input
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(event) => {
            setCurrent(event.target.value);
          }}
          required
        />
      </Field>
      <Field label="Neues Passwort">
        <input
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(event) => {
            setNext(event.target.value);
          }}
          required
        />
      </Field>
      <Field label="Neues Passwort wiederholen">
        <input
          type="password"
          autoComplete="new-password"
          value={repeat}
          onChange={(event) => {
            setRepeat(event.target.value);
          }}
          required
        />
      </Field>
      <label className="check">
        <input
          type="checkbox"
          checked={endOthers}
          onChange={(event) => {
            setEndOthers(event.target.checked);
          }}
        />
        Alle anderen Sitzungen beenden
      </label>
      <PasswordNote />
      <ErrorText message={error} />
      {done && <p className="ok">Passwort geändert.</p>}
      <button type="submit">Passwort ändern</button>
    </form>
  );
}

function Sessions() {
  const load = useCallback(() => api.sessions(), []);
  const { data, error, reload } = useLoad(load);
  const [actionError, setActionError] = useState<string | null>(null);

  async function run(action: () => Promise<unknown>) {
    setActionError(null);
    try {
      await action();
      reload();
    } catch (reason: unknown) {
      setActionError(describeError(reason));
    }
  }

  return (
    <section className="card">
      <h2>Sitzungen</h2>
      <ErrorText message={error ?? actionError} />
      <ul className="list">
        {(data ?? []).map((session) => (
          <li key={session.id}>
            <span>
              {session.client || "Unbekanntes Gerät"}
              {session.current && " (diese Sitzung)"}
              <small>
                {" "}
                – zuletzt aktiv{" "}
                {new Date(session.last_seen).toLocaleString("de-DE")}
              </small>
            </span>
            {!session.current && (
              <button
                type="button"
                onClick={() => void run(() => api.endSession(session.id))}
              >
                Beenden
              </button>
            )}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => void run(() => api.endOtherSessions())}
      >
        Alle anderen Sitzungen beenden
      </button>
    </section>
  );
}
