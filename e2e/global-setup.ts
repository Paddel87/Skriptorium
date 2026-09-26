import { execFileSync } from "node:child_process";

/** Test password; set directly, without the Pwned Passwords check of the setup form. */
export const E2E_PASSWORD = "Salzwind über der Mark 7";

/** Store the password hash in the data directory of the test server (ADR-019). */
export default function globalSetup(): void {
  execFileSync(
    "uv",
    [
      "run",
      "python",
      "-c",
      [
        "import os, sys",
        "from datetime import UTC, datetime",
        "from pathlib import Path",
        "from skriptorium.api.access import CredentialStore, PasswordHasher",
        "from skriptorium.storage import DocumentStore",
        "store = DocumentStore(Path(os.environ['SKRIPTORIUM_DATA_DIR']))",
        "CredentialStore(store, PasswordHasher(), lambda: datetime.now(UTC)).set_password(sys.argv[1])",
      ].join("\n"),
      E2E_PASSWORD,
    ],
    {
      env: {
        ...process.env,
        SKRIPTORIUM_DATA_DIR: process.env.SKRIPTORIUM_E2E_DATA,
      },
      stdio: "inherit",
    },
  );
}
