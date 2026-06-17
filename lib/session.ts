import "server-only";
import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = {
  isAdmin: boolean;
};

const password = process.env.SESSION_SECRET;

export const sessionOptions: SessionOptions = {
  password: password ?? "fallback-dev-secret-please-change-32chars!!",
  cookieName: "granja_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  },
};

/** Returns the current session, reading/writing the signed cookie. */
export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

/** True when the current request belongs to a logged-in admin. */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session.isAdmin === true;
}
