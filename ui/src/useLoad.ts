import { useCallback, useEffect, useState } from "react";
import { describeError } from "./api";

/** Result of {@link useLoad}. */
export interface Loaded<T> {
  data: T | undefined;
  error: string | null;
  reload: () => void;
}

/** Load data asynchronously; `reload` loads again (e.g. after a change). */
export function useLoad<T>(load: () => Promise<T>): Loaded<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<string | null>(null);
  const [round, setRound] = useState(0);

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
  }, [load, round]);

  const reload = useCallback(() => {
    setRound((value) => value + 1);
  }, []);
  return { data, error, reload };
}
