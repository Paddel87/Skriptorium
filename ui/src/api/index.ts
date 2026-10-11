/**
 * Client for the HTTP API of the server (docs/architecture.md section 4).
 *
 * The browser sends the session cookie and the Origin header by itself; every body is JSON
 * because the server refuses other content types for changing requests (ASVS 3.5.1-3.5.3).
 * The modules next to this file mirror the route groups of the server; this file joins them
 * to the one surface the views import.
 */

import { accountApi } from "./account";
import { canonApi } from "./canon";
import { manuscriptApi } from "./manuscript";
import { modelsApi } from "./models";
import { transferApi } from "./transfer";
import { worldbuilderApi } from "./worldbuilder";
import { writingApi } from "./writing";

export {
  ApiError,
  describeError,
  request,
  setUnauthorizedHandler,
} from "./core";
export type { SessionInfo } from "./account";
export { CATEGORIES } from "./canon";
export type { CanonEntry, Category, World } from "./canon";
export { FORMS, describeSummaryFailure } from "./manuscript";
export type {
  Chapter,
  Form,
  GuestLink,
  InstructionNote,
  Story,
  StoryFact,
  SummaryResult,
  SummaryStatus,
  WritingStyle,
} from "./manuscript";
export { formatCost } from "./models";
export type { CatalogModel, ModelList, MonthUsage } from "./models";
export type {
  ImportItem,
  ImportPreview,
  ImportResult,
  TranslatedMaterial,
} from "./transfer";
export type { Source } from "./stream";
export { streamWorldbuilder } from "./worldbuilder";
export type {
  WorldbuilderEvent,
  WorldbuilderMessage,
  WorldbuilderOrder,
} from "./worldbuilder";
export { describeWriteError, streamWrite } from "./writing";
export type {
  WriteErrorKind,
  WriteEvent,
  WriteLength,
  WriteOrder,
} from "./writing";

/** Typed operations of the API. */
export const api = {
  ...accountApi,
  ...canonApi,
  ...transferApi,
  ...manuscriptApi,
  ...modelsApi,
  ...worldbuilderApi,
  ...writingApi,
};
