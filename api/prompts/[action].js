import { getDb } from "../lib/db.js";
import { ObjectId } from "mongodb";
import { isAdmin } from "../lib/session.js";
import { todayEastern } from "../lib/date.js";

export default async function handler(req, res) {
  const { action } = req.query;
  if (action === "today" && req.method === "GET") {
    return handleToday(req, res);
  }
  if (action === "suggest" && req.method === "POST") {
    return handleSuggest(req, res);
  }
  if (action === "queue" && req.method === "GET") {
    return handleQueue(req, res);
  }
  if (action === "schedule" && req.method === "POST") {
    return handleSchedule(req, res);
  }
  if (action === "delete" && req.method === "POST") {
    return handleDelete(req, res);
  }
  if (action === "create") {
    return handleCreate(req, res);
  }

  return res.status(404).json({ error: "Not found" });
}

function todayString() {
  return new Date().toISOString().slice(0, 10); // "2026-07-28"
}

async function handleToday(req, res) {
  const db = await getDb();
  const date = todayEastern();

  let prompt = await db.collection("prompts").findOne({ date });

  if (!prompt) {
    res.status(400).json({ error: "No prompt set for today! Go bother Brian" });
    return;
  }

  res.status(200).json({
    id: prompt._id,
    date: prompt.date,
    text: prompt.text,
    emoji: prompt.emoji,
    submittedBy: prompt.submittedBy,
  });
}

async function handleSuggest(req, res) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const { text, emoji, submittedBy } = req.body || {};

  if (!text?.trim()) {
    res.status(400).json({ error: "Enter a prompt idea first" });
    return;
  }

  const db = await getDb();

  // Deliberately no `date` field — that's what marks this as a pending
  // suggestion rather than a scheduled prompt. An admin adds the date
  // later via /api/prompts/schedule to "approve" it.
  await db.collection("prompts").insertOne({
    text: text.trim().slice(0, 120),
    emoji: emoji || null,
    submittedBy: submittedBy?.trim().slice(0, 30) || "Anonymous",
    submittedAt: new Date(),
  });

  res.status(201).json({ ok: true });
}

async function handleQueue(req, res) {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "Admin login required" });
    return;
  }

  const db = await getDb();
  const today = todayEastern();

  const suggestions = await db
    .collection("prompts")
    .find({ date: { $exists: false } })
    .sort({ submittedAt: 1 })
    .toArray();

  const upcoming = await db
    .collection("prompts")
    .find({ date: { $gt: today } })
    .sort({ date: 1 })
    .toArray();

  res.status(200).json({ suggestions, upcoming });
}

async function handleSchedule(req, res) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  if (!isAdmin(req)) {
    res.status(401).json({ error: "Admin login required" });
    return;
  }

  const { id, date } = req.body || {};

  if (!id || !/^\d{4}-\d{2}-\d{2}$/.test(date || "")) {
    res.status(400).json({ error: "Provide an id and a date (YYYY-MM-DD)" });
    return;
  }

  const db = await getDb();

  try {
    const result = await db
      .collection("prompts")
      .updateOne({ _id: new ObjectId(id) }, { $set: { date } });

    if (result.matchedCount === 0) {
      res.status(404).json({ error: "Prompt not found" });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    if (err.code === 11000) {
      res
        .status(409)
        .json({ error: "That date is already taken by another prompt" });
    } else {
      console.error(err);
      res.status(500).json({ error: "Failed to schedule prompt" });
    }
  }
}

async function handleDelete(req, res) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  if (!isAdmin(req)) {
    res.status(401).json({ error: "Admin login required" });
    return;
  }

  const { id } = req.body || {};
  if (!id) {
    res.status(400).json({ error: "Missing id" });
    return;
  }

  const db = await getDb();
  const result = await db
    .collection("prompts")
    .deleteOne({ _id: new ObjectId(id) });

  res.status(200).json({ ok: true, deleted: result.deletedCount > 0 });
}

async function handleCreate(req, res) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  if (!isAdmin(req)) {
    res.status(401).json({ error: "Admin login required" });
    return;
  }

  const { text, emoji, date } = req.body || {};

  if (!text?.trim()) {
    res.status(400).json({ error: "Enter prompt text" });
    return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) {
    res.status(400).json({ error: "Provide a valid date (YYYY-MM-DD)" });
    return;
  }

  const db = await getDb();

  try {
    await db.collection("prompts").insertOne({
      text: text.trim().slice(0, 120),
      emoji: emoji || null,
      date,
      submittedBy: "Admin",
      submittedAt: new Date(),
    });
    res.status(201).json({ ok: true });
  } catch (err) {
    // Unique sparse index on `date` — this is the source of truth for
    // "one prompt per date", not just a UI-level check.
    if (err.code === 11000) {
      res
        .status(409)
        .json({ error: `There's already a prompt scheduled for ${date}` });
    } else {
      console.error(err);
      res.status(500).json({ error: "Failed to create prompt" });
    }
  }
}
