import { useEffect, useState } from "react";
import { api, type World, type WorldMap } from "../api";
import { ErrorText } from "./Common";
import { ImageDescription, withSection } from "./ImageDescription";
import { MapStage } from "./MapStage";
import { MapToolbar } from "./MapToolbar";
import { MarkerPicker } from "./MapMarkers";
import { MarkingBar } from "./MarkingBar";
import { useMapChange } from "./useMapChange";
import { useMapMarking } from "./useMapMarking";
import { useMapZoom } from "./useMapZoom";

/** One map over the page with zoom and panning; Escape closes. */
export function MapViewer({
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
  const [describing, setDescribing] = useState(false);
  const { busy, error, setError, change } = useMapChange(onChanged);
  const zoomer = useMapZoom();
  const marker = useMapMarking({
    world,
    map,
    content: zoomer.content,
    change,
    setError,
  });
  const { marking, pending } = marker;

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
        <MapStage
          world={world}
          map={map}
          zoomer={zoomer}
          marker={marker}
          onOpenEntry={onOpenEntry}
        />
        {pending !== null && (
          <MarkerPicker
            entries={marker.entries}
            taken={marker.taken}
            busy={busy}
            onPick={(entry) => {
              marker.pick(entry, pending);
            }}
            onCancel={marker.cancelPending}
          />
        )}
        {marking ? (
          <MarkingBar
            selected={marker.selected}
            busy={busy}
            onRemove={marker.remove}
            onReassign={marker.reassign}
            onDone={marker.finish}
          />
        ) : (
          <MapToolbar
            world={world}
            map={map}
            busy={busy}
            change={change}
            onMark={marker.start}
            onDescribe={() => {
              setDescribing(true);
            }}
            onClose={onClose}
          />
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
