import Panzoom, { type PanzoomObject } from "@panzoom/panzoom";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from "react";
import { api, describeError, type World, type WorldMap } from "../api";
import { base64, MAP_SIDE, shrinkImage } from "../files";
import { ErrorText } from "./Common";
import { ImageDescription, withSection } from "./ImageDescription";

/** As many maps as the server keeps per world (`MAX_MAPS_PER_WORLD`). */
const MAX_MAPS = 20;

/**
 * The maps of a world (step 7.10, ADR-073): tiles with their names, "＋ Karte hinzufügen" asks
 * for a file and a name. A tap opens the map large with zoom (two fingers, mouse wheel, ＋ / −)
 * and panning, renaming, removing and "Von der KI beschreiben lassen" (step 7.13).
 */
export function WorldMaps({
  world,
  onChanged,
}: {
  world: World;
  onChanged: (world: World) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [shown, setShown] = useState<string | null>(null);
  const open = world.maps.find((map) => map.file === shown);

  return (
    <section className="card">
      <h2>Karten</h2>
      {world.maps.length === 0 && !adding && (
        <p className="note">
          Noch keine Karte – „＋ Karte hinzufügen“ legt die erste an.
        </p>
      )}
      <div className="map-tiles">
        {world.maps.map((map) => (
          <button
            key={map.file}
            type="button"
            className="map-tile"
            onClick={() => {
              setShown(map.file);
            }}
          >
            <img src={api.mapPath(world.id, map.file)} alt="" />
            <span>{map.name}</span>
          </button>
        ))}
        {!adding && world.maps.length < MAX_MAPS && (
          <button
            type="button"
            className="map-tile map-add"
            onClick={() => {
              setAdding(true);
            }}
          >
            ＋ Karte hinzufügen
          </button>
        )}
      </div>
      {adding && (
        <AddMap
          world={world.id}
          onDone={(saved) => {
            setAdding(false);
            if (saved !== null) {
              onChanged(saved);
            }
          }}
        />
      )}
      {open !== undefined && (
        <MapViewer
          world={world}
          map={open}
          onChanged={onChanged}
          onClose={() => {
            setShown(null);
          }}
        />
      )}
    </section>
  );
}

/** File and name of a new map; the browser shrinks the file before upload. */
function AddMap({
  world,
  onDone,
}: {
  world: string;
  onDone: (saved: World | null) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function choose(event: ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0] ?? null;
    setFile(chosen);
    if (chosen !== null && name.trim() === "") {
      setName(chosen.name.replace(/\.[^.]*$/, ""));
    }
  }

  async function save(event: SyntheticEvent) {
    event.preventDefault();
    if (file === null) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const content = await base64(await shrinkImage(file, MAP_SIDE));
      onDone(await api.addMap(world, name.trim(), content));
    } catch (reason: unknown) {
      setError(describeError(reason));
      setBusy(false);
    }
  }

  return (
    <form className="map-add-form" onSubmit={(event) => void save(event)}>
      <label>
        Datei
        <input type="file" accept="image/*" onChange={choose} />
      </label>
      <label>
        Name
        <input
          value={name}
          maxLength={200}
          placeholder="z. B. Seekarte"
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
      </label>
      <div className="row">
        <button
          type="submit"
          className="primary"
          disabled={busy || file === null || name.trim() === ""}
        >
          {busy ? "Wird verkleinert und gespeichert …" : "Speichern"}
        </button>
        <button
          type="button"
          className="ghost"
          disabled={busy}
          onClick={() => {
            onDone(null);
          }}
        >
          Abbrechen
        </button>
      </div>
      <ErrorText message={error} />
    </form>
  );
}

/** One map over the page with zoom and panning; Escape closes. */
function MapViewer({
  world,
  map,
  onChanged,
  onClose,
}: {
  world: World;
  map: WorldMap;
  onChanged: (world: World) => void;
  onClose: () => void;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLImageElement>(null);
  const zoom = useRef<PanzoomObject | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [describing, setDescribing] = useState(false);
  const [name, setName] = useState(map.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const element = content.current;
    const parent = stage.current;
    if (element === null || parent === null) {
      return;
    }
    const panzoom = Panzoom(element, { minScale: 1, maxScale: 10 });
    zoom.current = panzoom;
    parent.addEventListener("wheel", panzoom.zoomWithWheel);
    return () => {
      parent.removeEventListener("wheel", panzoom.zoomWithWheel);
      panzoom.destroy();
      zoom.current = null;
    };
  }, []);

  useEffect(() => {
    function key(event: KeyboardEvent) {
      // Escape in a field (a name, a description) leaves the field, not the map.
      const field =
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLInputElement;
      if (event.key === "Escape" && !field) {
        onClose();
      }
    }
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
    };
  }, [onClose]);

  async function change(work: () => Promise<World>) {
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

  return (
    <div className="overlay image-viewer-veil">
      <div
        className="map-viewer"
        role="dialog"
        aria-modal="true"
        aria-label={`Karte ${map.name}`}
      >
        <p className="map-viewer-title">{map.name}</p>
        <div className="map-stage" ref={stage}>
          <img
            ref={content}
            src={api.mapPath(world.id, map.file)}
            alt={map.name}
          />
          <div className="map-zoom">
            <button
              type="button"
              aria-label="Vergrößern"
              onClick={() => zoom.current?.zoomIn()}
            >
              ＋
            </button>
            <button
              type="button"
              aria-label="Verkleinern"
              onClick={() => zoom.current?.zoomOut()}
            >
              −
            </button>
            <button
              type="button"
              aria-label="Ganze Karte zeigen"
              onClick={() => zoom.current?.reset()}
            >
              ⤢
            </button>
          </div>
        </div>
        {renaming ? (
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
        ) : (
          <div className="image-viewer-bar">
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
              onClick={() => {
                setDescribing(true);
              }}
            >
              ✨ Von der KI beschreiben lassen
            </button>
            <span className="image-viewer-gap" />
            <button type="button" className="ghost" onClick={onClose}>
              Schließen
            </button>
          </div>
        )}
        <ErrorText message={error} />
        {describing && (
          <ImageDescription
            title={`Geografie – ${map.name}`}
            path={api.describeMapPath(world.id, map.file)}
            takeOverLabel="In die Weltbeschreibung übernehmen"
            onTakeOver={async (text) => {
              onChanged(
                await api.updateWorld(world.id, {
                  description: withSection(
                    world.description,
                    `Geografie – ${map.name}`,
                    text,
                  ),
                }),
              );
            }}
            onClose={() => {
              setDescribing(false);
            }}
          />
        )}
        <p className="map-viewer-hint">
          Zwei Finger oder Mausrad zum Zoomen, ziehen zum Verschieben.
        </p>
      </div>
    </div>
  );
}
