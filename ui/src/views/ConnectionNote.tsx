import { useSyncExternalStore } from "react";

function subscribe(changed: () => void): () => void {
  window.addEventListener("online", changed);
  window.addEventListener("offline", changed);
  return () => {
    window.removeEventListener("online", changed);
    window.removeEventListener("offline", changed);
  };
}

/**
 * A line at the bottom while the device has no connection (step 5.21, FR-032). The Skriptorium
 * works only online and keeps no texts on the device, so the line says what still holds: text
 * on the screen stays, saving works again once the connection is back.
 */
export function ConnectionNote() {
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
  if (online) {
    return null;
  }
  return (
    <p className="offline" role="status">
      Keine Verbindung. Der Text auf dem Bildschirm bleibt stehen; speichern und
      schreiben mit der KI geht erst wieder mit Netz.
    </p>
  );
}
