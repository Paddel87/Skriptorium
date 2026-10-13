import { useState } from "react";
import { api, type World, type WorldMap } from "../api";

/**
 * The bar of an open map outside the mode "Markieren": mark, rename (a small form instead of
 * the bar), remove, let the AI describe it, close.
 */
export function MapToolbar({
  world,
  map,
  busy,
  change,
  onMark,
  onDescribe,
  onClose,
}: {
  world: World;
  map: WorldMap;
  busy: boolean;
  change: (work: () => Promise<World>) => Promise<boolean>;
  onMark: () => void;
  onDescribe: () => void;
  onClose: () => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(map.name);

  if (renaming) {
    return (
      <form
        className="image-viewer-bar"
        onSubmit={(event) => {
          event.preventDefault();
          void change(() =>
            api.renameMap(world.id, map.file, name.trim()),
          ).then((done) => {
            if (done) {
              setRenaming(false);
            }
          });
        }}
      >
        <input
          aria-label="Name der Karte"
          value={name}
          maxLength={200}
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
        <button
          type="submit"
          className="ghost"
          disabled={busy || name.trim() === ""}
        >
          Speichern
        </button>
        <button
          type="button"
          className="ghost"
          onClick={() => {
            setRenaming(false);
            setName(map.name);
          }}
        >
          Abbrechen
        </button>
      </form>
    );
  }

  return (
    <div className="image-viewer-bar">
      <button type="button" className="ghost" onClick={onMark}>
        Markieren
      </button>
      <button
        type="button"
        className="ghost"
        onClick={() => {
          setRenaming(true);
        }}
      >
        Umbenennen
      </button>
      <button
        type="button"
        className="ghost"
        disabled={busy}
        onClick={() => {
          if (window.confirm(`Karte „${map.name}“ wirklich entfernen?`)) {
            void change(() => api.removeMap(world.id, map.file)).then(
              (done) => {
                if (done) {
                  onClose();
                }
              },
            );
          }
        }}
      >
        Entfernen
      </button>
      <button
        type="button"
        className="ghost"
        disabled={busy}
        onClick={onDescribe}
      >
        ✨ Von der KI beschreiben lassen
      </button>
      <span className="image-viewer-gap" />
      <button type="button" className="ghost" onClick={onClose}>
        Schließen
      </button>
    </div>
  );
}
