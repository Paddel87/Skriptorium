import { useCallback, useState } from "react";
import { api, type Story } from "../api";
import { useNavigation } from "../paths";
import { useLoad } from "../useLoad";
import { CanonLookup } from "./CanonLookup";
import { ChapterEditor } from "./ChapterEditor";
import { ErrorText } from "./Common";
import { Facts } from "./Facts";
import { Guests } from "./Guests";
import { MenuButton } from "./Menu";
import { StorySummary } from "./StorySummary";
import { ModeLine, WritingMode } from "./WritingMode";

type SideTab = "kanon" | "geschichte";

/**
 * One story, laid out for writing like a chat (step 5.11): the open chapter fills the middle,
 * its text scrolls with the AI's proposal at the end, the instruction stays at the bottom. On
 * demand a bar on the right holds the canon to look up and the settings of the story
 * (Figuren-Schreibweise, guests, facts, overall summary); on small screens it lies over the page.
 * Chapters are chosen in the list on the left.
 */
export function StoryPage({
  story: initial,
  chapter,
}: {
  story: Story;
  /** Number of the open chapter; the first one without it. */
  chapter?: number;
}) {
  // Settings saved on this page win over the story passed in until the page is left.
  const [saved, setStory] = useState<Story | null>(null);
  const story = saved?.id === initial.id ? saved : initial;
  const { revision, refresh } = useNavigation();
  const load = useCallback(
    () => api.chapters(story.world, story.id),
    [story.world, story.id],
  );
  const { data, error, reload } = useLoad(load, revision);
  const [side, setSide] = useState(false);
  const [tab, setTab] = useState<SideTab>("kanon");
  const [canonRound, setCanonRound] = useState(0);
  // Counts "ändern" in the short line; the form of the writing mode then opens.
  const [modeRound, setModeRound] = useState(0);

  const chapters = data ?? [];
  const current = chapters.find((c) => c.number === chapter) ?? chapters[0];

  const sideToggle = (
    <button
      type="button"
      className={side ? "primary side-toggle" : "side-toggle"}
      aria-label="Kanon & Geschichte"
      aria-expanded={side}
      aria-controls="story-side"
      onClick={() => {
        setSide(!side);
      }}
    >
      <span className="wide-only">Kanon &amp; Geschichte</span>
      <span className="narrow-only" aria-hidden="true">
        📖
      </span>
    </button>
  );

  return (
    <div className={side ? "story with-side" : "story"}>
      <div className="story-main">
        <ErrorText message={error} />
        {current !== undefined ? (
          <ChapterEditor
            key={current.number}
            chapter={current}
            story={story}
            onSaved={() => {
              reload();
              refresh();
            }}
            onStory={setStory}
            onCanonChanged={() => {
              setCanonRound((round) => round + 1);
            }}
            lead={<MenuButton />}
            tools={sideToggle}
            mode={
              <ModeLine
                story={story}
                onChange={() => {
                  setSide(true);
                  setTab("geschichte");
                  setModeRound((round) => round + 1);
                }}
              />
            }
          />
        ) : (
          <>
            <header className="chapter-bar">
              <MenuButton />
              <span className="crumb">{story.title}</span>
              <span className="spacer" />
              {sideToggle}
            </header>
            {data !== undefined && (
              <p className="card note empty-story">
                Noch kein Kapitel – lege links in der Liste unter der Geschichte
                eines an („+ Kapitel“).
              </p>
            )}
          </>
        )}
      </div>
      {side && (
        <aside
          id="story-side"
          className="story-side"
          aria-label="Kanon und Geschichte"
        >
          <div className="row side-head">
            <nav className="tabs" aria-label="Kanon oder Geschichte">
              <button
                type="button"
                aria-current={tab === "kanon"}
                onClick={() => {
                  setTab("kanon");
                }}
              >
                Kanon
              </button>
              <button
                type="button"
                aria-current={tab === "geschichte"}
                onClick={() => {
                  setTab("geschichte");
                }}
              >
                Geschichte
              </button>
            </nav>
            <span className="spacer" />
            <button
              type="button"
              aria-label="Leiste schließen"
              onClick={() => {
                setSide(false);
              }}
            >
              ✕
            </button>
          </div>
          {tab === "kanon" ? (
            <CanonLookup
              key={canonRound}
              world={story.world}
              guests={story.guest_links}
            />
          ) : (
            <div className="stack">
              <WritingMode
                key={modeRound}
                story={story}
                onSaved={setStory}
                startOpen={modeRound > 0}
              />
              <Guests story={story} onSaved={setStory} />
              <Facts story={story} onSaved={setStory} />
              <StorySummary
                key={story.summary}
                story={story}
                onSaved={setStory}
              />
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
