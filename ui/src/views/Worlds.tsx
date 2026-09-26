import { useCallback, useState, type SyntheticEvent } from "react";
import { api, describeError, type World } from "../api";
import { useLoad } from "../useLoad";
import { ErrorText, Field } from "./Common";

/** List of worlds; choose one or create a new one. */
export function Worlds({ onOpen }: { onOpen: (world: World) => void }) {
  const load = useCallback(() => api.worlds(), []);
  const { data, error } = useLoad(load);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  async function create(event: SyntheticEvent) {
    event.preventDefault();
    setCreateError(null);
    try {
      onOpen(await api.createWorld(name, description));
    } catch (reason: unknown) {
      setCreateError(describeError(reason));
    }
  }

  return (
    <div className="stack">
      <section className="card">
        <h2>Welten</h2>
        <ErrorText message={error} />
        {data?.length === 0 && <p>Noch keine Welt angelegt.</p>}
        <ul className="list">
          {(data ?? []).map((world) => (
            <li key={world.id}>
              <button
                type="button"
                className="link"
                onClick={() => {
                  onOpen(world);
                }}
              >
                {world.name}
              </button>
            </li>
          ))}
        </ul>
      </section>
      <form className="card" onSubmit={(event) => void create(event)}>
        <h2>Neue Welt</h2>
        <Field label="Name">
          <input
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
            required
          />
        </Field>
        <Field label="Beschreibung und Grundregeln">
          <textarea
            rows={4}
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
            }}
          />
        </Field>
        <ErrorText message={createError} />
        <button type="submit">Welt anlegen</button>
      </form>
    </div>
  );
}
