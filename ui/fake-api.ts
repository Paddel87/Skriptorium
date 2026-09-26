/** A fake `fetch` for component tests: routes "METHOD /path" to handlers and records calls. */
import { vi } from "vitest";

export interface Call {
  method: string;
  path: string;
  body: unknown;
}

type Handler = (
  body: unknown,
  path: string,
) => { status: number; body?: unknown };

export function fakeApi(routes: Record<string, Handler>) {
  const calls: Call[] = [];
  const fetchMock = vi.fn((input: string, init?: RequestInit) => {
    const method = init?.method ?? "GET";
    const path = input;
    const body: unknown =
      typeof init?.body === "string" ? JSON.parse(init.body) : undefined;
    calls.push({ method, path, body });
    const key = `${method} ${path.split("?")[0] ?? path}`;
    const handler =
      routes[key] ??
      Object.entries(routes).find(([pattern]) => match(pattern, key))?.[1];
    const result = handler
      ? handler(body, path)
      : { status: 404, body: { detail: `kein Fake für ${key}` } };
    return Promise.resolve(
      new Response(
        result.status === 204 ? null : JSON.stringify(result.body ?? null),
        {
          status: result.status,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );
  });
  vi.stubGlobal("fetch", fetchMock);
  return { calls, fetchMock };
}

function match(pattern: string, key: string): boolean {
  const regex = new RegExp(
    `^${pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]+")}$`,
  );
  return regex.test(key);
}

export const ok = (body?: unknown) => () => ({ status: 200, body });
export const created = (body?: unknown) => () => ({ status: 201, body });
export const noContent = () => () => ({ status: 204 });
export const fail = (status: number, detail: unknown) => () => ({
  status,
  body: { detail },
});

export const WORLD = {
  id: "salzmark",
  name: "Die Salzmark",
  description: "Salz",
};
export const ENTRY = {
  world: "salzmark",
  id: "kael",
  category: "figur" as const,
  name: "Kael",
  aliases: ["der Fährmann"],
  status: null,
  body: "Fährt über den See.",
};
export const STORY = {
  world: "salzmark",
  id: "ueberfahrt",
  title: "Die Überfahrt",
  form: "roman" as const,
  perspective: "ich",
  controlled_characters: [],
  guest_links: [],
  facts: [],
  summary: "",
};
export const CHAPTER = {
  world: "salzmark",
  story: "ueberfahrt",
  number: 1,
  title: "Aufbruch",
  status: "in-arbeit" as "in-arbeit" | "abgeschlossen",
  summary: "",
  summary_status: "fehlt" as const,
  text: "Es war kalt.",
};
