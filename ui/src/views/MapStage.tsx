import { api, type World, type WorldMap } from "../api";
import { MarkerLayer } from "./MapMarkers";
import type { useMapMarking } from "./useMapMarking";
import type { useMapZoom } from "./useMapZoom";

/** The map with its points and the zoom buttons: the part Panzoom works on. */
export function MapStage({
  world,
  map,
  zoomer,
  marker,
  onOpenEntry,
}: {
  world: World;
  map: WorldMap;
  zoomer: ReturnType<typeof useMapZoom>;
  marker: ReturnType<typeof useMapMarking>;
  onOpenEntry: (entry: string) => void;
}) {
  const { stage, content, zoom, fit, measure } = zoomer;
  const { pending } = marker;
  return (
    <div className="map-stage" ref={stage}>
      <div
        className="map-content"
        ref={content}
        data-testid="map-content"
        style={
          fit === null ? undefined : { width: fit.width, height: fit.height }
        }
        onPointerDownCapture={marker.pointerDown}
        onPointerUp={marker.pointerUp}
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
          entries={marker.byId}
          map={content}
          marking={marker.marking}
          selected={marker.selected}
          onSelect={marker.select}
          onMove={marker.move}
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
  );
}
