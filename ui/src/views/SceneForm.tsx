import { type CanonEntry } from "../api";
import { Field } from "./Common";

/** Place, characters and goal of a new scene (step 3.3, FR-008); guests are offered too. */
export function SceneForm({
  places,
  figures,
  shown,
  place,
  characters,
  goal,
  onPlace,
  onCharacters,
  onGoal,
}: {
  places: CanonEntry[];
  figures: CanonEntry[];
  /** Name of an entry, marked if it is a guest. */
  shown: (entry: CanonEntry) => string;
  place: string;
  characters: string[];
  goal: string;
  onPlace: (id: string) => void;
  onCharacters: (ids: string[]) => void;
  onGoal: (text: string) => void;
}) {
  return (
    <fieldset className="stack">
      <legend>Neue Szene</legend>
      <Field label="Ort">
        <select
          value={place}
          onChange={(event) => {
            onPlace(event.target.value);
          }}
        >
          <option value="">– kein Ort –</option>
          {places.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {shown(entry)}
            </option>
          ))}
        </select>
      </Field>
      <div className="row" role="group" aria-label="Figuren">
        {figures.map((entry) => (
          <label className="check" key={entry.id}>
            <input
              type="checkbox"
              checked={characters.includes(entry.id)}
              onChange={(event) => {
                onCharacters(
                  event.target.checked
                    ? [...characters, entry.id]
                    : characters.filter((id) => id !== entry.id),
                );
              }}
            />
            {shown(entry)}
          </label>
        ))}
      </div>
      <Field label="Ziel der Szene">
        <input
          value={goal}
          onChange={(event) => {
            onGoal(event.target.value);
          }}
        />
      </Field>
    </fieldset>
  );
}
