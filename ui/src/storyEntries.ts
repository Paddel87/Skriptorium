import { api, ApiError, type CanonEntry, type GuestLink } from "./api";

/**
 * The canon entries a story may use (FR-017, step 3.7): the entries of its world and the guests
 * it binds in from other worlds. A guest whose entry is gone is left out; a guest replaces an
 * entry of the world with the same identifier, as on the server.
 */
export async function loadStoryEntries(
  world: string,
  guests: readonly GuestLink[],
): Promise<CanonEntry[]> {
  const [own, ...found] = await Promise.all([
    api.entries(world),
    ...guests.map((guest) => loadGuest(guest)),
  ]);
  const present = found.filter((entry) => entry !== null);
  const guestIds = new Set(present.map((entry) => entry.id));
  return [...own.filter((entry) => !guestIds.has(entry.id)), ...present];
}

/** The entry of a guest link, or `null` if it no longer exists in its world. */
export async function loadGuest(guest: GuestLink): Promise<CanonEntry | null> {
  try {
    return await api.entry(guest.world, guest.entry);
  } catch (reason: unknown) {
    if (reason instanceof ApiError && reason.status === 404) {
      return null;
    }
    throw reason;
  }
}
