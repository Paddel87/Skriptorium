import { createContext, useContext } from "react";
import { Icon } from "./Icons";

/** Opens the menu on small screens; views put it into their own top line. */
export const MenuContext = createContext<() => void>(() => undefined);

/** The menu button for small screens; hidden on wide screens, where the bar is always there. */
export function MenuButton() {
  const open = useContext(MenuContext);
  return (
    <button
      type="button"
      className="menu-button"
      aria-label="Menü"
      onClick={open}
    >
      <Icon name="list" />
    </button>
  );
}
