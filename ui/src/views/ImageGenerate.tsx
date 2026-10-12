import { useEffect, useState } from "react";
import {
  api,
  describeError,
  formatCost,
  type AspectRatio,
  type GeneratedImage,
  type ImagePrice,
} from "../api";
import { ErrorText } from "./Common";

const FORMATS: readonly { id: AspectRatio; label: string }[] = [
  { id: "2:3", label: "Hochformat" },
  { id: "1:1", label: "Quadrat" },
  { id: "3:2", label: "Quer" },
];

/**
 * "Bild erzeugen" (step 7.12, ADR-077): a description from the canon to change, format and model
 * with the price beforehand; "Erzeugen" shows a preview with the real cost. Nothing is stored
 * until "Übernehmen", which hands the image to the caller's usual upload.
 */
export function ImageGenerate({
  title,
  initialPrompt,
  initialFormat,
  takeOverLabel = "Übernehmen",
  onTakeOver,
  onClose,
}: {
  title: string;
  initialPrompt: string;
  initialFormat: AspectRatio;
  takeOverLabel?: string;
  onTakeOver: (image: Blob) => Promise<void>;
  onClose: () => void;
}) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [format, setFormat] = useState<AspectRatio>(initialFormat);
  const [models, setModels] = useState<{ id: string; name: string }[] | null>(
    null,
  );
  const [model, setModel] = useState("");
  // The price with the model it belongs to, so a stale one is never shown.
  const [priced, setPriced] = useState<{
    model: string;
    price: ImagePrice;
  } | null>(null);
  const [ready, setReady] = useState(true);
  const [busy, setBusy] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [result, setResult] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    api
      .imageModels()
      .then((list) => {
        if (!current) {
          return;
        }
        setModels(list.models);
        setReady(list.ready);
        const preset = list.models.some((m) => m.id === list.default)
          ? list.default
          : (list.models[0]?.id ?? "");
        setModel(preset);
      })
      .catch((reason: unknown) => {
        if (current) {
          setError(describeError(reason));
          setModels([]);
        }
      });
    return () => {
      current = false;
    };
  }, []);

  useEffect(() => {
    if (model === "") {
      return;
    }
    let current = true;
    api
      .imagePrice(model)
      .then((found) => {
        if (current) {
          setPriced({ model, price: found });
        }
      })
      .catch(() => {
        if (current) {
          setPriced({ model, price: { cost_usd: null, unit: null } });
        }
      });
    return () => {
      current = false;
    };
  }, [model]);

  useEffect(() => {
    if (!busy) {
      return;
    }
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, [busy]);

  async function generate() {
    setStartedAt(Date.now());
    setNow(Date.now());
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(
        await api.generateImage({
          model,
          prompt: prompt.trim(),
          aspect_ratio: format,
        }),
      );
    } catch (reason: unknown) {
      setError(describeError(reason));
    } finally {
      setBusy(false);
    }
  }

  async function takeOver() {
    if (result === null) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onTakeOver(blobOf(result));
      onClose();
    } catch (reason: unknown) {
      setError(describeError(reason));
      setBusy(false);
    }
  }

  const name = models?.find((m) => m.id === model)?.name ?? model;
  const price = priced?.model === model ? priced.price : null;
  const seconds = Math.max(0, Math.round((now - startedAt) / 1000));

  return (
    <div className="image-generate" role="group" aria-label={title}>
      <h3>{title}</h3>
      {!ready && (
        <p className="note">
          Der KI-Anbieter ist nicht eingerichtet – Bilder erzeugen geht gerade
          nicht.
        </p>
      )}
      {result === null ? (
        <>
          <label className="image-generate-field">
            Bildbeschreibung (änderbar)
            <textarea
              rows={5}
              maxLength={4000}
              value={prompt}
              disabled={busy}
              onChange={(event) => {
                setPrompt(event.target.value);
              }}
            />
          </label>
          <div
            className="image-generate-formats"
            role="radiogroup"
            aria-label="Format"
          >
            {FORMATS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                role="radio"
                aria-checked={format === entry.id}
                className={format === entry.id ? "chosen" : undefined}
                disabled={busy}
                onClick={() => {
                  setFormat(entry.id);
                }}
              >
                {entry.label}
              </button>
            ))}
          </div>
          {models !== null && models.length > 0 && (
            <label className="image-generate-field">
              Modell
              <select
                value={model}
                disabled={busy}
                onChange={(event) => {
                  setModel(event.target.value);
                }}
              >
                {models.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {models !== null && models.length === 0 && error === null && (
            <p className="note">Gerade sind keine Bildmodelle verfügbar.</p>
          )}
          <p className="note">{describePrice(price)}</p>
        </>
      ) : (
        <>
          <img
            className="image-generate-preview"
            src={`data:${result.media_type};base64,${result.content}`}
            alt="Vorschau des erzeugten Bildes"
          />
          <p className="note">
            {name} ·{" "}
            {result.cost_usd === null
              ? "Kosten nicht gemeldet"
              : `Kosten ${formatCost(result.cost_usd)}`}
          </p>
        </>
      )}
      {busy && result === null && (
        <p className="note">Bild wird erzeugt … {String(seconds)} s</p>
      )}
      <ErrorText message={error} />
      <div className="row">
        {result === null ? (
          <button
            type="button"
            className="primary"
            disabled={busy || !ready || model === "" || prompt.trim() === ""}
            onClick={() => void generate()}
          >
            ✨ Erzeugen
          </button>
        ) : (
          <>
            <button
              type="button"
              className="primary"
              disabled={busy}
              onClick={() => void takeOver()}
            >
              {takeOverLabel}
            </button>
            <button
              type="button"
              className="ghost"
              disabled={busy}
              onClick={() => void generate()}
            >
              Neu erzeugen
            </button>
            <button
              type="button"
              className="ghost"
              disabled={busy}
              onClick={() => {
                setResult(null);
              }}
            >
              Beschreibung ändern
            </button>
          </>
        )}
        <button
          type="button"
          className="ghost"
          disabled={busy && result !== null}
          onClick={onClose}
        >
          {result === null ? "Abbrechen" : "Verwerfen"}
        </button>
      </div>
    </div>
  );
}

/** The price shown before generating. */
export function describePrice(price: ImagePrice | null): string {
  if (price === null) {
    return "Preis wird geladen …";
  }
  if (price.cost_usd === null || price.unit === null) {
    return "Preis unbekannt";
  }
  if (price.unit === "image") {
    return `ca. ${formatCost(price.cost_usd)} je Bild`;
  }
  if (price.unit === "megapixel") {
    return `ca. ${formatCost(price.cost_usd)} je Bild (1 Megapixel)`;
  }
  return "Abrechnung nach Verbrauch – die Kosten stehen nach dem Erzeugen da";
}

function blobOf(image: GeneratedImage): Blob {
  const binary = atob(image.content);
  const bytes = new Uint8Array(binary.length);
  for (let at = 0; at < binary.length; at++) {
    bytes[at] = binary.charCodeAt(at);
  }
  return new Blob([bytes], { type: image.media_type });
}
