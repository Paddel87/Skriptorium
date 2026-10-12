import { useId, useRef, useState, type ChangeEvent } from "react";
import { api, describeError, type Story } from "../api";
import { base64, IMAGE_SIDE, shrinkImage } from "../files";
import { coverPrompt } from "../imagePrompts";
import { ErrorText } from "./Common";
import { ImageGenerate } from "./ImageGenerate";

/**
 * The story's cover (step 7.11, ADR-075), at the top of the story bar: shown, changed and removed
 * here; it becomes the cover of the e-book. Stored as JPEG, which every e-book reader shows.
 */
export function StoryCover({
  story,
  onSaved,
}: {
  story: Story;
  onSaved: (story: Story) => void;
}) {
  const heading = useId();
  const picker = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [choosing, setChoosing] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function change(work: () => Promise<Story>) {
    setBusy(true);
    setError(null);
    try {
      onSaved(await work());
    } catch (reason: unknown) {
      setError(describeError(reason));
    } finally {
      setBusy(false);
    }
  }

  async function choose(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file === undefined) {
      return;
    }
    await change(async () =>
      api.setCover(
        story.world,
        story.id,
        await base64(await shrinkImage(file, IMAGE_SIDE, true)),
      ),
    );
  }

  return (
    <section className="style-section story-cover" aria-labelledby={heading}>
      <h3 id={heading}>Titelbild</h3>
      {story.cover === null ? (
        <>
          <button
            type="button"
            className="story-cover-add"
            aria-expanded={choosing}
            disabled={busy}
            onClick={() => {
              setChoosing((open) => !open);
            }}
          >
            ＋ Titelbild hinzufügen
          </button>
          <p className="note">Am besten Hochformat, z. B. 1.600 × 2.560.</p>
        </>
      ) : (
        <div className="story-cover-row">
          <img
            src={api.coverPath(story)}
            alt={`Titelbild von ${story.title}`}
          />
          <div className="story-cover-actions">
            <button
              type="button"
              className="ghost"
              aria-expanded={choosing}
              disabled={busy}
              onClick={() => {
                setChoosing((open) => !open);
              }}
            >
              Titelbild ändern
            </button>
            <button
              type="button"
              className="ghost"
              disabled={busy}
              onClick={() => {
                if (window.confirm("Titelbild wirklich entfernen?")) {
                  void change(() => api.removeCover(story.world, story.id));
                }
              }}
            >
              Entfernen
            </button>
          </div>
        </div>
      )}
      {choosing && (
        <div className="add-choice" role="menu">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setChoosing(false);
              picker.current?.click();
            }}
          >
            Bild hochladen
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setChoosing(false);
              setGenerating(true);
            }}
          >
            ✨ Bild erzeugen
          </button>
        </div>
      )}
      {generating && (
        <ImageGenerate
          title="Titelbild erzeugen"
          initialPrompt={coverPrompt(story)}
          initialFormat="2:3"
          onTakeOver={async (image) => {
            onSaved(
              await api.setCover(
                story.world,
                story.id,
                await base64(await shrinkImage(image, IMAGE_SIDE, true)),
              ),
            );
          }}
          onClose={() => {
            setGenerating(false);
          }}
        />
      )}
      {busy && <p className="note">Bild wird verkleinert und gespeichert …</p>}
      {story.cover !== null && !busy && (
        <p className="note">Erscheint als Umschlag im E-Book.</p>
      )}
      <input
        ref={picker}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => void choose(event)}
      />
      <ErrorText message={error} />
    </section>
  );
}
