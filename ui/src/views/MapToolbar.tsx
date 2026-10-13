import { useState } from "react";
import { api, type World, type WorldMap } from "../api";
import { readSection, removeSection, renameSection } from "../sections";

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
          const fresh = name.trim();
          let latest: World = world;
          void change(async () => {
            latest = await api.renameMap(world.id, map.file, fresh);
            return latest;
          }).then(async (done) => {
            if (!done) {
              return;
            }
            // The map's section in the description follows its name (step 8.4, ADR-083).
            const description = renameSection(
              latest.description,
              `Geografie – ${map.name}`,
              `Geografie – ${fresh}`,
            );
            if (description !== latest.description) {
              await change(() => api.updateWorld(world.id, { description }));
            }
            setRenaming(false);
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
            let latest: World = world;
            void change(async () => {
              latest = await api.removeMap(world.id, map.file);
              return latest;
            }).then(async (done) => {
              if (!done) {
                return;
              }
              // The section of the map in the description stays only if the author wants it
              // (step 8.4, ADR-083).
              const title = `Geografie – ${map.name}`;
              if (
                readSection(latest.description, title) !== null &&
                window.confirm(
                  `Abschnitt „${title}“ auch aus der Weltbeschreibung entfernen?`,
                )
              ) {
                await change(() =>
                  api.updateWorld(world.id, {
                    description: removeSection(latest.description, title),
                  }),
                );
              }
              onClose();
            });
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
