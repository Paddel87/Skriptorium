/** Attribution for Pwned Passwords (CC BY 4.0) and the password rules (ADR-017). */
export function PasswordNote() {
  return (
    <p className="note">
      Mindestens 15 Zeichen, beliebige Zeichen; Passwort-Manager und Einfügen
      sind erlaubt. Neue Passwörter werden gegen{" "}
      <a
        href="https://haveibeenpwned.com/Passwords"
        target="_blank"
        rel="noreferrer"
      >
        Pwned Passwords von Have I Been Pwned
      </a>{" "}
      geprüft (Daten unter CC BY 4.0); dabei verlassen nur die ersten 5 Zeichen
      eines Fingerabdrucks des Passworts den Server.
    </p>
  );
}
