import { useCallback, useState, type SyntheticEvent } from "react";
import { api, describeError, FORMS, type Form, type Story } from "../api";
import { useLoad } from "../useLoad";
import { ErrorText, Field } from "./Common";

/** Stories of a world; open one or create a new one. */
export function Stories({
  world,
  onOpen,
}: {
  world: string;
  onOpen: (story: Story) => void;
}) {
  const load = useCallback(() => api.stories(world), [world]);
  const { data, error } = useLoad(load);
  const [title, setTitle] = useState("");
  const [form, setForm] = useState<Form>("roman");
  const [perspective, setPerspective] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  async function create(event: SyntheticEvent) {
    event.preventDefault();
    setCreateError(null);
    try {
      const clean = perspective.trim();
      onOpen(
        await api.createStory(world, title, form, clean === "" ? null : clean),
      );
    } catch (reason: unknown) {
      setCreateError(describeError(reason));
    }
  }

  return (
    <div className="stack">
      <section className="card">
        <h2>Geschichten</h2>
        <ErrorText message={error} />
        {data?.length === 0 && <p>Noch keine Geschichte.</p>}
        <ul className="list">
          {(data ?? []).map((story) => (
            <li key={story.id}>
              <button
                type="button"
                className="link"
                onClick={() => {
                  onOpen(story);
                }}
              >
                {story.title}
              </button>
              <small> ({FORMS.find((f) => f.id === story.form)?.label})</small>
            </li>
          ))}
        </ul>
      </section>
      <form className="card" onSubmit={(event) => void create(event)}>
        <h2>Neue Geschichte</h2>
        <Field label="Titel">
          <input
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
            }}
            required
          />
        </Field>
        <Field label="Form">
          <select
            value={form}
            onChange={(event) => {
              setForm(event.target.value as Form);
            }}
          >
            {FORMS.map(({ id, label }) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Erzählperspektive (optional)">
          <input
            value={perspective}
            onChange={(event) => {
              setPerspective(event.target.value);
            }}
          />
        </Field>
        <ErrorText message={createError} />
        <button type="submit">Geschichte anlegen</button>
      </form>
    </div>
  );
}
