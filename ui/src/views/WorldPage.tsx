import { useState, type SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router";
import { api, describeError, type World } from "../api";
import { storyPath, useNavigation, worldPath, type WorldArea } from "../paths";
import { Canon } from "./Canon";
import { ErrorText, Field } from "./Common";
import { Import } from "./Import";
import { Stories } from "./Stories";

const AREAS: readonly { id: WorldArea; label: string }[] = [
  { id: "geschichten", label: "Geschichten" },
  { id: "kanon", label: "Kanon" },
  { id: "import", label: "Import" },
  { id: "beschreibung", label: "Welt" },
];

/** A world with its areas, each under its own address: stories, canon, import, description. */
export function WorldPage({ world, area }: { world: World; area: WorldArea }) {
  const navigate = useNavigate();
  const { refresh } = useNavigation();
  const [current, setCurrent] = useState(world);
  const [canonRound, setCanonRound] = useState(0);

  return (
    <div className="stack">
      <h1 className="page-title">{current.name}</h1>
      <nav className="tabs" aria-label="Bereiche der Welt">
        {AREAS.map(({ id, label }) => (
          <Link
            key={id}
            className="tab"
            to={worldPath(current.id, id)}
            aria-current={area === id ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      {area === "geschichten" && (
        <Stories
          world={current.id}
          onOpen={(story) => {
            refresh();
            void navigate(storyPath(current.id, story.id));
          }}
        />
      )}
      {area === "kanon" && <Canon key={canonRound} world={current.id} />}
      {area === "import" && (
        <Import
          world={current.id}
          onImported={() => {
            setCanonRound((round) => round + 1);
          }}
        />
      )}
      {area === "beschreibung" && (
        <WorldForm
          world={current}
          onSaved={(saved) => {
            setCurrent(saved);
            refresh();
          }}
        />
      )}
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
