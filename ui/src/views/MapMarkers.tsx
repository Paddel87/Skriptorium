import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { CATEGORIES, type CanonEntry, type MapMarker } from "../api";

/** How far (in screen pixels) a pointer may move and still count as a tap, not a drag. */
const TAP_DISTANCE = 6;

/** The label of an entry's category, as on the canon page. */
export function categoryLabel(entry: CanonEntry) {
  return CATEGORIES.find((c) => c.id === entry.category)?.label ?? "";
}

/**
 * The place of a pointer on the map as shares of its width and height (0 to 1), from the
 * map's box on screen; zoom and panning are part of that box.
 */
export function shareOf(
  map: HTMLElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } | null {
  const box = map.getBoundingClientRect();
  if (box.width === 0 || box.height === 0) {
    return null;
  }
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  return {
    x: clamp((clientX - box.left) / box.width),
    y: clamp((clientY - box.top) / box.height),
  };
}

/**
 * The markers of a map (step 7.14, ADR-079): only points. Outside the mode "Markieren" a tap
 * on a point shows its name and a tap on the name opens the entry; in the mode a point can be
 * dragged, and a tap selects it for "Entfernen" or "Anderer Eintrag".
 */
export function MarkerLayer({
  markers,
  entries,
  map,
  marking,
  selected,
  onSelect,
  onMove,
  onOpen,
}: {
  markers: MapMarker[];
  entries: ReadonlyMap<string, CanonEntry>;
  map: RefObject<HTMLDivElement | null>;
  marking: boolean;
  selected: string | null;
  onSelect: (entry: string) => void;
  onMove: (entry: string, x: number, y: number) => void;
  onOpen: (entry: string) => void;
}) {
  // While a point is dragged it follows the pointer; it is saved when let go.
  const [dragged, setDragged] = useState<MapMarker | null>(null);
  const start = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  function down(event: ReactPointerEvent) {
    event.stopPropagation();
    start.current = { x: event.clientX, y: event.clientY, moved: false };
    if (marking) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  }

  function move(event: ReactPointerEvent, marker: MapMarker) {
    const from = start.current;
    if (!marking || from === null || map.current === null) {
      return;
    }
    const far =
      Math.hypot(event.clientX - from.x, event.clientY - from.y) > TAP_DISTANCE;
    if (!from.moved && !far) {
      return;
    }
    from.moved = true;
    const place = shareOf(map.current, event.clientX, event.clientY);
    if (place !== null) {
      setDragged({ ...marker, ...place });
    }
  }

  function up(event: ReactPointerEvent, marker: MapMarker) {
    event.stopPropagation();
    const from = start.current;
    start.current = null;
    if (from?.moved === true && dragged !== null) {
      onMove(marker.entry, dragged.x, dragged.y);
    } else {
      onSelect(marker.entry);
    }
    setDragged(null);
  }

  const shown = markers.filter((marker) => entries.has(marker.entry));
  const chosen = marking
    ? undefined
    : shown.find((marker) => marker.entry === selected);
  const chosenEntry = chosen && entries.get(chosen.entry);

  return (
    <>
      {shown.map((marker) => {
        const place =
          dragged !== null && dragged.entry === marker.entry ? dragged : marker;
        const entry = entries.get(marker.entry);
        return (
          <button
            key={marker.entry}
            type="button"
            className={
              "map-marker panzoom-exclude" +
              (marker.entry === selected ? " selected" : "")
            }
            style={{
              left: `${String(place.x * 100)}%`,
              top: `${String(place.y * 100)}%`,
            }}
            aria-label={entry?.name ?? marker.entry}
            onPointerDown={(event) => {
              down(event);
            }}
            onPointerMove={(event) => {
              move(event, marker);
            }}
            onPointerUp={(event) => {
              up(event, marker);
            }}
          />
        );
      })}
      {chosen !== undefined && chosenEntry !== undefined && (
        <button
          type="button"
          className={
            "map-marker-name panzoom-exclude" +
            // Near an edge the name opens towards the middle, so it stays on screen.
            (chosen.x < 0.3 ? " start" : chosen.x > 0.7 ? " end" : "")
          }
          style={{
            left: `${String(chosen.x * 100)}%`,
            top: `${String(chosen.y * 100)}%`,
          }}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          onPointerUp={(event) => {
            event.stopPropagation();
          }}
          onClick={() => {
            onOpen(chosen.entry);
          }}
        >
          <b>{chosenEntry.name} ›</b>
          <small>
            {categoryLabel(chosenEntry)} · antippen öffnet den Eintrag
          </small>
        </button>
      )}
    </>
  );
}

/** "Welcher Eintrag liegt hier?" – a search over all entries not yet on the map. */
export function MarkerPicker({
  entries,
  taken,
  busy,
  onPick,
  onCancel,
}: {
  entries: CanonEntry[];
  taken: ReadonlySet<string>;
  busy: boolean;
  onPick: (entry: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const [chosen, setChosen] = useState<string | null>(null);
  const wanted = text.trim().toLowerCase();
  const found = entries
    .filter((entry) => !taken.has(entry.id))
    .filter(
      (entry) =>
        wanted === "" ||
        [entry.name, ...entry.aliases].some((name) =>
          name.toLowerCase().includes(wanted),
        ),
    )
    .slice(0, 8);

  return (
    <div className="map-marker-sheet">
      <label>
        <b>Welcher Eintrag liegt hier?</b>
        <input
          value={text}
          placeholder="Name suchen"
          onChange={(event) => {
            setText(event.target.value);
            setChosen(null);
          }}
        />
      </label>
      {found.length === 0 ? (
        <p className="note">Kein passender Eintrag.</p>
      ) : (
        <ul>
          {found.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                aria-pressed={entry.id === chosen}
                onClick={() => {
                  setChosen(entry.id);
                }}
              >
                {entry.name} <small>· {categoryLabel(entry)}</small>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="row">
        <button
          type="button"
          className="primary"
          disabled={busy || chosen === null}
          onClick={() => {
            if (chosen !== null) {
              onPick(chosen);
            }
          }}
        >
          Setzen
        </button>
        <button type="button" className="ghost" onClick={onCancel}>
          Abbrechen
        </button>
      </div>
    </div>
  );
}
