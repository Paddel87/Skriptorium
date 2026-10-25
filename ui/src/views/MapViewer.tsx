import { useEffect, useState } from "react";
import { api, type World, type WorldMap } from "../api";
import { ErrorText } from "./Common";
import { ImageDescription } from "./ImageDescription";
import {
  ImageOriginPanel,
  seedOf,
  type GenerateSeed,
} from "./ImageOriginPanel";
import { MapStage } from "./MapStage";
import { MapToolbar } from "./MapToolbar";
import { MarkerPicker } from "./MapMarkers";
import { MarkingBar } from "./MarkingBar";
import { SectionConflict } from "./SectionConflict";
import { useMapChange } from "./useMapChange";
import { useMapMarking } from "./useMapMarking";
import { useMapZoom } from "./useMapZoom";
import { useSectionChoice } from "./useSectionChoice";

/**
 * One map over the page with zoom and panning; Escape closes. A generated map shows its origin
 * (step 9.6, ADR-095); with `onRegenerate` it can be generated anew from there or from the map
 * itself as basis (step 9.8, ADR-097).
 */
export function MapViewer({
  world,
  map,
  onChanged,
  onOpenEntry,
  onRegenerate,
  onClose,
}: {
  world: World;
  map: WorldMap;
  onChanged: (world: World) => void;
  onOpenEntry: (entry: string) => void;
  onRegenerate?: (seed: GenerateSeed) => void;
  onClose: () => void;
}) {
  const [describing, setDescribing] = useState(false);
  const { busy, error, setError, change } = useMapChange(onChanged);
  const { place, asking } = useSectionChoice();
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
        {!marking && onRegenerate !== undefined && (
          <button
            type="button"
            className="ghost"
            disabled={busy}
            onClick={() => {
              onRegenerate({
                prompt: "",
                format: "3:2",
                model: null,
                basis: {
                  reference: { world: world.id, map_file: map.file },
                  label: `Karte „${map.name}“`,
                  src: api.mapPath(world.id, map.file),
                },
              });
            }}
          >
            ✨ Als Grundlage für eine neue Karte
          </button>
        )}
        {!marking && (
          <ImageOriginPanel
            key={map.file}
            load={() => api.mapOrigin(world.id, map.file)}
            onRegenerate={
              onRegenerate === undefined
                ? undefined
                : (origin) => {
                    onRegenerate(seedOf(origin, "3:2"));
                  }
            }
          />
        )}
        {describing && (
          <ImageDescription
            title={`Geografie – ${map.name}`}
            path={api.describeMapPath(world.id, map.file)}
            takeOverLabel="In die Weltbeschreibung übernehmen"
            onTakeOver={async (text) => {
              // The current description, in case it changed elsewhere meanwhile.
              const fresh = (await api.worlds()).find((w) => w.id === world.id);
              const description = await place(
                fresh?.description ?? world.description,
                `Geografie – ${map.name}`,
                text,
              );
              if (description === null) {
                return false;
              }
              onChanged(await api.updateWorld(world.id, { description }));
              return true;
            }}
            onClose={() => {
              setDescribing(false);
            }}
          />
        )}
        <SectionConflict asking={asking} />
        <p className="map-viewer-hint">
          {marking
            ? "Zwei Finger oder Mausrad zum Zoomen."
            : "Zwei Finger oder Mausrad zum Zoomen, ziehen zum Verschieben. Punkt antippen zeigt den Namen."}
        </p>
      </div>
    </div>
  );
}
