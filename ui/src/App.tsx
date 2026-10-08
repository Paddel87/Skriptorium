import { useEffect, useState } from "react";
import { api, setUnauthorizedHandler, type Story, type World } from "./api";
import { Account } from "./views/Account";
import { Login } from "./views/Login";
import { Setup } from "./views/Setup";
import { StoryPage } from "./views/StoryPage";
import { WorldPage } from "./views/WorldPage";
import { Worlds } from "./views/Worlds";

type Screen =
  | { kind: "worlds" }
  | { kind: "world"; world: World }
  | { kind: "story"; world: World; story: Story }
  | { kind: "account" };

type Access = "checking" | "login" | "setup" | "in";

/** Root component: access check, then the screens of the logged-in author. */
export function App() {
  const [access, setAccess] = useState<Access>("checking");
  const [screen, setScreen] = useState<Screen>({ kind: "worlds" });
  // Session ended while working: log in again above the open screen, so unsaved text stays.
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
      setScreen({ kind: "worlds" });
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
    <div className="app">
      <header className={screen.kind === "story" ? "top wide" : "top"}>
        <button
          type="button"
          className="link brand"
          onClick={() => {
            setScreen({ kind: "worlds" });
          }}
        >
          {appTitle()}
        </button>
        <Breadcrumb screen={screen} onScreen={setScreen} />
        <span className="spacer" />
        <button
          type="button"
          className="link"
          onClick={() => {
            setScreen({ kind: "account" });
          }}
        >
          Konto
        </button>
        <button type="button" onClick={() => void logout()}>
          Abmelden
        </button>
      </header>
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
      <main className={screen.kind === "story" ? "wide" : undefined}>
        {screen.kind === "worlds" && (
          <Worlds
            onOpen={(world) => {
              setScreen({ kind: "world", world });
            }}
          />
        )}
        {screen.kind === "world" && (
          <WorldPage
            world={screen.world}
            onOpenStory={(story) => {
              setScreen({ kind: "story", world: screen.world, story });
            }}
          />
        )}
        {screen.kind === "story" && <StoryPage story={screen.story} />}
        {screen.kind === "account" && <Account />}
      </main>
    </div>
  );
}

function Breadcrumb({
  screen,
  onScreen,
}: {
  screen: Screen;
  onScreen: (screen: Screen) => void;
}) {
  if (screen.kind === "world") {
    return <span className="crumb">› {screen.world.name}</span>;
  }
  if (screen.kind === "story") {
    return (
      <span className="crumb">
        ›{" "}
        <button
          type="button"
          className="link"
          onClick={() => {
            onScreen({ kind: "world", world: screen.world });
          }}
        >
          {screen.world.name}
        </button>{" "}
        › {screen.story.title}
      </span>
    );
  }
  return null;
}

/** Title shown in the header. */
export function appTitle(): string {
  return "Skriptorium";
}
