"""The command ``skriptorium-einrichtung`` prints a setup code and stores only its hash."""

import re
from pathlib import Path

import pytest

from skriptorium.api.setup_command import main


def test_setup_command_prints_code_once(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path, capsys: pytest.CaptureFixture[str]
) -> None:
    monkeypatch.setenv("SKRIPTORIUM_DATA_DIR", str(tmp_path))
    assert main() == 0
    code = capsys.readouterr().out.splitlines()[1]
    assert re.fullmatch(r"[2-9A-HJKMNP-Z]{3}(-[2-9A-HJKMNP-Z]{3}){3}", code)
    stored = (tmp_path / "system" / "zugang.md").read_text(encoding="utf-8")
    assert "einrichtungscode_hash" in stored
    assert code not in stored
