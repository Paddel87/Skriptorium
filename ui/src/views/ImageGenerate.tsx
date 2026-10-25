import { useEffect, useState, type ReactNode } from "react";
import {
  api,
  describeError,
  formatCost,
  type AspectRatio,
  type GeneratedImage,
  type ImageOrigin,
  type ImagePrice,
} from "../api";
import { ErrorText } from "./Common";
import type { Basis } from "./ImageOriginPanel";

const FORMATS: readonly { id: AspectRatio; label: string }[] = [
  { id: "2:3", label: "Hochformat" },
  { id: "1:1", label: "Quadrat" },
  { id: "3:2", label: "Quer" },
];

/**
 * "Bild erzeugen" (step 7.12, ADR-077): a description from the canon to change, format and model
 * with the price beforehand; "Erzeugen" shows a preview with the real cost. Nothing is stored
 * until "Übernehmen", which hands the image and its origin (model, description, format, cost;
 * step 9.6, ADR-095) to the caller's usual upload. With a `basis` (step 9.8, ADR-097) a stored
 * image goes along to the model: the description says what should change, only models that take
 * a basis are offered, and the format follows the basis until the author picks one.
 */
export function ImageGenerate({
  title,
  initialPrompt,
  initialFormat,
  initialModel = null,
  takeOverLabel = "Übernehmen",
  hint = null,
  extra = null,
  basis = null,
  onTakeOver,
  onClose,
}: {
  title: string;
  initialPrompt: string;
  initialFormat: AspectRatio;
  /** The model to preselect, e.g. when generating anew from an origin (step 9.6). */
  initialModel?: string | null;
  takeOverLabel?: string;
  /**
   * A note above the description, e.g. that an entry has no looks yet (step 7.16), with a button
   * to add them (step 9.5, ADR-094).
   */
  hint?: ReactNode;
  /** More choices above the description, e.g. the places of a map (step 9.5, ADR-094). */
  extra?: ReactNode;
  /** A stored image the new one is made from (step 9.8). */
  basis?: Basis | null;
  onTakeOver: (image: Blob, origin: ImageOrigin) => Promise<void>;
  onClose: () => void;
}) {
  const [prompt, setPrompt] = useState(initialPrompt);
  // A new starting text (places chosen, looks added) replaces the description (step 9.5).
  const [shownInitial, setShownInitial] = useState(initialPrompt);
  if (initialPrompt !== shownInitial) {
    setShownInitial(initialPrompt);
    setPrompt(initialPrompt);
  }
  const [format, setFormat] = useState<AspectRatio>(initialFormat);
  // Until the author picks a format, it follows the proportions of the basis.
  const [formatPicked, setFormatPicked] = useState(false);
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
  const withBasis = basis !== null;

  useEffect(() => {
    let current = true;
    api
      .imageModels()
      .then((list) => {
        if (!current) {
          return;
        }
        const offered = withBasis
          ? list.models.filter((m) => m.references > 0)
          : list.models;
        setModels(offered);
        setReady(list.ready);
        const wanted = [initialModel, list.default];
        const preset =
          wanted.find((id) => offered.some((m) => m.id === id)) ??
          offered[0]?.id ??
          "";
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
  }, [initialModel, withBasis]);

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
          ...(basis === null ? {} : { reference: basis.reference }),
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
      await onTakeOver(blobOf(result), {
        model: result.model,
        prompt: prompt.trim(),
        aspect_ratio: format,
        cost_usd: result.cost_usd,
        ...(basis === null ? {} : { basis: shortLabel(basis.label) }),
      });
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
          {hint !== null && <div className="image-generate-hint">{hint}</div>}
          {extra}
          {basis !== null && (
            <div className="image-generate-basis">
              <img
                src={basis.src}
                alt=""
                onLoad={(event) => {
                  const { naturalWidth, naturalHeight } = event.currentTarget;
                  if (!formatPicked && naturalWidth > 0 && naturalHeight > 0) {
                    setFormat(nearestFormat(naturalWidth / naturalHeight));
                  }
                }}
              />
              <div>
                <b>Grundlage</b>
                <span className="note">
                  {basis.label} · geht mit an das Bildmodell
                </span>
              </div>
            </div>
          )}
          <label className="image-generate-field">
            {basis === null
              ? "Bildbeschreibung (änderbar)"
              : "Was soll sich ändern?"}
            <textarea
              rows={5}
              maxLength={4000}
              value={prompt}
              placeholder={
                basis === null
                  ? undefined
                  : "z. B. derselbe Mann im Winter, mit schwerem Wollmantel"
              }
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
                  setFormatPicked(true);
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
          {models !== null && models.length > 0 && initialModel === null && (
            <p className="note">
              Aus den Einstellungen. Eine andere Wahl gilt nur für dieses Bild.
            </p>
          )}
          {models !== null && models.length === 0 && error === null && (
            <p className="note">
              {basis === null
                ? "Gerade sind keine Bildmodelle verfügbar."
                : "Gerade nimmt kein Bildmodell ein Ausgangsbild an."}
            </p>
          )}
          <p className="note">
            {describePrice(price)}
            {basis !== null &&
              price !== null &&
              ` · ${describeBasisPrice(price)}`}
          </p>
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

/** The server keeps at most this many characters of the basis's description (ADR-097). */
const MAX_BASIS_LABEL = 200;

/**
 * The description of the basis as the origin keeps it: a long entry name is cut with "…", so
 * taking over a paid image never fails on its length.
 */
export function shortLabel(label: string): string {
  return label.length <= MAX_BASIS_LABEL
    ? label
    : `${label.slice(0, MAX_BASIS_LABEL - 1)}…`;
}

/** What the basis costs, shown after the price of the new image (step 9.8). */
export function describeBasisPrice(price: ImagePrice): string {
  const cost = price.input_cost_usd ?? null;
  if (cost === null || price.input_unit == null) {
    return "Grundlage: Preis vom Anbieter nicht ausgewiesen";
  }
  if (cost === 0) {
    return "Grundlage ohne Aufpreis";
  }
  if (price.input_unit === "image") {
    return `Grundlage ${formatCost(cost)}`;
  }
  if (price.input_unit === "megapixel") {
    return `Grundlage ${formatCost(cost)} je Megapixel`;
  }
  return "Grundlage nach Verbrauch";
}

/** The offered format closest to the proportions `ratio` (width / height) of an image. */
export function nearestFormat(ratio: number): AspectRatio {
  const distance = (id: AspectRatio) => {
    const [width = 1, height = 1] = id.split(":").map(Number);
    return Math.abs(Math.log(ratio / (width / height)));
  };
  return FORMATS.map((entry) => entry.id).reduce((best, id) =>
    distance(id) < distance(best) ? id : best,
  );
}

function blobOf(image: GeneratedImage): Blob {
  const binary = atob(image.content);
  const bytes = new Uint8Array(binary.length);
  for (let at = 0; at < binary.length; at++) {
    bytes[at] = binary.charCodeAt(at);
  }
  return new Blob([bytes], { type: image.media_type });
}
