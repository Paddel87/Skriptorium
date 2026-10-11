/** Sign-in, setup, password and sessions (`/api/auth`). */

import { enc } from "./paths";
import { request } from "./core";

export interface SessionInfo {
  id: string;
  created: string;
  last_seen: string;
  client: string;
  current: boolean;
}

export const accountApi = {
  session: () => request("GET", "/api/auth/session") as Promise<SessionInfo>,
  login: (password: string) => request("POST", "/api/auth/login", { password }),
  logout: () => request("POST", "/api/auth/logout"),
  setup: (code: string, password: string) =>
    request("POST", "/api/auth/setup", { code, password }),
  changePassword: (current: string, next: string, endOthers: boolean) =>
    request("POST", "/api/auth/password", {
      current_password: current,
      new_password: next,
      end_other_sessions: endOthers,
    }),
  sessions: () =>
    request("GET", "/api/auth/sessions") as Promise<SessionInfo[]>,
  endSession: (id: string) =>
    request("DELETE", `/api/auth/sessions/${enc(id)}`),
  endOtherSessions: () => request("DELETE", "/api/auth/sessions"),
};
