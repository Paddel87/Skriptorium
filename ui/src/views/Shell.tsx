import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  matchPath,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import { api } from "../api";
import {
  NavigationContext,
  useNavigation,
  worldPath,
  type WorldArea,
} from "../paths";
import { useLoad } from "../useLoad";
import { appTitle } from "../title";
import { Account } from "./Account";
import { ErrorText } from "./Common";
import { MenuButton, MenuContext } from "./Menu";
import { StoryList } from "./StoryList";
import { StoryPage } from "./StoryPage";
import { ThemeChoice } from "./ThemeChoice";
import { WorldPage } from "./WorldPage";
import { Worlds } from "./Worlds";

const AREAS: readonly WorldArea[] = [
  "geschichten",
  "kanon",
  "import",
  "beschreibung",
];

/**
 * Frame of the logged-in views (step 5.11): a narrow bar of symbols on the left that is always
 * there, next to it the list of worlds, stories and chapters, which can be folded away, and the
 * view of the address in the middle. On small screens bar and list open over the page as a menu.
 */
export function Shell({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => {
    setRevision((value) => value + 1);
  }, []);
  const navigation = useMemo(
    () => ({ revision, refresh }),
    [revision, refresh],
  );
  const [listOpen, setListOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const openMenu = useCallback(() => {
    setMenuOpen(true);
  }, []);
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const chapterMatch = matchPath(
    "/welt/:world/geschichte/:story/kapitel/:chapter",
    pathname,
  );
  const storyMatch =
    chapterMatch ?? matchPath("/welt/:world/geschichte/:story", pathname);
  const worldMatch = storyMatch ?? matchPath("/welt/:world/*", pathname);
  const world = worldMatch?.params.world;
  const chapter = Number(chapterMatch?.params.chapter);
  // Canon and import in the bar refer to the world opened last.
  const [lastWorld, setLastWorld] = useState<string | undefined>(world);
  if (world !== undefined && world !== lastWorld) {
    setLastWorld(world);
  }

  function go(path: string) {
    void navigate(path);
    closeMenu();
  }

  return (
    <NavigationContext.Provider value={navigation}>
      <MenuContext.Provider value={openMenu}>
        <div
          className={[
            "shell",
            listOpen ? "list-open" : "",
            menuOpen ? "menu-open" : "",
          ].join(" ")}
        >
          {menuOpen && (
            <div className="veil" aria-hidden="true" onClick={closeMenu} />
          )}
          <div className="side-nav">
            <nav className="rail" aria-label="Bereiche">
              <RailButton
                symbol="☰"
                label="Liste"
                pressed={listOpen}
                className="list-toggle"
                onClick={() => {
                  setListOpen(!listOpen);
                }}
              />
              <RailButton
                symbol="🌍"
                label="Welten"
                onClick={() => {
                  go("/");
                }}
              />
              <RailButton
                symbol="📖"
                label="Kanon"
                disabled={lastWorld === undefined}
                onClick={() => {
                  if (lastWorld !== undefined) {
                    go(worldPath(lastWorld, "kanon"));
                  }
                }}
              />
              <RailButton
                symbol="⤓"
                label="Import"
                disabled={lastWorld === undefined}
                onClick={() => {
                  if (lastWorld !== undefined) {
                    go(worldPath(lastWorld, "import"));
                  }
                }}
              />
              <span className="spacer" />
              <ThemeChoice />
              <RailButton
                symbol="⚙"
                label="Konto"
                onClick={() => {
                  go("/konto");
                }}
              />
              <RailButton symbol="⏻" label="Abmelden" onClick={onLogout} />
            </nav>
            <div className="list-pane">
              <button
                type="button"
                className="link close-menu"
                onClick={closeMenu}
              >
                Schließen
              </button>
              <StoryList
                world={world}
                story={storyMatch?.params.story}
                chapter={Number.isNaN(chapter) ? undefined : chapter}
                onGo={closeMenu}
              />
            </div>
          </div>
          <div className="main-col">
            {storyMatch === null && (
              <div className="mobile-bar">
                <MenuButton />
                <span className="brand">{appTitle()}</span>
              </div>
            )}
            <main className={storyMatch === null ? "page" : "writing"}>
              <Routes>
                <Route path="/" element={<WorldsRoute />} />
                <Route path="/konto" element={<Account />} />
                <Route
                  path="/welt/:world/geschichte/:story/kapitel/:chapter"
                  element={<StoryRoute />}
                />
                <Route
                  path="/welt/:world/geschichte/:story"
                  element={<StoryRoute />}
                />
                <Route path="/welt/:world/:area" element={<WorldRoute />} />
                <Route
                  path="/welt/:world"
                  element={<Navigate to="geschichten" replace />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </MenuContext.Provider>
    </NavigationContext.Provider>
  );
}

function RailButton({
  symbol,
  label,
  onClick,
  pressed,
  disabled,
  className,
}: {
  symbol: ReactNode;
  label: string;
  onClick: () => void;
  pressed?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={
        className === undefined ? "rail-button" : `rail-button ${className}`
      }
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
    >
      <span aria-hidden="true" className="symbol">
        {symbol}
      </span>
      {label}
    </button>
  );
}

/** Start: the worlds; a new world opens with its stories. */
function WorldsRoute() {
  const navigate = useNavigate();
  const { refresh } = useNavigation();
  return (
    <Worlds
      onOpen={(world) => {
        refresh();
        void navigate(worldPath(world.id));
      }}
    />
  );
}

/** A world with the area from the address. */
function WorldRoute() {
  const { world = "", area = "" } = useParams();
  const { revision } = useNavigation();
  const load = useCallback(() => api.worlds(), []);
  const { data, error } = useLoad(load, revision);
  if (!AREAS.includes(area as WorldArea)) {
    return <Navigate to={worldPath(world)} replace />;
  }
  const found = data?.find((w) => w.id === world);
  if (found === undefined) {
    return (
      <>
        <ErrorText message={error} />
        {data !== undefined && <p className="card">Welt nicht gefunden.</p>}
      </>
    );
  }
  return <WorldPage key={found.id} world={found} area={area as WorldArea} />;
}

/** A story with the chapter from the address (the first chapter without one). */
function StoryRoute() {
  const { world = "", story = "", chapter } = useParams();
  const { revision } = useNavigation();
  const load = useCallback(() => api.stories(world), [world]);
  const { data, error } = useLoad(load, revision);
  const found = data?.find((s) => s.id === story);
  if (found === undefined) {
    return (
      <>
        <ErrorText message={error} />
        {data !== undefined && (
          <p className="card">Geschichte nicht gefunden.</p>
        )}
      </>
    );
  }
  const number = Number(chapter);
  return (
    <StoryPage
      key={found.id}
      story={found}
      chapter={Number.isInteger(number) ? number : undefined}
    />
  );
}
