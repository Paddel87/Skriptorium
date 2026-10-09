import { useCallback, useEffect, useState } from "react";
import { describeError } from "./api";

/** Result of {@link useLoad}. */
export interface Loaded<T> {
  data: T | undefined;
  error: string | null;
  reload: () => void;
}

/**
 * Load data asynchronously; `reload` loads again (e.g. after a change), as does a new `round`
 * (e.g. a change elsewhere on the page, step 5.11).
 */
export function useLoad<T>(load: () => Promise<T>, round = 0): Loaded<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<string | null>(null);
  const [own, setOwn] = useState(0);

  useEffect(() => {
    let active = true;
    load().then(
      (value) => {
        if (active) {
          setData(value);
          setError(null);
        }
      },
      (reason: unknown) => {
        if (active) {
          setError(describeError(reason));
        }
      },
    );
    return () => {
      active = false;
    };
  }, [load, round, own]);

  const reload = useCallback(() => {
    setOwn((value) => value + 1);
  }, []);
  return { data, error, reload };
}
