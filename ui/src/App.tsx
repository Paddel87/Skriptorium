import { useEffect, useState } from "react";
import { HashRouter, useNavigate } from "react-router";
import { api, setUnauthorizedHandler } from "./api";
import { ConnectionNote } from "./views/ConnectionNote";
import { Login } from "./views/Login";
import { Setup } from "./views/Setup";
import { Shell } from "./views/Shell";

type Access = "checking" | "login" | "setup" | "in";

/**
 * Root component: access check, then the views of the logged-in author. Every view has its own
 * address behind `#` (step 5.11, ADR-046).
 */
export function App() {
  return (
    <HashRouter>
      <Root />
      <ConnectionNote />
    </HashRouter>
  );
}

function Root() {
  const navigate = useNavigate();
  const [access, setAccess] = useState<Access>("checking");
  // Session ended while working: log in again above the open view, so unsaved text stays.
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setExpired(true);
    });
    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  useEffect(() => {
    // No valid session (401) or no server: both lead to the login.
    api.session().then(
      () => {
        setAccess("in");
      },
      () => {
        setAccess("login");
      },
    );
  }, []);

  async function logout() {
    try {
      await api.logout();
    } finally {
      void navigate("/");
      setExpired(false);
      setAccess("login");
    }
  }

  if (access === "checking") {
    return <p className="card narrow">Lädt …</p>;
  }
  if (access === "login") {
    return (
      <Login
        onLoggedIn={() => {
          setAccess("in");
        }}
        onSetup={() => {
          setAccess("setup");
        }}
      />
    );
  }
  if (access === "setup") {
    const toLogin = () => {
      setAccess("login");
    };
    return <Setup onDone={toLogin} onBack={toLogin} />;
  }

  return (
    <>
      <Shell onLogout={() => void logout()} />
      {expired && (
        <div
          className="overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Sitzung abgelaufen"
        >
          <Login
            title="Sitzung abgelaufen"
            onLoggedIn={() => {
              setExpired(false);
            }}
          />
          <p className="card narrow note">
            Bitte erneut anmelden. Die geöffnete Ansicht bleibt erhalten; nicht
            gespeicherter Text geht nicht verloren – danach einfach noch einmal
            speichern.
          </p>
        </div>
      )}
    </>
  );
}

export { appTitle } from "./title";
