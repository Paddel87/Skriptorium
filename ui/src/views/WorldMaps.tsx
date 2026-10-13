import Panzoom, { type PanzoomObject } from "@panzoom/panzoom";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from "react";
import {
  api,
  describeError,
  type CanonEntry,
  type MapMarker,
  type World,
  type WorldMap,
} from "../api";
import { base64, MAP_SIDE, shrinkImage } from "../files";
import { ErrorText } from "./Common";
import { mapPrompt } from "../imagePrompts";
import { ImageDescription, withSection } from "./ImageDescription";
import { ImageGenerate } from "./ImageGenerate";
import { MarkerLayer, MarkerPicker, shareOf } from "./MapMarkers";

/** As many maps as the server keeps per world (`MAX_MAPS_PER_WORLD`). */
const MAX_MAPS = 20;

/**
 * The maps of a world (step 7.10, ADR-073): tiles with their names, "＋ Karte hinzufügen" asks
 * for a file and a name. A tap opens the map large with zoom (two fingers, mouse wheel, ＋ / −)
 * and panning, renaming, removing and "Von der KI beschreiben lassen" (step 7.13), and with
 * points that lead to canon entries (step 7.14, ADR-079).
 */
export function WorldMaps({
  world,
  onChanged,
  onOpenEntry,
}: {
  world: World;
  onChanged: (world: World) => void;
  onOpenEntry: (entry: string) => void;
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
          world={world}
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
          onOpenEntry={onOpenEntry}
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
  world: World;
  onDone: (saved: World | null) => void;
}) {
  // A chosen file or a generated map (step 7.12); both go the same checked way.
  const [file, setFile] = useState<Blob | null>(null);
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function choose(event: ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0] ?? null;
    setFile(chosen);
    setGenerated(false);
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
      onDone(await api.addMap(world.id, name.trim(), content));
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
      <div className="row">
        <button
          type="button"
          className="ghost"
          disabled={busy}
          onClick={() => {
            setGenerating(true);
          }}
        >
          ✨ Karte erzeugen
        </button>
        {generated && <span className="note">Erzeugte Karte ist bereit.</span>}
      </div>
      {generating && (
        <ImageGenerate
          title="Karte erzeugen"
          initialPrompt={mapPrompt(world, name)}
          initialFormat="3:2"
          takeOverLabel="Für diese Karte verwenden"
          onTakeOver={(image) => {
            setFile(image);
            setGenerated(true);
            if (name.trim() === "") {
              setName(world.name);
            }
            return Promise.resolve();
          }}
          onClose={() => {
            setGenerating(false);
          }}
        />
      )}
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
  onOpenEntry,
  onClose,
}: {
  world: World;
  map: WorldMap;
  onChanged: (world: World) => void;
  onOpenEntry: (entry: string) => void;
  onClose: () => void;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const zoom = useRef<PanzoomObject | null>(null);
  const tap = useRef<{ x: number; y: number } | null>(null);
  const [fit, setFit] = useState<{ width: number; height: number } | null>(
    null,
  );
  const [renaming, setRenaming] = useState(false);
  const [describing, setDescribing] = useState(false);
  const [marking, setMarking] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, setPending] = useState<{
    x: number;
    y: number;
    replaces?: string;
  } | null>(null);
  const [entries, setEntries] = useState<CanonEntry[]>([]);
  const [name, setName] = useState(map.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const byId = new Map(entries.map((entry) => [entry.id, entry]));

  useEffect(() => {
    let current = true;
    api.entries(world.id).then(
      (found) => {
        if (current) {
          setEntries(found);
        }
      },
      (reason: unknown) => {
        if (current) {
          setError(describeError(reason));
        }
      },
    );
    return () => {
      current = false;
    };
  }, [world.id]);

  useEffect(() => {
    const element = content.current;
    const parent = stage.current;
    if (element === null || parent === null) {
      return;
    }
    const panzoom = Panzoom(element, { minScale: 1, maxScale: 10 });
    zoom.current = panzoom;
    // Points keep their size on screen while the map grows.
    function scaled(event: Event) {
      const scale = (event as CustomEvent<{ scale: number }>).detail.scale;
      element?.style.setProperty("--marker-scale", String(1 / scale));
    }
    parent.addEventListener("wheel", panzoom.zoomWithWheel);
    element.addEventListener("panzoomchange", scaled);
    return () => {
      parent.removeEventListener("wheel", panzoom.zoomWithWheel);
      element.removeEventListener("panzoomchange", scaled);
      panzoom.destroy();
      zoom.current = null;
    };
  }, []);

  // The map's box takes exactly the shape of the image, so points sit where they belong.
  function measure(image: HTMLImageElement | null) {
    const parent = stage.current;
    if (image === null || parent === null || image.naturalWidth === 0) {
      return;
    }
    const room = { width: parent.clientWidth, height: parent.clientHeight };
    if (room.width === 0 || room.height === 0) {
      return;
    }
    const ratio = image.naturalWidth / image.naturalHeight;
    setFit(
      room.width / room.height > ratio
        ? { width: room.height * ratio, height: room.height }
        : { width: room.width, height: room.width / ratio },
    );
  }

  // The stage shrinks when the note or the entry list appear; the map follows.
  useEffect(() => {
    const parent = stage.current;
    function resized() {
      measure(content.current?.querySelector("img") ?? null);
    }
    window.addEventListener("resize", resized);
    const watcher =
      typeof ResizeObserver === "undefined" || parent === null
        ? null
        : new ResizeObserver(resized);
    if (parent !== null) {
      watcher?.observe(parent);
    }
    return () => {
      window.removeEventListener("resize", resized);
      watcher?.disconnect();
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

  function saveMarkers(markers: MapMarker[]) {
    return change(() => api.setMarkers(world.id, map.file, markers));
  }

  // A tap on the map (not a drag, not a pinch): in the mode a new point, else hide the name.
  function tapped(clientX: number, clientY: number) {
    if (!marking) {
      setSelected(null);
      return;
    }
    const place =
      content.current === null
        ? null
        : shareOf(content.current, clientX, clientY);
    if (place !== null) {
      setSelected(null);
      setPending(place);
    }
  }

  const taken = new Set(
    map.markers
      .map((marker) => marker.entry)
      .filter((entry) => entry !== pending?.replaces),
  );

  return (
    <div className="overlay image-viewer-veil">
      <div
        className="map-viewer"
        role="dialog"
        aria-modal="true"
        aria-label={`Karte ${map.name}`}
      >
        <p className="map-viewer-title">{map.name}</p>
        {marking && (
          <p className="map-marking-note">
            Tippe auf die Karte, um einen Punkt zu setzen. Punkte ziehen
            verschiebt sie.
          </p>
        )}
        <div className="map-stage" ref={stage}>
          <div
            className="map-content"
            ref={content}
            data-testid="map-content"
            style={
              fit === null
                ? undefined
                : { width: fit.width, height: fit.height }
            }
            // Capture phase: Panzoom stops the pointer going down from bubbling further.
            onPointerDownCapture={(event) => {
              // A second finger (pinch) never counts as a tap.
              tap.current = event.isPrimary
                ? { x: event.clientX, y: event.clientY }
                : null;
            }}
            onPointerUp={(event) => {
              const from = tap.current;
              tap.current = null;
              if (
                from !== null &&
                Math.hypot(event.clientX - from.x, event.clientY - from.y) < 6
              ) {
                tapped(event.clientX, event.clientY);
              }
            }}
          >
            <img
              src={api.mapPath(world.id, map.file)}
              alt={map.name}
              draggable={false}
              onLoad={(event) => {
                measure(event.currentTarget);
              }}
            />
            <MarkerLayer
              markers={map.markers}
              entries={byId}
              map={content}
              marking={marking}
              selected={selected}
              onSelect={(entry) => {
                setPending(null);
                setSelected((now) =>
                  now === entry && !marking ? null : entry,
                );
              }}
              onMove={(entry, x, y) => {
                void saveMarkers(
                  map.markers.map((m) =>
                    m.entry === entry ? { entry, x, y } : m,
                  ),
                );
              }}
              onOpen={onOpenEntry}
            />
            {pending !== null && (
              <span
                className="map-marker pending"
                style={{
                  left: `${String(pending.x * 100)}%`,
                  top: `${String(pending.y * 100)}%`,
                }}
              />
            )}
          </div>
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
        {pending !== null && (
          <MarkerPicker
            entries={entries}
            taken={taken}
            busy={busy}
            onPick={(entry) => {
              const kept = map.markers.filter(
                (m) => m.entry !== pending.replaces,
              );
              void saveMarkers([
                ...kept,
                { entry, x: pending.x, y: pending.y },
              ]).then((done) => {
                if (done) {
                  setPending(null);
                }
              });
            }}
            onCancel={() => {
              setPending(null);
            }}
          />
        )}
        {marking ? (
          <MarkingBar
            selected={selected}
            busy={busy}
            onRemove={(entry) => {
              void saveMarkers(map.markers.filter((m) => m.entry !== entry));
              setSelected(null);
            }}
            onReassign={(entry) => {
              const marker = map.markers.find((m) => m.entry === entry);
              if (marker !== undefined) {
                setPending({ x: marker.x, y: marker.y, replaces: entry });
              }
            }}
            onDone={() => {
              setMarking(false);
              setPending(null);
              setSelected(null);
            }}
          />
        ) : renaming ? (
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
                setMarking(true);
                setSelected(null);
              }}
            >
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
              // The current description, in case it changed elsewhere meanwhile.
              const fresh = (await api.worlds()).find((w) => w.id === world.id);
              onChanged(
                await api.updateWorld(world.id, {
                  description: withSection(
                    fresh?.description ?? world.description,
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
          {marking
            ? "Zwei Finger oder Mausrad zum Zoomen."
            : "Zwei Finger oder Mausrad zum Zoomen, ziehen zum Verschieben. Punkt antippen zeigt den Namen."}
        </p>
      </div>
    </div>
  );
}

/** The bar in the mode "Markieren": what to do with a chosen point, and "Fertig". */
function MarkingBar({
  selected,
  busy,
  onRemove,
  onReassign,
  onDone,
}: {
  selected: string | null;
  busy: boolean;
  onRemove: (entry: string) => void;
  onReassign: (entry: string) => void;
  onDone: () => void;
}) {
  return (
    <div className="image-viewer-bar">
      {selected !== null && (
        <>
          <button
            type="button"
            className="ghost"
            disabled={busy}
            onClick={() => {
              onRemove(selected);
            }}
          >
            Punkt entfernen
          </button>
          <button
            type="button"
            className="ghost"
            disabled={busy}
            onClick={() => {
              onReassign(selected);
            }}
          >
            Anderer Eintrag
          </button>
        </>
      )}
      <span className="image-viewer-gap" />
      <button type="button" className="map-marking-done" onClick={onDone}>
        Fertig
      </button>
    </div>
  );
}
