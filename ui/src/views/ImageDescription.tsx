import { useEffect, useRef, useState } from "react";
import {
  api,
  describeError,
  streamDescription,
  type CatalogModel,
} from "../api";
import { describeWriteError } from "../api/writing";
import { taskModel } from "../models";
import { ErrorText } from "./Common";
import { describeUsage, type Usage } from "./useWriteFlow";

/**
 * "Von der KI beschreiben lassen" (step 7.13, ADR-074): choose a model that reads images, let it
 * look at the image once, change the text and take it over. Nothing is saved before
 * `onTakeOver`; the caller decides where the text goes ("Aussehen" or "Geografie – …").
 */
export function ImageDescription({
  title,
  path,
  takeOverLabel,
  onTakeOver,
  onClose,
}: {
  title: string;
  /** Address of the description stream of this image. */
  path: string;
  takeOverLabel: string;
  /** Resolves to `false` when the author cancelled: nothing was taken over, the dialog stays. */
  onTakeOver: (text: string) => Promise<boolean>;
  onClose: () => void;
}) {
  const [models, setModels] = useState<CatalogModel[] | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [model, setModel] = useState("");
  const [text, setText] = useState("");
  const [running, setRunning] = useState(false);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    let current = true;
    api
      .models()
      .then((list) => {
        if (!current) {
          return;
        }
        const seeing = list.catalog.filter((entry) => entry.reads_images);
        const saved = taskModel(list, "bildbeschreibung");
        const preferred = [saved, list.default, ...list.favorites].find((id) =>
          seeing.some((entry) => entry.id === id),
        );
        setModels(seeing);
        setFavorites(list.favorites);
        setModel(preferred ?? seeing[0]?.id ?? "");
      })
      .catch((reason: unknown) => {
        if (current) {
          setError(describeError(reason));
          setModels([]);
        }
      });
    return () => {
      current = false;
      abort.current?.abort();
    };
  }, []);

  async function describe() {
    const controller = new AbortController();
    abort.current = controller;
    setRunning(true);
    setText("");
    setUsage(null);
    setError(null);
    try {
      await streamDescription(
        path,
        model,
        (event) => {
          if (event.type === "text") {
            setText((before) => before + event.text);
          } else if (event.type === "done") {
            setUsage(event);
          } else if (event.type === "error") {
            setError(describeWriteError(event.kind));
          }
        },
        controller.signal,
      );
    } catch (reason: unknown) {
      if (!controller.signal.aborted) {
        setError(describeError(reason));
      }
    } finally {
      setRunning(false);
    }
  }

  async function takeOver() {
    setSaving(true);
    setError(null);
    try {
      if (!(await onTakeOver(text.trim()))) {
        setSaving(false);
        return;
      }
      onClose();
    } catch (reason: unknown) {
      setError(describeError(reason));
      setSaving(false);
    }
  }

  const done = !running && text.trim() !== "";

  return (
    <div className="image-description">
      <h3>{title}</h3>
      {models !== null && models.length === 0 && error === null && (
        <p className="note">
          Gerade ist kein Modell verfügbar, das Bilder lesen kann.
        </p>
      )}
      {models !== null && models.length > 0 && (
        <label className="image-description-model">
          Modell (liest Bilder)
          <select
            value={model}
            disabled={running}
            onChange={(event) => {
              setModel(event.target.value);
            }}
          >
            {groups(models, favorites).map(({ label, entries }) => (
              <optgroup key={label} label={label}>
                {entries.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
      )}
      {(running || text !== "") && (
        <textarea
          aria-label="Beschreibung"
          rows={8}
          value={text}
          readOnly={running}
          onChange={(event) => {
            setText(event.target.value);
          }}
        />
      )}
      {running && <p className="note">Die KI sieht sich das Bild an …</p>}
      {usage !== null && (
        <p className="note">
          {describeUsage(usage)} · Nur Sichtbares beschrieben – bitte prüfen
        </p>
      )}
      <ErrorText message={error} />
      <div className="row">
        {done ? (
          <>
            <button
              type="button"
              className="primary"
              disabled={saving}
              onClick={() => void takeOver()}
            >
              {takeOverLabel}
            </button>
            <button
              type="button"
              className="ghost"
              disabled={saving || model === ""}
              onClick={() => void describe()}
            >
              Neu beschreiben
            </button>
          </>
        ) : (
          <button
            type="button"
            className="primary"
            disabled={running || model === ""}
            onClick={() => void describe()}
          >
            Beschreiben lassen
          </button>
        )}
        <button
          type="button"
          className="ghost"
          disabled={saving}
          onClick={() => {
            abort.current?.abort();
            onClose();
          }}
        >
          {running ? "Abbrechen" : "Verwerfen"}
        </button>
      </div>
    </div>
  );
}

/** Your favorites that read images first, then all other models that read images. */
function groups(
  models: readonly CatalogModel[],
  favorites: readonly string[],
): { label: string; entries: CatalogModel[] }[] {
  const chosen = models.filter((entry) => favorites.includes(entry.id));
  const others = models.filter((entry) => !favorites.includes(entry.id));
  return [
    { label: "Deine Favoriten", entries: chosen },
    { label: "Weitere Modelle, die Bilder lesen", entries: others },
  ].filter((group) => group.entries.length > 0);
}
