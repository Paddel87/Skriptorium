import {
  useCallback,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from "react";
import {
  api,
  describeError,
  type CanonEntry,
  type ImageOrigin,
  type World,
} from "../api";
import { base64, MAP_SIDE, shrinkImage } from "../files";
import { ErrorText } from "./Common";
import { mapPrompt } from "../imagePrompts";
import { ImageGenerate } from "./ImageGenerate";
import type { GenerateSeed } from "./ImageOriginPanel";
import { useLoad } from "../useLoad";

/** File and name of a new map; the browser shrinks the file before upload. */
export function AddMap({
  world,
  seed = null,
  onDone,
}: {
  world: World;
  /** Opens "Karte erzeugen" right away with the origin of another map (step 9.6, ADR-095). */
  seed?: GenerateSeed | null;
  onDone: (saved: World | null) => void;
}) {
  // A chosen file or a generated map (step 7.12); both go the same checked way. A generated
  // map keeps its origin (step 9.6, ADR-095).
  const [file, setFile] = useState<Blob | null>(null);
  const [origin, setOrigin] = useState<ImageOrigin | null>(null);
  const [generating, setGenerating] = useState(seed !== null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The places of the world for "Karte erzeugen" (step 9.5, ADR-094); all are chosen until the
  // author takes some out, so the set holds the ones left out.
  const loadEntries = useCallback(() => api.entries(world.id), [world.id]);
  const entries = useLoad(loadEntries);
  const [leftOut, setLeftOut] = useState<ReadonlySet<string>>(new Set());
  const places = (entries.data ?? []).filter(
    (entry) => entry.category === "ort",
  );
  const chosen = places.filter((place) => !leftOut.has(place.id));

  function choose(event: ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0] ?? null;
    setFile(chosen);
    setOrigin(null);
    if (chosen !== null && name.trim() === "") {
      setName(chosen.name.replace(/\.[^.]*$/, ""));
    }
  }

  async function save(event: SyntheticEvent) {
    event.preventDefault();
    if (file === null) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const content = await base64(await shrinkImage(file, MAP_SIDE));
      onDone(await api.addMap(world.id, name.trim(), content, origin));
    } catch (reason: unknown) {
      setError(describeError(reason));
      setBusy(false);
    }
  }

  return (
    <form className="map-add-form" onSubmit={(event) => void save(event)}>
      <label>
        Datei
        <input type="file" accept="image/*" onChange={choose} />
      </label>
      <div className="row">
        <button
          type="button"
          className="ghost"
          disabled={busy}
          onClick={() => {
            setGenerating(true);
          }}
        >
          ✨ Karte erzeugen
        </button>
        {origin !== null && (
          <span className="note">Erzeugte Karte ist bereit.</span>
        )}
      </div>
      {generating && (
        <ImageGenerate
          title="Karte erzeugen"
          initialPrompt={seed?.prompt ?? mapPrompt(world, name, chosen)}
          extra={
            seed === null && places.length > 0 ? (
              <MapPlaces
                places={places}
                leftOut={leftOut}
                onChange={setLeftOut}
              />
            ) : null
          }
          initialFormat={seed?.format ?? "3:2"}
          initialModel={seed?.model ?? null}
          takeOverLabel="Für diese Karte verwenden"
          onTakeOver={(image, taken) => {
            setFile(image);
            setOrigin(taken);
            if (name.trim() === "") {
              setName(world.name);
            }
            return Promise.resolve();
          }}
          onClose={() => {
            setGenerating(false);
          }}
        />
      )}
      <label>
        Name
        <input
          value={name}
          maxLength={200}
          placeholder="z. B. Seekarte"
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
      </label>
      <div className="row">
        <button
          type="submit"
          className="primary"
          disabled={busy || file === null || name.trim() === ""}
        >
          {busy ? "Wird verkleinert und gespeichert …" : "Speichern"}
        </button>
        <button
          type="button"
          className="ghost"
          disabled={busy}
          onClick={() => {
            onDone(null);
          }}
        >
          Abbrechen
        </button>
      </div>
      <ErrorText message={error} />
    </form>
  );
}

/** The places of the world to tick for a generated map (step 9.5, ADR-094). */
function MapPlaces({
  places,
  leftOut,
  onChange,
}: {
  places: readonly CanonEntry[];
  leftOut: ReadonlySet<string>;
  onChange: (leftOut: ReadonlySet<string>) => void;
}) {
  return (
    <fieldset className="map-places">
      <legend className="note">
        Orte auf der Karte (aus dem Kanon) ·{" "}
        <button
          type="button"
          className="link"
          onClick={() => {
            onChange(new Set());
          }}
        >
          alle
        </button>{" "}
        ·{" "}
        <button
          type="button"
          className="link"
          onClick={() => {
            onChange(new Set(places.map((place) => place.id)));
          }}
        >
          keine
        </button>
      </legend>
      <div className="map-places-list">
        {places.map((place) => (
          <label key={place.id}>
            <input
              type="checkbox"
              checked={!leftOut.has(place.id)}
              onChange={(event) => {
                const next = new Set(leftOut);
                if (event.target.checked) {
                  next.delete(place.id);
                } else {
                  next.add(place.id);
                }
                onChange(next);
              }}
            />
            {place.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
