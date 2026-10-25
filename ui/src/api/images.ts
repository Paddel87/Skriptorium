/**
 * Generating images with the AI (steps 7.12, 9.8, ADR-077, ADR-097); a preview only, nothing is
 * stored.
 */

import { request } from "./core";

export interface ImageModelList {
  default: string;
  /** `references`: how many images the model takes as a basis (step 9.8). */
  models: { id: string; name: string; references: number }[];
  available: boolean;
  /** False without a key; generating then answers 503. */
  ready: boolean;
}

export interface ImagePrice {
  cost_usd: number | null;
  unit: string | null;
  /** What an image given as the basis costs, if the provider names it (step 9.8). */
  input_cost_usd?: number | null;
  input_unit?: string | null;
}

/** A stored image as the basis of a new one: an entry image, a map or a cover (ADR-097). */
export interface ImageReference {
  world: string;
  entry?: string;
  image?: string;
  map_file?: string;
  story?: string;
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
  /** The image it was made from, e.g. "Bild 1 von Kael" (step 9.8, ADR-097). */
  basis?: string;
}

/** The stored origin with the date it was taken over; `null` for an uploaded image. */
export interface StoredImageOrigin {
  model: string;
  prompt: string;
  aspect_ratio: string;
  cost_usd: number | null;
  date: string;
  basis: string | null;
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
    reference?: ImageReference;
  }) =>
    request("POST", "/api/images/generate", order) as Promise<GeneratedImage>,
};
