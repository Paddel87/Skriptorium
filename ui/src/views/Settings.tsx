import { useCallback, useState } from "react";
import {
  api,
  describeError,
  type ImageModelList,
  type ModelList,
  type ModelTask,
} from "../api";
import { optionLabel, shortName } from "../models";
import { useLoad } from "../useLoad";
import { ErrorText } from "./Common";
import { ModelManager } from "./ModelManager";

/** Which models a task can take: text models, text models that read images, image models. */
type TaskKind = "text" | "reading" | "image";

const TASKS: readonly {
  task: ModelTask;
  label: string;
  note?: string;
  kind: TaskKind;
}[] = [
  {
    task: "schreiben",
    label: "Schreiben",
    note: "für Geschichten ohne eigenes Modell",
    kind: "text",
  },
  { task: "weltenbau", label: "Weltenbauer", kind: "text" },
  {
    task: "kurzfassung",
    label: "Kapitel-Kurzfassung",
    note: "läuft nach „Kapitel abschließen“",
    kind: "text",
  },
  {
    task: "gesamtzusammenfassung",
    label: "Gesamtzusammenfassung",
    note: "direkt danach",
    kind: "text",
  },
  {
    task: "bildbeschreibung",
    label: "Bild beschreiben",
    note: "nur Modelle, die Bilder lesen",
    kind: "reading",
  },
  { task: "aussehen", label: "Aussehen herauslösen", kind: "text" },
  {
    task: "bilderzeugung",
    label: "Bilder erzeugen",
    note: "Bildmodelle",
    kind: "image",
  },
];

/** One entry of a selection field. */
interface Choice {
  id: string;
  label: string;
}

/**
 * Settings (step 9.7, ADR-096): the model each AI task starts with. Every change is saved at once
 * on the server; a task without a model of its own takes the preset of the program. In the task
 * itself another choice holds only for that once.
 */
export function Settings() {
  const loadModels = useCallback(() => api.models(), []);
  const loadImages = useCallback(() => api.imageModels(), []);
  const models = useLoad(loadModels);
  const images = useLoad(loadImages);
  const [savedList, setSavedList] = useState<ModelList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [managing, setManaging] = useState(false);
  const list = savedList ?? models.data;
  // The image list names the saved model as its preset; the program's own only without one.
  const programImage =
    models.data?.tasks.bilderzeugung === null
      ? images.data?.models.find((m) => m.id === images.data?.default)
      : undefined;

  async function choose(current: ModelList, task: ModelTask, value: string) {
    setError(null);
    try {
      setSavedList(
        await api.setTaskModels({
          ...current.tasks,
          [task]: value === "" ? null : value,
        }),
      );
    } catch (reason: unknown) {
      setError(describeError(reason));
    }
  }

  return (
    <div className="stack">
      <section className="card" aria-label="Modell je Aufgabe">
        <h2>Modell je Aufgabe</h2>
        <p className="note">
          Mit diesem Modell beginnt jede Aufgabe. In der Aufgabe kannst du für
          ein Mal ein anderes wählen.
        </p>
        <ErrorText message={models.error ?? images.error ?? error} />
        {list === undefined && models.error === null && (
          <p className="note">Modelle laden …</p>
        )}
        {list !== undefined && (
          <div className="task-models">
            {TASKS.map((row) => (
              <TaskRow
                key={row.task}
                label={row.label}
                note={row.note}
                saved={list.tasks[row.task]}
                presetLabel={presetLabel(row.kind, list, programImage)}
                choices={choices(
                  row.kind,
                  list.tasks[row.task],
                  list,
                  images.data,
                )}
                gone={isGone(row.kind, list.tasks[row.task], list, images.data)}
                onChoose={(value) => void choose(list, row.task, value)}
              />
            ))}
          </div>
        )}
        {list !== undefined && (
          <p>
            <button
              type="button"
              className="link"
              onClick={() => {
                setManaging(true);
              }}
            >
              Modelle verwalten …
            </button>{" "}
            <span className="note">– Favoriten wie bisher</span>
          </p>
        )}
        <p className="note">
          Jede Änderung wird sofort gespeichert und gilt auf allen Geräten.
        </p>
      </section>
      {managing && list !== undefined && (
        <ModelManager
          list={list}
          onChange={setSavedList}
          onClose={() => {
            setManaging(false);
          }}
        />
      )}
    </div>
  );
}

function TaskRow({
  label,
  note,
  saved,
  presetLabel,
  choices,
  gone,
  onChoose,
}: {
  label: string;
  note: string | undefined;
  saved: string | null;
  presetLabel: string;
  choices: Choice[];
  gone: boolean;
  onChoose: (value: string) => void;
}) {
  return (
    <label className="task-model">
      <span>
        <b>{label}</b>
        {note !== undefined && <span className="note"> {note}</span>}
      </span>
      <span className="task-model-choice">
        <select
          value={saved ?? ""}
          onChange={(event) => {
            onChoose(event.target.value);
          }}
        >
          <option value="">{presetLabel}</option>
          {choices.map((choice) => (
            <option key={choice.id} value={choice.id}>
              {choice.label}
            </option>
          ))}
        </select>
        {gone && (
          <span className="error">
            Nicht mehr im Angebot – es gilt die Voreinstellung.
          </span>
        )}
      </span>
    </label>
  );
}

/** "Voreinstellung (…)": the model the task takes without a choice of its own. */
function presetLabel(
  kind: TaskKind,
  list: ModelList,
  programImage: { name: string } | undefined,
): string {
  const named = (id: string) =>
    `Voreinstellung (${shortName(
      list.catalog.find((m) => m.id === id),
      id,
    )})`;
  if (kind === "image") {
    return programImage === undefined
      ? "Voreinstellung des Programms"
      : `Voreinstellung (${programImage.name})`;
  }
  if (kind === "reading") {
    // As "Von der KI beschreiben lassen" picks it (step 7.13).
    const reading = [list.default, ...list.favorites].find((id) =>
      list.catalog.some((m) => m.id === id && m.reads_images),
    );
    return reading === undefined
      ? "Voreinstellung (erstes Modell, das Bilder liest)"
      : named(reading);
  }
  return named(list.default);
}

/** The models a task offers besides the preset; the saved one always stays among them. */
function choices(
  kind: TaskKind,
  saved: string | null,
  list: ModelList,
  images: ImageModelList | undefined,
): Choice[] {
  if (kind === "image") {
    const found = (images?.models ?? []).map((m) => ({
      id: m.id,
      label: m.name,
    }));
    return withSaved(found, saved, (id) => id);
  }
  const label = (id: string) =>
    optionLabel(
      list.catalog.find((m) => m.id === id),
      id,
      list.favorites.includes(id),
    );
  let ids = list.favorites;
  if (kind === "reading" && list.catalog_available) {
    const reading = list.catalog.filter((m) => m.reads_images).map((m) => m.id);
    ids = [
      ...reading.filter((id) => list.favorites.includes(id)),
      ...reading.filter((id) => !list.favorites.includes(id)),
    ];
  }
  return withSaved(
    ids.map((id) => ({ id, label: label(id) })),
    saved,
    label,
  );
}

function withSaved(
  found: Choice[],
  saved: string | null,
  label: (id: string) => string,
): Choice[] {
  if (saved === null || found.some((choice) => choice.id === saved)) {
    return found;
  }
  return [...found, { id: saved, label: label(saved) }];
}

/** Whether the saved model of a task is missing from the loaded offer. */
function isGone(
  kind: TaskKind,
  saved: string | null,
  list: ModelList,
  images: ImageModelList | undefined,
): boolean {
  if (saved === null) {
    return false;
  }
  if (kind === "image") {
    return (
      images !== undefined &&
      images.available &&
      !images.models.some((m) => m.id === saved)
    );
  }
  return list.catalog_available && !list.catalog.some((m) => m.id === saved);
}
