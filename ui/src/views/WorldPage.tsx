import { useState, type SyntheticEvent } from "react";
import { api, describeError, type Story, type World } from "../api";
import { Canon } from "./Canon";
import { ErrorText, Field } from "./Common";
import { Import } from "./Import";
import { Stories } from "./Stories";

type Tab = "canon" | "import" | "stories" | "world";

const TABS: readonly { id: Tab; label: string }[] = [
  { id: "stories", label: "Geschichten" },
  { id: "canon", label: "Kanon" },
  { id: "import", label: "Import" },
  { id: "world", label: "Welt" },
];

/** A world with its tabs: stories, canon, import, description. */
export function WorldPage({
  world,
  onOpenStory,
}: {
  world: World;
  onOpenStory: (story: Story) => void;
}) {
  const [tab, setTab] = useState<Tab>("stories");
  const [current, setCurrent] = useState(world);
  const [canonRound, setCanonRound] = useState(0);

  return (
    <div className="stack">
      <nav className="tabs" aria-label="Bereiche der Welt">
        {TABS.map(({ id, label }) => (
          <button
            type="button"
            key={id}
            aria-current={tab === id}
            onClick={() => {
              setTab(id);
            }}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === "stories" && <Stories world={current.id} onOpen={onOpenStory} />}
      {tab === "canon" && <Canon key={canonRound} world={current.id} />}
      {tab === "import" && (
        <Import
          world={current.id}
          onImported={() => {
            setCanonRound((round) => round + 1);
          }}
        />
      )}
      {tab === "world" && <WorldForm world={current} onSaved={setCurrent} />}
    </div>
  );
}

function WorldForm({
  world,
  onSaved,
}: {
  world: World;
  onSaved: (world: World) => void;
}) {
  const [name, setName] = useState(world.name);
  const [description, setDescription] = useState(world.description);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save(event: SyntheticEvent) {
    event.preventDefault();
    setError(null);
    try {
      onSaved(await api.updateWorld(world.id, { name, description }));
      setSaved(true);
    } catch (reason: unknown) {
      setError(describeError(reason));
    }
  }

  return (
    <form className="card" onSubmit={(event) => void save(event)}>
      <h2>Welt</h2>
      <Field label="Name">
        <input
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setSaved(false);
          }}
          required
        />
      </Field>
      <Field label="Beschreibung und Grundregeln">
        <textarea
          rows={12}
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            setSaved(false);
          }}
        />
      </Field>
      <ErrorText message={error} />
      {saved && <p className="ok">Gespeichert.</p>}
      <button type="submit">Speichern</button>
    </form>
  );
}
