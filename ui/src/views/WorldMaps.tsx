import { useState } from "react";
import { api, type World } from "../api";
import { AddMap } from "./AddMap";
import { MapViewer } from "./MapViewer";

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
