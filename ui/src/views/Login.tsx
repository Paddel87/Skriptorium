import { useState, type SyntheticEvent } from "react";
import { api, describeError } from "../api";
import { ErrorText, Field } from "./Common";

/** Login with the password; `onSetup` switches to the setup with a code. */
export function Login({
  onLoggedIn,
  onSetup,
  title = "Skriptorium",
}: {
  onLoggedIn: () => void;
  onSetup?: () => void;
  title?: string;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: SyntheticEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.login(password);
      onLoggedIn();
    } catch (reason: unknown) {
      setError(describeError(reason));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card narrow" onSubmit={(event) => void submit(event)}>
      <h1>{title}</h1>
      <Field label="Passwort">
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
          required
        />
      </Field>
      <ErrorText message={error} />
      <button type="submit" disabled={busy}>
        Anmelden
      </button>
      {onSetup !== undefined && (
        <button type="button" className="link" onClick={onSetup}>
          Mit Einrichtungscode ein Passwort festlegen
        </button>
      )}
    </form>
  );
}
