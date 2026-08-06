import jwt from "jsonwebtoken";
import cookie from "cookie";
import crypto from "node:crypto";

const COOKIE_NAME = "mr_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function signAndSerialize(payload) {
  const token = jwt.sign(payload, process.env.SESSION_SECRET, {
    expiresIn: MAX_AGE,
  });
  return cookie.serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

// Twitch-authenticated session
export function createTwitchSessionCookie(twitchUser) {
  return signAndSerialize({
    authType: "twitch",
    userId: `twitch:${twitchUser.id}`,
    username: twitchUser.display_name,
  });
}

// Anonymous/guest session — identified only by a random id in the signed cookie.
// Nothing links this to a real identity beyond the display name they typed.
export function createAnonSessionCookie(displayName) {
  return signAndSerialize({
    authType: "anon",
    userId: `anon:${crypto.randomUUID()}`,
    username: displayName,
  });
}

export function clearSessionCookie() {
  return cookie.serialize(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

// Returns the decoded session payload, or null if missing/invalid.
export function getSession(req) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.SESSION_SECRET);
  } catch {
    return null;
  }
}

// --- Admin session (separate from regular login — Brian unlocks this with
// a shared password, independent of whether he's also logged in as a user) ---

const ADMIN_COOKIE_NAME = "mr_admin";
const ADMIN_MAX_AGE = 60 * 60 * 12; // 12 hours — short-lived on purpose

export function createAdminSessionCookie() {
  const token = jwt.sign({ isAdmin: true }, process.env.SESSION_SECRET, {
    expiresIn: ADMIN_MAX_AGE,
  });
  return cookie.serialize(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_MAX_AGE,
  });
}

export function clearAdminSessionCookie() {
  return cookie.serialize(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function isAdmin(req) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies[ADMIN_COOKIE_NAME];
  if (!token) return false;
  try {
    return jwt.verify(token, process.env.SESSION_SECRET).isAdmin === true;
  } catch {
    return false;
  }
}
