import type { ReactNode } from "react";

/**
 * Line icons of the bar on the left (step 7.5): one stroke style instead of emoji, which look
 * different on every device. Drawn in the text colour; hidden from screen readers, the label
 * next to them names the button.
 */
const PATHS = {
  list: <path d="M4 6h16M4 12h16M4 18h16" />,
  worlds: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
    </>
  ),
  canon: (
    <>
      <path d="M5 5a2 2 0 0 1 2-2h12v18H7a2 2 0 0 1-2-2z" />
      <path d="M5 17a2 2 0 0 1 2-2h12M9 7h6" />
    </>
  ),
  import: <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />,
  theme: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </>
  ),
  account: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </>
  ),
  logout: (
    <>
      <path d="M12 3v8" />
      <path d="M7 6a8 8 0 1 0 10 0" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
