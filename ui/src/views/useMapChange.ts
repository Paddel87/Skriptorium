import { useState } from "react";
import { describeError, type World } from "../api";

/** One change of a map at a time: busy while it runs, the error if it fails (step 7.10). */
export function useMapChange(onChanged: (world: World) => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function change(work: () => Promise<World>) {
    setBusy(true);
    setError(null);
    try {
      onChanged(await work());
      return true;
    } catch (reason: unknown) {
      setError(describeError(reason));
      return false;
    } finally {
      setBusy(false);
    }
  }

  return { busy, error, setError, change };
}
