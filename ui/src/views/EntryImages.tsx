import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { api, describeError, type CanonEntry } from "../api";
import { base64, shrinkImage } from "../files";
import { ErrorText } from "./Common";
import { ImageDescription, withSection } from "./ImageDescription";

/** As many images as the server keeps per entry (`MAX_IMAGES_PER_ENTRY`). */
const MAX_IMAGES = 12;

/**
 * The images of a canon entry (step 7.6, ADR-072): the first is the main image, large above the
 * text; the others follow as small previews, "＋" adds one. A tap shows an image large, with
 * browsing, "Zum Hauptbild machen", "Entfernen" and "Von der KI beschreiben lassen" (step 7.13).
 * Without `editable` (guests, the compact bar) the images are only shown.
 */
export function EntryImages({
  entry,
  editable,
  onChanged,
}: {
  entry: CanonEntry;
  editable: boolean;
  onChanged: (entry: CanonEntry) => void;
}) {
  const [shown, setShown] = useState<number | null>(null);
  const [describing, setDescribing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const picker = useRef<HTMLInputElement>(null);
  const images = entry.images;
  const source = (image: string) => api.imagePath(entry.world, entry.id, image);

  if (images.length === 0 && !editable) {
    return null;
  }

  async function change(work: () => Promise<CanonEntry>) {
    setBusy(true);
    setError(null);
    try {
      onChanged(await work());
      return true;
    } catch (reason: unknown) {
      setError(describeError(reason));
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function add(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file === undefined) {
      return;
    }
    await change(async () =>
      api.addImage(
        entry.world,
        entry.id,
        await base64(await shrinkImage(file)),
      ),
    );
  }

  return (
    <div className="entry-images">
      {images[0] !== undefined && (
        <button
          type="button"
          className="entry-image-main"
          onClick={() => {
            setShown(0);
          }}
        >
          <img src={source(images[0])} alt={`${entry.name}, Hauptbild`} />
        </button>
      )}
      {(images.length > 1 || editable) && (
        <div className="entry-image-thumbs">
          {images.map((image, at) => (
            <button
              key={image}
              type="button"
              className={at === 0 ? "chosen" : undefined}
              aria-label={`Bild ${String(at + 1)} groß zeigen`}
              onClick={() => {
                setShown(at);
              }}
            >
              <img src={source(image)} alt="" />
            </button>
          ))}
          {editable && images.length < MAX_IMAGES && (
            <button
              type="button"
              className="entry-image-add"
              aria-label="Bild hinzufügen"
              title="Bild hinzufügen"
              disabled={busy}
              onClick={() => picker.current?.click()}
            >
              ＋
            </button>
          )}
        </div>
      )}
      {editable && (
        <input
          ref={picker}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => void add(event)}
        />
      )}
      <p className="note entry-image-note">
        {busy
          ? "Bild wird verkleinert und gespeichert …"
          : images.length === 0
            ? "Noch kein Bild – „＋“ fügt eins hinzu"
            : `${String(images.length)} ${images.length === 1 ? "Bild" : "Bilder"} · Tipp auf ein Bild zeigt es groß`}
      </p>
      <ErrorText message={error} />
      {shown !== null && images[shown] !== undefined && (
        <ImageViewer
          name={entry.name}
          images={images}
          at={shown}
          source={source}
          editable={editable}
          busy={busy}
          onMove={(at) => {
            setShown(at);
            setDescribing(null);
          }}
          onClose={() => {
            setShown(null);
            setDescribing(null);
          }}
          onDescribe={setDescribing}
          onMain={(image) =>
            void change(() =>
              api.setMainImage(entry.world, entry.id, image),
            ).then((done) => {
              if (done) {
                setShown(0);
              }
            })
          }
          onRemove={(image) => {
            if (!window.confirm("Dieses Bild wirklich entfernen?")) {
              return;
            }
            void change(() =>
              api.removeImage(entry.world, entry.id, image),
            ).then((done) => {
              if (done) {
                setShown(images.length > 1 ? Math.max(0, shown - 1) : null);
                setDescribing(null);
              }
            });
          }}
        >
          {describing !== null && (
            <ImageDescription
              key={describing}
              title={`Aussehen von ${entry.name}`}
              path={api.describeImagePath(entry.world, entry.id, describing)}
              takeOverLabel="Übernehmen als „Aussehen“"
              onTakeOver={async (text) => {
                onChanged(
                  await api.updateEntry(entry.world, entry.id, {
                    body: withSection(entry.body, "Aussehen", text),
                  }),
                );
              }}
              onClose={() => {
                setDescribing(null);
              }}
            />
          )}
        </ImageViewer>
      )}
    </div>
  );
}

/** One image large over the page; arrow keys browse, Escape closes. */
function ImageViewer({
  name,
  images,
  at,
  source,
  editable,
  busy,
  onMove,
  onClose,
  onMain,
  onRemove,
  onDescribe,
  children,
}: {
  name: string;
  images: readonly string[];
  at: number;
  source: (image: string) => string;
  editable: boolean;
  busy: boolean;
  onMove: (at: number) => void;
  onClose: () => void;
  onMain: (image: string) => void;
  onRemove: (image: string) => void;
  onDescribe: (image: string) => void;
  /** Shown under the bar: the description of the image (step 7.13). */
  children?: ReactNode;
}) {
  const close = useRef<HTMLButtonElement>(null);
  const image = images[at] ?? "";
  const count = images.length;
  const label = `${name}, Bild ${String(at + 1)} von ${String(count)}`;

  useEffect(() => {
    close.current?.focus();
  }, []);

  useEffect(() => {
    function key(event: KeyboardEvent) {
      const target = event.target;
      const typing =
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLSelectElement;
      // Keys in a field (the description) stay in the field.
      if (typing) {
        return;
      }
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft" && count > 1) {
        onMove((at - 1 + count) % count);
      } else if (event.key === "ArrowRight" && count > 1) {
        onMove((at + 1) % count);
      }
    }
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
    };
  }, [at, count, onClose, onMove]);

  return (
    <div
      className="overlay image-viewer-veil"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={
          children === undefined || children === false || children === null
            ? "image-viewer"
            : "image-viewer describing"
        }
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <img src={source(image)} alt={label} />
        <div className="image-viewer-bar">
          {count > 1 && (
            <>
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  onMove((at - 1 + count) % count);
                }}
              >
                ‹ voriges
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  onMove((at + 1) % count);
                }}
              >
                nächstes ›
              </button>
            </>
          )}
          {editable && (
            <button
              type="button"
              className="ghost"
              disabled={busy}
              onClick={() => {
                onDescribe(image);
              }}
            >
              ✨ Von der KI beschreiben lassen
            </button>
          )}
          <span className="image-viewer-gap" />
          {editable && at > 0 && (
            <button
              type="button"
              className="ghost"
              disabled={busy}
              onClick={() => {
                onMain(image);
              }}
            >
              Zum Hauptbild machen
            </button>
          )}
          {editable && (
            <button
              type="button"
              className="ghost"
              disabled={busy}
              onClick={() => {
                onRemove(image);
              }}
            >
              Entfernen
            </button>
          )}
          <button ref={close} type="button" className="ghost" onClick={onClose}>
            Schließen
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
