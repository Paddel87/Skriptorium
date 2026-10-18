/**
 * Contract between the server and the interface (step 9.2, finding 3 of
 * docs/research/bewertung-phase-8.md): the real answers of the server, recorded in
 * tests/shared/api-responses.json by tests/api/test_ui_contract.py, must fit the hand-written
 * types of this directory.
 *
 * Each recorded answer becomes the initializer of a typed constant in a source file that exists
 * only in memory (`export const createWorld: World = {...};`). The TypeScript compiler checks
 * that file like any other: a field the type does not know ("Object literal may only specify
 * known properties"), a required field the server does not send, a value of the wrong type or
 * outside a union of literals is an error. If this test fails, the type in this directory and
 * the server disagree; fix the one that is wrong and, if the server changed on purpose, record
 * the answers anew (see the top of tests/api/test_ui_contract.py).
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

/** One recorded answer: the call, the type the interface reads it as, and the JSON answer. */
interface Recorded {
  route: string;
  type: string;
  body: unknown;
}

type Contract = Record<string, Recorded>;

/** A difference between an answer and its type; `entry` is the name in the file. */
interface Problem {
  entry: string;
  message: string;
}

const RESPONSES = "tests/shared/api-responses.json";
/** The in-memory source file; it sits next to `index.ts` so `./index` resolves as in the app. */
const VIRTUAL = path.resolve("ui/src/api/__contract__.ts");
/** Compiling the interface's types takes about a second; a slow machine gets room. */
const TIMEOUT = 60_000;
/** Type names in an expression that come from TypeScript itself, not from `./index`. */
const BUILT_IN = new Set([
  "Array",
  "Exclude",
  "Extract",
  "Omit",
  "Pick",
  "Record",
]);
const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function load(): Contract {
  return JSON.parse(readFileSync(RESPONSES, "utf8")) as Contract;
}

/** The names of the types the expressions use, which `./index` has to export. */
function importedTypes(contract: Contract): string[] {
  const names = new Set<string>();
  for (const { type } of Object.values(contract)) {
    for (const name of type.match(/\b[A-Z][A-Za-z0-9_]*\b/g) ?? []) {
      if (!BUILT_IN.has(name)) {
        names.add(name);
      }
    }
  }
  return [...names].sort();
}

/** The source of the in-memory file and where each entry starts and ends in it. */
function sourceOf(contract: Contract): {
  text: string;
  spans: { entry: string; start: number; end: number }[];
} {
  let text = `import type { ${importedTypes(contract).join(", ")} } from "./index";\n`;
  const spans = [];
  for (const [entry, { type, body }] of Object.entries(contract)) {
    const start = text.length;
    text += `export const ${entry}: ${type} = ${JSON.stringify(body, null, 2)};\n`;
    spans.push({ entry, start, end: text.length });
  }
  return { text, spans };
}

let cachedOptions: ts.CompilerOptions | undefined;

/** The options of tsconfig.json, which also type-check the interface. */
function compilerOptions(): ts.CompilerOptions {
  if (cachedOptions === undefined) {
    const configPath = path.resolve("tsconfig.json");
    const read = ts.readConfigFile(configPath, (file) => ts.sys.readFile(file));
    if (read.error !== undefined) {
      throw new Error(
        ts.flattenDiagnosticMessageText(read.error.messageText, "\n"),
      );
    }
    const config: unknown = read.config;
    cachedOptions = ts.parseJsonConfigFileContent(
      config,
      ts.sys,
      path.dirname(configPath),
      undefined,
      configPath,
    ).options;
  }
  return cachedOptions;
}

/**
 * Check every answer of `contract` against its type with the TypeScript compiler. The in-memory
 * file comes from the host's wrapper; every other file (the types of the interface, libraries)
 * is read from disk.
 */
function check(contract: Contract): Problem[] {
  const { text, spans } = sourceOf(contract);
  const options = compilerOptions();
  const host = ts.createCompilerHost(options);
  const isVirtual = (fileName: string) => path.resolve(fileName) === VIRTUAL;
  const getSourceFile = host.getSourceFile.bind(host);
  const fileExists = host.fileExists.bind(host);
  const readFile = host.readFile.bind(host);
  host.getSourceFile = (
    fileName,
    languageVersionOrOptions,
    onError,
    shouldCreate,
  ) =>
    isVirtual(fileName)
      ? ts.createSourceFile(fileName, text, languageVersionOrOptions)
      : getSourceFile(
          fileName,
          languageVersionOrOptions,
          onError,
          shouldCreate,
        );
  host.fileExists = (fileName) => isVirtual(fileName) || fileExists(fileName);
  host.readFile = (fileName) =>
    isVirtual(fileName) ? text : readFile(fileName);

  const program = ts.createProgram({ rootNames: [VIRTUAL], options, host });
  const source = program.getSourceFile(VIRTUAL);
  if (source === undefined) {
    throw new Error("the in-memory file is not part of the program");
  }
  return ts.getPreEmitDiagnostics(program, source).map((diagnostic) => {
    const at = diagnostic.start;
    const span =
      at === undefined
        ? undefined
        : spans.find((s) => at >= s.start && at < s.end);
    return {
      entry: span?.entry ?? "(imports)",
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
    };
  });
}

function describeProblems(contract: Contract, problems: Problem[]): string[] {
  return problems.map(({ entry, message }) => {
    const route = contract[entry]?.route;
    return `${entry}${route === undefined ? "" : ` (${route})`}: ${message}`;
  });
}

describe("the answers of the server fit the types of the interface (step 9.2)", () => {
  it("records a route, a type and an answer under a usable name for every call", () => {
    const contract = load();
    const faulty = Object.entries(contract)
      .filter(
        ([name, { route, type, body }]) =>
          !IDENTIFIER.test(name) ||
          route === "" ||
          type === "" ||
          body === undefined,
      )
      .map(([name]) => name);
    expect(faulty).toEqual([]);
    expect(Object.keys(contract).length).toBeGreaterThan(0);
  });

  it("accepts every recorded answer as its type", { timeout: TIMEOUT }, () => {
    const contract = load();
    expect(describeProblems(contract, check(contract))).toEqual([]);
  });
});

/**
 * The check must be able to fail: each case damages one answer in a copy in memory (the file
 * stays as it is) and the compiler has to name exactly that answer.
 */
describe("the check detects a difference between an answer and its type", () => {
  interface Case {
    about: string;
    /** The first recorded answer read as this type is damaged. */
    type: string;
    damage: (body: Record<string, unknown>) => void;
    /** What the compiler says. */
    message: RegExp;
  }

  const cases: Case[] = [
    {
      about: "a renamed field",
      type: "World",
      damage: (body) => {
        body["title"] = body["name"];
        delete body["name"];
      },
      message: /"title".* does not exist in type 'World'/,
    },
    {
      about: "a field the type does not have",
      type: "CanonEntry",
      damage: (body) => {
        body["rank"] = 1;
      },
      message: /"rank".* does not exist in type 'CanonEntry'/,
    },
    {
      about: "a missing field",
      type: "Story",
      damage: (body) => {
        delete body["form"];
      },
      message: /Property 'form' is missing in type/,
    },
    {
      about: "a value outside a union of literals",
      type: "Chapter",
      damage: (body) => {
        body["status"] = "verloren";
      },
      message: /Type '"verloren"' is not assignable to type/,
    },
    {
      about: "a value of the wrong type",
      type: "ModelList",
      damage: (body) => {
        body["catalog_available"] = "ja";
      },
      message: /Type 'string' is not assignable to type 'boolean'/,
    },
  ];

  /** One compilation for all cases; the first case to run pays for it. */
  let damaged:
    { targets: Map<string, string>; problems: Problem[] } | undefined;

  function damagedAnswers() {
    if (damaged === undefined) {
      const contract = load();
      const targets = new Map<string, string>();
      for (const { type, damage } of cases) {
        const found = Object.entries(contract).find(
          ([, one]) => one.type === type,
        );
        if (found === undefined) {
          throw new Error(`no recorded answer of type ${type}`);
        }
        damage(found[1].body as Record<string, unknown>);
        targets.set(type, found[0]);
      }
      damaged = { targets, problems: check(contract) };
    }
    return damaged;
  }

  it.each(cases)(
    "detects $about",
    { timeout: TIMEOUT },
    ({ type, message }) => {
      const { targets, problems } = damagedAnswers();
      const entry = targets.get(type);
      const found = problems.filter((problem) => problem.entry === entry);
      expect(found.map((problem) => problem.message).join("\n")).toMatch(
        message,
      );
    },
  );

  it("names no other answer", { timeout: TIMEOUT }, () => {
    const { targets, problems } = damagedAnswers();
    const named = new Set(problems.map((problem) => problem.entry));
    expect([...named].sort()).toEqual([...targets.values()].sort());
  });
});
