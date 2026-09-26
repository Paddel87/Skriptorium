import { useState, type SyntheticEvent } from "react";
import { api, describeError } from "../api";
import { ErrorText, Field } from "./Common";
import { PasswordNote } from "./PasswordNote";

/** Set the password with the one-time setup code from `skriptorium-einrichtung`. */
export function Setup({
  onDone,
  onBack,
}: {
  onDone: () => void;
  onBack: () => void;
}) {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: SyntheticEvent) {
    event.preventDefault();
    if (password !== repeat) {
      setError("Die beiden Passwörter stimmen nicht überein.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.setup(code.trim(), password);
      onDone();
    } catch (reason: unknown) {
      setError(describeError(reason));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card narrow" onSubmit={(event) => void submit(event)}>
      <h1>Passwort festlegen</h1>
      <Field label="Einrichtungscode">
        <input
          autoComplete="one-time-code"
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
          }}
          required
        />
      </Field>
      <Field label="Neues Passwort">
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
          required
        />
      </Field>
      <Field label="Passwort wiederholen">
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
      <PasswordNote />
      <ErrorText message={error} />
      <button type="submit" disabled={busy}>
        Passwort festlegen
      </button>
      <button type="button" className="link" onClick={onBack}>
        Zurück zur Anmeldung
      </button>
    </form>
  );
}
