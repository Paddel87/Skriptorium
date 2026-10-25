import { useEffect, useRef, useState } from "react";
import { api, describeError, streamDescription, type CanonEntry } from "../api";
import { describeWriteError } from "../api/writing";
import { taskModel } from "../models";
import { APPEARANCE } from "../sections";
import { ErrorText } from "./Common";
import { SectionConflict } from "./SectionConflict";
import { useSectionChoice } from "./useSectionChoice";
import { describeUsage, type Usage } from "./useWriteFlow";

/** The model's answer when the entry says nothing about looks (`NO_APPEARANCE`). */
const NO_APPEARANCE = "KEIN AUSSEHEN";

/**
 * "✨ Aussehen herauslösen" (step 7.16, ADR-078): a text model reads the figure's entry once and
 * proposes only the visible; the author changes it and takes it over as the section "Aussehen".
 * The rest of the entry stays as it is.
 */
export function AppearanceExtract({
  entry,
  onChanged,
  onClose,
}: {
  entry: CanonEntry;
  onChanged: (entry: CanonEntry) => void;
  onClose: () => void;
}) {
  const [models, setModels] = useState<{ id: string; name: string }[] | null>(
    null,
  );
  const [model, setModel] = useState("");
  const [text, setText] = useState("");
  const [running, setRunning] = useState(false);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const { place, asking } = useSectionChoice();

  useEffect(() => {
    let current = true;
    api
      .models()
      .then((list) => {
        if (!current) {
          return;
        }
        const names = new Map(list.catalog.map((m) => [m.id, m.name]));
        const saved = taskModel(list, "aussehen");
        const offered =
          saved === null || list.favorites.includes(saved)
            ? list.favorites
            : [saved, ...list.favorites];
        setModels(offered.map((id) => ({ id, name: names.get(id) ?? id })));
        setModel(
          saved ??
            (list.favorites.includes(list.default)
              ? list.default
              : (list.favorites[0] ?? "")),
        );
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

  async function extract() {
    const controller = new AbortController();
    abort.current = controller;
    setRunning(true);
    setText("");
    setUsage(null);
    setError(null);
    try {
      await streamDescription(
        api.appearancePath(entry.world, entry.id),
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
      // The current text, in case it changed elsewhere meanwhile.
      const fresh = await api.entry(entry.world, entry.id);
      const body = await place(fresh.body, APPEARANCE, text);
      if (body === null) {
        setSaving(false);
        return;
      }
      onChanged(await api.updateEntry(entry.world, entry.id, { body }));
      onClose();
    } catch (reason: unknown) {
      setError(describeError(reason));
      setSaving(false);
    }
  }

  const nothing = !running && text.trim() === NO_APPEARANCE;
  const done = !running && text.trim() !== "" && !nothing;

  return (
    <div className="image-description appearance-extract">
      <h3>Aussehen von {entry.name}</h3>
      {models !== null && models.length > 0 && (
        <label className="image-description-model">
          Modell (liest nur diesen Eintrag)
          <select
            value={model}
            disabled={running}
            onChange={(event) => {
              setModel(event.target.value);
            }}
          >
            {models.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {(running || done) && (
        <textarea
          aria-label="Aussehen"
          rows={6}
          value={text}
          readOnly={running}
          onChange={(event) => {
            setText(event.target.value);
          }}
        />
      )}
      {running && <p className="note">Die KI liest den Eintrag …</p>}
      {nothing && (
        <p className="note">
          Im Eintrag steht nichts über das Aussehen. Beschreibe es selbst oder
          lass es aus einem Bild beschreiben.
        </p>
      )}
      {usage !== null && <p className="note">{describeUsage(usage)}</p>}
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
              Übernehmen als „Aussehen“
            </button>
            <button
              type="button"
              className="ghost"
              disabled={saving}
              onClick={() => void extract()}
            >
              Neu herauslösen
            </button>
          </>
        ) : (
          <button
            type="button"
            className="primary"
            disabled={running || model === ""}
            onClick={() => void extract()}
          >
            Herauslösen
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
      <SectionConflict asking={asking} />
    </div>
  );
}
