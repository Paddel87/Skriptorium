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

/**
 * How a taken-over image was generated (step 9.6, ADR-095); sent along with the upload and
 * kept by the server next to the image.
 */
export interface ImageOrigin {
  model: string;
  prompt: string;
  aspect_ratio: AspectRatio;
  cost_usd: number | null;
}

/** The stored origin with the date it was taken over; `null` for an uploaded image. */
export interface StoredImageOrigin {
  model: string;
  prompt: string;
  aspect_ratio: string;
  cost_usd: number | null;
  date: string;
}

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
