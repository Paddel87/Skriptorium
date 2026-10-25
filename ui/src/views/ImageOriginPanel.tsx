import { useEffect, useRef, useState } from "react";
import {
  describeError,
  formatCost,
  type AspectRatio,
  type ImageReference,
  type StoredImageOrigin,
} from "../api";

/**
 * A stored image as the basis of a new one (step 9.8, ADR-097): where it is stored, how the
 * origin names it, and its address for the thumbnail.
 */
export interface Basis {
  reference: ImageReference;
  label: string;
  src: string;
}

/**
 * What "Bild erzeugen" starts with when an image is generated anew from its origin, or from an
 * image as its basis (step 9.8).
 */
export interface GenerateSeed {
  prompt: string;
  format: AspectRatio;
  model: string | null;
  basis?: Basis;
}

const FORMATS: readonly string[] = ["2:3", "1:1", "3:2"];

/** The seed for generating anew; a format the dialog does not offer falls back to `format`. */
export function seedOf(
  origin: StoredImageOrigin,
  format: AspectRatio,
): GenerateSeed {
  return {
    prompt: origin.prompt,
    format: FORMATS.includes(origin.aspect_ratio)
      ? (origin.aspect_ratio as AspectRatio)
      : format,
    model: origin.model,
  };
}

/**
 * "Herkunft" of a generated image (step 9.6, ADR-095): model, date, cost and description, folded
 * away; with `onRegenerate` a button opens "Bild erzeugen" with them. An uploaded image has no
 * origin and shows nothing. Remount with a `key` per image: the origin is loaded once.
 */
export function ImageOriginPanel({
  load,
  onRegenerate,
}: {
  load: () => Promise<StoredImageOrigin | null>;
  onRegenerate?: (origin: StoredImageOrigin) => void;
}) {
  const loader = useRef(load);
  const [origin, setOrigin] = useState<StoredImageOrigin | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    loader
      .current()
      .then((found) => {
        if (current) {
          setOrigin(found);
        }
      })
      .catch((reason: unknown) => {
        if (current) {
          setError(describeError(reason));
        }
      });
    return () => {
      current = false;
    };
  }, []);

  if (error !== null) {
    return <p className="note">Herkunft nicht lesbar: {error}</p>;
  }
  if (origin === null) {
    return null;
  }
  return (
    <details className="image-origin">
      <summary>Herkunft</summary>
      <dl>
        <dt>Modell</dt>
        <dd>{origin.model}</dd>
        <dt>Übernommen</dt>
        <dd>{formatDate(origin.date)}</dd>
        <dt>Kosten</dt>
        <dd>
          {origin.cost_usd === null
            ? "nicht gemeldet"
            : formatCost(origin.cost_usd)}
        </dd>
        {origin.basis !== null && (
          <>
            <dt>Grundlage</dt>
            <dd>{origin.basis}</dd>
          </>
        )}
        <dt>Anweisung</dt>
        <dd className="image-origin-prompt">{origin.prompt}</dd>
      </dl>
      {onRegenerate !== undefined && (
        <button
          type="button"
          className="ghost"
          onClick={() => {
            onRegenerate(origin);
          }}
        >
          ✨ Mit dieser Anweisung neu erzeugen
        </button>
      )}
    </details>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });
}
