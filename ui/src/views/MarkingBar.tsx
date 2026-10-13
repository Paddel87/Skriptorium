/** The bar in the mode "Markieren": what to do with a chosen point, and "Fertig". */
export function MarkingBar({
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
