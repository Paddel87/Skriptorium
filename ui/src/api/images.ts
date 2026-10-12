/** Generating images with the AI (step 7.12, ADR-077); a preview only, nothing is stored. */

import { request } from "./core";

export interface ImageModelList {
  default: string;
  models: { id: string; name: string }[];
  available: boolean;
  /** False without a key; generating then answers 503. */
  ready: boolean;
}

export interface ImagePrice {
  cost_usd: number | null;
  unit: string | null;
}

export type AspectRatio = "2:3" | "1:1" | "3:2";

export interface GeneratedImage {
  content: string;
  media_type: string;
  cost_usd: number | null;
  model: string;
}

export const imagesApi = {
  imageModels: () =>
    request("GET", "/api/images/models") as Promise<ImageModelList>,
  imagePrice: (model: string) =>
    request(
      "GET",
      `/api/images/price?model=${encodeURIComponent(model)}`,
    ) as Promise<ImagePrice>,
  generateImage: (order: {
    model: string;
    prompt: string;
    aspect_ratio: AspectRatio;
  }) =>
    request("POST", "/api/images/generate", order) as Promise<GeneratedImage>,
};
