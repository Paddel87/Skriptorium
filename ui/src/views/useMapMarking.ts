import { useEffect, useRef, useState, type RefObject } from "react";
import {
  api,
  describeError,
  type CanonEntry,
  type MapMarker,
  type World,
  type WorldMap,
} from "../api";
import { shareOf } from "./MapMarkers";

/** How far (in screen pixels) a pointer may move between down and up and still be a tap. */
const TAP_DISTANCE = 6;

/** A place on the map (shares of width and height); `replaces` when a point is reassigned. */
export interface Place {
  x: number;
  y: number;
  replaces?: string;
}

/**
 * The marking of a map (step 7.14, ADR-079): the mode "Markieren", the chosen and the new
 * point, the canon entries to pick from, and saving the points through `change`.
 */
export function useMapMarking({
  world,
  map,
  content,
  change,
  setError,
}: {
  world: World;
  map: WorldMap;
  content: RefObject<HTMLDivElement | null>;
  change: (work: () => Promise<World>) => Promise<boolean>;
  setError: (message: string | null) => void;
}) {
  const tap = useRef<{ x: number; y: number } | null>(null);
  const [marking, setMarking] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, setPending] = useState<Place | null>(null);
  const [entries, setEntries] = useState<CanonEntry[]>([]);

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
    // `setError` is a state setter and stays the same.
  }, [world.id, setError]);

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

  return {
    entries,
    byId: new Map(entries.map((entry) => [entry.id, entry])),
    marking,
    selected,
    pending,
    taken,
    // Capture phase: Panzoom stops the pointer going down from bubbling further.
    pointerDown: (event: {
      isPrimary: boolean;
      clientX: number;
      clientY: number;
    }) => {
      // A second finger (pinch) never counts as a tap.
      tap.current = event.isPrimary
        ? { x: event.clientX, y: event.clientY }
        : null;
    },
    pointerUp: (event: { clientX: number; clientY: number }) => {
      const from = tap.current;
      tap.current = null;
      if (
        from !== null &&
        Math.hypot(event.clientX - from.x, event.clientY - from.y) <
          TAP_DISTANCE
      ) {
        tapped(event.clientX, event.clientY);
      }
    },
    start: () => {
      setMarking(true);
      setSelected(null);
    },
    finish: () => {
      setMarking(false);
      setPending(null);
      setSelected(null);
    },
    select: (entry: string) => {
      setPending(null);
      setSelected((now) => (now === entry && !marking ? null : entry));
    },
    move: (entry: string, x: number, y: number) => {
      void saveMarkers(
        map.markers.map((m) => (m.entry === entry ? { entry, x, y } : m)),
      );
    },
    pick: (entry: string, place: Place) => {
      const kept = map.markers.filter((m) => m.entry !== place.replaces);
      void saveMarkers([...kept, { entry, x: place.x, y: place.y }]).then(
        (done) => {
          if (done) {
            setPending(null);
          }
        },
      );
    },
    cancelPending: () => {
      setPending(null);
    },
    remove: (entry: string) => {
      void saveMarkers(map.markers.filter((m) => m.entry !== entry));
      setSelected(null);
    },
    reassign: (entry: string) => {
      const marker = map.markers.find((m) => m.entry === entry);
      if (marker !== undefined) {
        setPending({ x: marker.x, y: marker.y, replaces: entry });
      }
    },
  };
}
