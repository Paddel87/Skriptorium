import { api, CATEGORIES, type CanonEntry } from "../api";
import { EntryText } from "./EntryText";

/**
 * A canon entry to read. Guests (entries of another world) cannot be changed here; the
 * character card download is offered outside the compact bar (step 6.9).
 */
export function EntryArticle({
  world,
  current,
  compact,
  onEdit,
}: {
  world: string;
  current: CanonEntry;
  compact: boolean;
  onEdit: () => void;
}) {
  const guest = current.world !== world;
  return (
    <article>
      <div className="row">
        <h2>{current.name}</h2>
        {!guest && (
          <button
            type="button"
            onClick={() => {
              onEdit();
            }}
          >
            Bearbeiten
          </button>
        )}
        {!compact && !guest && current.category === "figur" && (
          <a
            className="button"
            href={api.cardPath(world, current.id)}
            download={`${current.id}.card.json`}
          >
            ⇩ Figurenkarte
          </a>
        )}
      </div>
      {guest && (
        <p className="note">
          Gast aus einer anderen Welt – nur in deren Kanon zu ändern.
        </p>
      )}
      <p className="note">
        {CATEGORIES.find((c) => c.id === current.category)?.label}
        {current.aliases.length > 0 && ` · Auch: ${current.aliases.join(", ")}`}
        {current.status !== null && ` · ${current.status}`}
      </p>
      <EntryText text={current.body} name={current.name} />
    </article>
  );
}
