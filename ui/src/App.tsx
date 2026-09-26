/** Root component; the real screens follow in step 2.7. */
export function App() {
  return <h1>{appTitle()}</h1>;
}

/** Title shown in the header. */
export function appTitle(): string {
  return "Skriptorium";
}
