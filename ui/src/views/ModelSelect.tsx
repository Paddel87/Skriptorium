import type { ModelList } from "../api";
import { optionLabel } from "../models";

/** Value of the entry "Modelle verwalten …" in the selection field (step 5.12). */
const MANAGE = "\u0000verwalten";

/** Selection field of the model; its last entry opens the model management. */
export function ModelSelect({
  offered,
  modelList,
  chosenModel,
  onChoose,
  onManage,
}: {
  offered: readonly string[];
  modelList: ModelList | undefined;
  chosenModel: string;
  onChoose: (model: string) => void;
  onManage: () => void;
}) {
  return (
    <label className="compact" title="Anbieter: OpenRouter">
      <span className="sr-only">Anbieter: OpenRouter</span>
      <select
        aria-label="Modell"
        value={chosenModel}
        onChange={(event) => {
          const next = event.target.value;
          if (next === MANAGE) {
            onManage();
            return;
          }
          onChoose(next);
        }}
      >
        {offered.map((id) => (
          <option key={id} value={id}>
            {optionLabel(
              modelList?.catalog.find((entry) => entry.id === id),
              id,
              modelList?.favorites.includes(id) ?? false,
            )}
          </option>
        ))}
        {modelList !== undefined && (
          <>
            <option disabled>──────────</option>
            <option value={MANAGE}>Modelle verwalten …</option>
          </>
        )}
      </select>
    </label>
  );
}
