import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import { api, describeError, type World } from "../api";
import { base64, MAP_SIDE, shrinkImage } from "../files";
import { ErrorText } from "./Common";
import { mapPrompt } from "../imagePrompts";
import { ImageGenerate } from "./ImageGenerate";

/** File and name of a new map; the browser shrinks the file before upload. */
export function AddMap({
  world,
  onDone,
}: {
  world: World;
  onDone: (saved: World | null) => void;
}) {
  // A chosen file or a generated map (step 7.12); both go the same checked way.
  const [file, setFile] = useState<Blob | null>(null);
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function choose(event: ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0] ?? null;
    setFile(chosen);
    setGenerated(false);
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
      onDone(await api.addMap(world.id, name.trim(), content));
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
        {generated && <span className="note">Erzeugte Karte ist bereit.</span>}
      </div>
      {generating && (
        <ImageGenerate
          title="Karte erzeugen"
          initialPrompt={mapPrompt(world, name)}
          initialFormat="3:2"
          takeOverLabel="Für diese Karte verwenden"
          onTakeOver={(image) => {
            setFile(image);
            setGenerated(true);
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
