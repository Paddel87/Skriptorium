import { useCallback, useState } from "react";
import { api, describeError, type ModelList, type ModelTask } from "../api";
import { taskModel } from "../models";
import { useLoad } from "../useLoad";

/**
 * Model of a request (steps 3.9, 5.12, 9.7): the loaded list, favorites saved in "Modelle
 * verwalten …" which replace it, and the chosen model, preselected from the story, else from the
 * model of `task` in the settings (ADR-096). A new choice is passed on through `onModelChange`.
 */
export function useModelChoice(
  storyModel: string | null,
  task: ModelTask,
  onModelChange?: (model: string) => Promise<void>,
) {
  const loadModels = useCallback(() => api.models(), []);
  const models = useLoad(loadModels);
  const [model, setModel] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [savedList, setSavedList] = useState<ModelList | null>(null);
  const [managing, setManaging] = useState(false);
  const modelList = savedList ?? models.data;
  const preset =
    storyModel ??
    (modelList === undefined
      ? undefined
      : (taskModel(modelList, task) ?? modelList.default));
  const chosenModel = model ?? preset ?? "";
  const offered = offeredModels(modelList, chosenModel);

  function choose(next: string) {
    setModel(next);
    setModelError(null);
    onModelChange?.(next).catch((reason: unknown) => {
      setModelError(describeError(reason));
    });
  }

  return {
    modelList,
    chosenModel,
    offered,
    loadError: models.error,
    modelError,
    managing,
    setManaging,
    setSavedList,
    choose,
  };
}

/**
 * Models of the selection field: the favorites, plus the chosen model (the story's or one just
 * removed from the favorites) and, without favorites, the preset model (ADR-055).
 */
export function offeredModels(
  list: ModelList | undefined,
  chosen: string,
): string[] {
  if (list === undefined) {
    return chosen === "" ? [] : [chosen];
  }
  const offered = [...list.favorites];
  for (const id of [chosen, list.default]) {
    if (
      id !== "" &&
      !offered.includes(id) &&
      (offered.length === 0 || id === chosen)
    ) {
      offered.push(id);
    }
  }
  return offered;
}
