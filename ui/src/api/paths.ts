/** Address builders shared by the endpoint groups of the API client. */

export const enc = encodeURIComponent;
export const worldPath = (world: string) => `/api/worlds/${enc(world)}`;
export const storyPath = (world: string, story: string) =>
  `${worldPath(world)}/stories/${enc(story)}`;
