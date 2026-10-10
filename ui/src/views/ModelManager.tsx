import { useEffect, useMemo, useRef, useState } from "react";
import { api, describeError, type CatalogModel, type ModelList } from "../api";
import { formatCents, formatContext, formatPrice, shortName } from "../models";
import { ErrorText } from "./Common";

/** Price limits per proposal in US dollars; `null` is "beliebig". */
const PRICE_LIMITS: readonly (number | null)[] = [null, 0.01, 0.05, 0.1];
const MIN_CONTEXT = 30_000;

/**
 * "Modelle verwalten …" (step 5.12, ADR-055): OpenRouter's catalog with search and filters; the
 * star adds a model to the favorites of the selection field or removes it. Every star is saved
 * on the server right away.
 */
export function ModelManager({
  list,
  onChange,
  onClose,
}: {
  list: ModelList;
  /** The list after saving the favorites. */
  onChange: (list: ModelList) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState("");
  const [limit, setLimit] = useState<number | null>(null);
  const [unmoderated, setUnmoderated] = useState(true);
  const [bigContext, setBigContext] = useState(true);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => {
    search.current?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("keydown", close);
    };
  }, [onClose]);

  const favorites = useMemo(() => new Set(list.favorites), [list.favorites]);
  const providers = useMemo(() => {
    const counts = new Map<string, number>();
    for (const model of list.catalog) {
      counts.set(model.provider, (counts.get(model.provider) ?? 0) + 1);
    }
    return [...counts].sort(([a], [b]) => a.localeCompare(b, "de"));
  }, [list.catalog]);

  const shown = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("de");
    return list.catalog
      .filter(
        (model) =>
          (needle === "" ||
            model.name.toLocaleLowerCase("de").includes(needle) ||
            model.id.includes(needle)) &&
          (provider === "" || model.provider === provider) &&
          (limit === null ||
            (model.estimated_cost !== null && model.estimated_cost <= limit)) &&
          (!unmoderated || !model.moderated) &&
          (!bigContext ||
            (model.context_length !== null &&
              model.context_length >= MIN_CONTEXT)) &&
          (!onlyFavorites || favorites.has(model.id)),
      )
      .sort(
        // Favorites in their order in the selection field, then the cheapest first.
        (a, b) =>
          rank(list.favorites, a.id) - rank(list.favorites, b.id) ||
          (a.estimated_cost ?? Infinity) - (b.estimated_cost ?? Infinity) ||
          a.id.localeCompare(b.id),
      );
  }, [
    list.catalog,
    query,
    provider,
    limit,
    unmoderated,
    bigContext,
    onlyFavorites,
    favorites,
    list.favorites,
  ]);

  const toggle = async (id: string) => {
    const next = favorites.has(id)
      ? list.favorites.filter((favorite) => favorite !== id)
      : [...list.favorites, id];
    setSaving(true);
    setError(null);
    try {
      onChange(await api.setFavorites(next));
    } catch (reason) {
      setError(describeError(reason));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="model-manager"
        role="dialog"
        aria-modal="true"
        aria-labelledby="model-manager-title"
      >
        <div className="model-manager-head">
          <h2 id="model-manager-title">Modelle verwalten</h2>
          <button type="button" aria-label="Schließen" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="model-manager-filters">
          <input
            ref={search}
            type="search"
            aria-label="Modelle suchen"
            placeholder="Suchen: Name oder Kennung"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
          />
          <div className="model-manager-row">
            <label>
              Anbieter:{" "}
              <select
                value={provider}
                onChange={(event) => {
                  setProvider(event.target.value);
                }}
              >
                <option value="">alle ({providers.length})</option>
                {providers.map(([name, count]) => (
                  <option key={name} value={name}>
                    {name} ({count})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Preis je Vorschlag bis{" "}
              <select
                value={limit === null ? "" : String(limit)}
                onChange={(event) => {
                  setLimit(
                    event.target.value === ""
                      ? null
                      : Number(event.target.value),
                  );
                }}
              >
                {PRICE_LIMITS.map((value) => (
                  <option
                    key={String(value)}
                    value={value === null ? "" : String(value)}
                  >
                    {value === null ? "beliebig" : formatCents(value)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="chips">
            <Chip pressed={unmoderated} onToggle={setUnmoderated}>
              ohne OpenRouter-Moderation
            </Chip>
            <Chip pressed={bigContext} onToggle={setBigContext}>
              mind. 30 Tsd. Kontext
            </Chip>
            <Chip pressed={onlyFavorites} onToggle={setOnlyFavorites}>
              nur Favoriten
            </Chip>
          </div>
          <p className="note">
            {list.catalog_available
              ? `${String(shown.length)} von ${String(list.catalog.length)} Modellen von OpenRouter · ★ = im Auswahlfeld`
              : "OpenRouter ist gerade nicht erreichbar. Deine Favoriten bleiben im Auswahlfeld wählbar; später erneut öffnen."}
          </p>
          <ErrorText message={error} />
        </div>
        <ul className="model-manager-list">
          {shown.map((model) => (
            <ModelRow
              key={model.id}
              model={model}
              favorite={favorites.has(model.id)}
              disabled={saving}
              onToggle={() => void toggle(model.id)}
            />
          ))}
        </ul>
        <div className="model-manager-foot">
          <span className="note">
            Kosten je Vorschlag geschätzt: 30.000 Token ein, 500 aus. „denkt
            vor“: Wartezeit nicht gemessen.
          </span>
          <button type="button" onClick={onClose}>
            Fertig
          </button>
        </div>
      </div>
    </div>
  );
}

function rank(favorites: string[], id: string): number {
  const index = favorites.indexOf(id);
  return index < 0 ? favorites.length : index;
}

function Chip({
  pressed,
  onToggle,
  children,
}: {
  pressed: boolean;
  onToggle: (pressed: boolean) => void;
  children: string;
}) {
  return (
    <button
      type="button"
      className="chip"
      aria-pressed={pressed}
      onClick={() => {
        onToggle(!pressed);
      }}
    >
      {children}
    </button>
  );
}

function ModelRow({
  model,
  favorite,
  disabled,
  onToggle,
}: {
  model: CatalogModel;
  favorite: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const name = shortName(model, model.id);
  return (
    <li className={favorite ? "favorite" : undefined}>
      <button
        type="button"
        className="star"
        aria-pressed={favorite}
        aria-label={`${name} als Favorit`}
        disabled={disabled}
        onClick={onToggle}
      >
        {favorite ? "★" : "☆"}
      </button>
      <div className="model-info">
        <div>
          <strong>{model.name}</strong> <small>{model.id}</small>
        </div>
        <div className="note">
          {model.provider} · Kontext {formatContext(model.context_length)} ·{" "}
          {formatPrice(model.input_price)} / {formatPrice(model.output_price)}{" "}
          je 1 Mio. Token
        </div>
        <div className="badges">
          {model.thinking === "lange" && (
            <span className="badge warn">denkt lange</span>
          )}
          {model.thinking === "vor" && <span className="badge">denkt vor</span>}
          {model.moderated && <span className="badge bad">moderiert</span>}
          {model.checked && <span className="badge good">geprüft</span>}
        </div>
      </div>
      <div className="model-cost">
        {formatCents(model.estimated_cost) ?? "?"}
        <small>je Vorschlag</small>
      </div>
    </li>
  );
}
