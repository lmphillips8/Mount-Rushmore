import { getSession } from "../lib/session.js";
import {
  createAdminSessionCookie,
  createTwitchSessionCookie,
  createAnonSessionCookie,
  clearSessionCookie,
} from "../lib/session.js";

import { isAdmin } from "../lib/session.js";

export default async function handler(req, res) {
  const { action } = req.query;

  switch (action) {
    case "me":
      return handleMe(req, res);
    case "login":
      return handleLogin(req, res);
    case "logout":
      return handleLogout(req, res);
    case "callback":
      return handleCallback(req, res);
    case "anon":
      return handleAnon(req, res);
    case "admin-me":
      return handleAdminMe(req, res);
    case "admin-login":
      return handleAdminLogin(req, res);
    case "admin-logout":
      return handleAdminLogout(req, res);
    default:
      return res.status(404).json({ error: "Not found" });
  }
}

function handleMe(req, res) {
  const session = getSession(req);
  res.status(200).json({ user: session });
}

function handleLogin(req, res) {
  const params = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID,
    redirect_uri: process.env.TWITCH_REDIRECT_URI,
    response_type: "code",
    scope: "openid",
  });

  res.writeHead(302, {
    Location: `https://id.twitch.tv/oauth2/authorize?${params.toString()}`,
  });
  res.end();
}
function handleLogout(req, res) {
  res.setHeader("Set-Cookie", clearSessionCookie());
  res.status(200).json({ ok: true });
}
async function handleCallback(req, res) {
  console.log(req);
  const { code } = req.query;
  if (!code) {
    res.status(400).send("Missing authorization code");
    return;
  }

  try {
    // 1. Exchange the code for an access token
    const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.TWITCH_REDIRECT_URI,
      }).toString(),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      throw new Error("No access token returned from Twitch");
    }

    // 2. Use the token to fetch the user's Twitch profile
    const userRes = await fetch("https://api.twitch.tv/helix/users", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Client-Id": process.env.TWITCH_CLIENT_ID,
      },
    });
    const userData = await userRes.json();
    const twitchUser = userData.data?.[0];
    if (!twitchUser) throw new Error("Could not fetch Twitch user");

    // 3. Issue our own session cookie (never expose the Twitch token to the frontend)
    res.setHeader("Set-Cookie", createTwitchSessionCookie(twitchUser));
    res.writeHead(302, { Location: process.env.APP_URL });
    res.end();
  } catch (err) {
    console.error("Twitch auth error:", err);
    res.status(500).send("Authentication failed");
  }
}
function handleAnon(req, res) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const { displayName } = req.body || {};
  const name = (displayName || "").trim().slice(0, 30);

  if (!name) {
    res.status(400).json({ error: "Enter a name to continue" });
    return;
  }

  res.setHeader("Set-Cookie", createAnonSessionCookie(name));
  res.status(200).json({ ok: true });
}

function handleAdminMe(req, res) {
  res.status(200).json({ isAdmin: isAdmin(req) });
}

function handleAdminLogin(req, res) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const { password } = req.body || {};

  if (!process.env.ADMIN_PASSWORD) {
    console.error("ADMIN_PASSWORD is not set in the environment");
    res.status(500).json({ error: "Admin login isn't configured" });
    return;
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Wrong password" });
    return;
  }

  res.setHeader("Set-Cookie", createAdminSessionCookie());
  res.status(200).json({ ok: true });
}

function handleAdminLogout(req, res) {
  res.setHeader("Set-Cookie", clearAdminSessionCookie());
  res.status(200).json({ ok: true });
}
