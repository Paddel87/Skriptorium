import type { ReactNode } from "react";

/** An error message for the user; renders nothing without a message. */
export function ErrorText({ message }: { message: string | null }) {
  if (message === null) {
    return null;
  }
  return (
    <p className="error" role="alert">
      {message}
    </p>
  );
}

/** A labelled form field. */
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
