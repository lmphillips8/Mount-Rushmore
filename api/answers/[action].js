import { ObjectId } from "mongodb";
import { getDb } from "../lib/db.js";
import { getSession } from "../lib/session.js";
import { todayEastern } from "../lib/date.js";

// Handles /api/answers/submit, /today, /history — consolidated into one
// function (see api/auth/[action].js for why).
export default async function handler(req, res) {
  const { action } = req.query;

  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }

  const db = await getDb();

  if (action === "submit") {
    if (req.method !== "POST") {
      res.status(405).end();
      return;
    }
    const { promptId, answers } = req.body;
    if (
      !Array.isArray(answers) ||
      answers.length !== 4 ||
      answers.some((a) => !a?.trim())
    ) {
      res.status(400).json({ error: "Provide exactly 4 non-empty answers" });
      return;
    }
    try {
      await db.collection("answers").insertOne({
        promptId: new ObjectId(promptId),
        userId: session.userId,
        username: session.username,
        answers: answers.map((a) => a.trim()),
        submittedAt: new Date(),
      });
      res.status(201).json({ ok: true });
    } catch (err) {
      if (err.code === 11000) {
        res.status(409).json({ error: "You already submitted today" });
      } else {
        console.error(err);
        res.status(500).json({ error: "Failed to save answers" });
      }
    }
    return;
  }

  if (action === "today") {
    const { promptId } = req.query;
    const mine = await db.collection("answers").findOne({
      promptId: new ObjectId(promptId),
      userId: session.userId,
    });

    if (!mine) {
      res.status(200).json({ unlocked: false, answers: [] });
      return;
    }

    const all = await db
      .collection("answers")
      .find({ promptId: new ObjectId(promptId) })
      .project({
        username: 1,
        userId: 1,
        answers: 1,
        submittedAt: 1,
        reactions: 1,
      })
      .sort({ submittedAt: 1 })
      .toArray();

    res.status(200).json({ unlocked: true, answers: all });
    return;
  }

  if (action === "history") {
    const today = todayEastern();
    const prompts = await db
      .collection("prompts")
      .find({ date: { $lt: today } })
      .sort({ date: -1 })
      .toArray();

    const results = await Promise.all(
      prompts.map(async (prompt) => {
        const answers = await db
          .collection("answers")
          .find({ promptId: prompt._id })
          .project({ username: 1, answers: 1, reactions: 1 })
          .toArray();
        return {
          id: prompt._id,
          date: prompt.date,
          text: prompt.text,
          emoji: prompt.emoji,
          answers,
        };
      }),
    );

    res.status(200).json({ history: results });
    return;
  }

  if (action === "react") {
    if (req.method !== "POST") {
      res.status(405).end();
      return;
    }
    const { answerId, emoji } = req.body || {};
    if (!answerId || !emoji) {
      res.status(400).json({ error: "Missing answerId or emoji" });
      return;
    }

    let objectId;
    try {
      objectId = new ObjectId(answerId);
    } catch {
      res.status(400).json({ error: "Invalid answerId" });
      return;
    }

    const existing = await db.collection("answers").findOne(
      {
        _id: objectId,
        reactions: { $elemMatch: { userId: session.userId, emoji } },
      },
      { projection: { _id: 1 } },
    );

    // Toggle: pull if this user already reacted with this emoji, otherwise push.
    if (existing) {
      await db
        .collection("answers")
        .updateOne(
          { _id: objectId },
          { $pull: { reactions: { userId: session.userId, emoji } } },
        );
    } else {
      await db.collection("answers").updateOne(
        { _id: objectId },
        {
          $push: {
            reactions: {
              userId: session.userId,
              username: session.username,
              emoji,
            },
          },
        },
      );
    }

    const updated = await db
      .collection("answers")
      .findOne({ _id: objectId }, { projection: { reactions: 1 } });

    if (!updated) {
      res.status(404).json({ error: "Answer not found" });
      return;
    }

    res.status(200).json({ reactions: updated.reactions || [] });
    return;
  }

  res.status(404).json({ error: "Unknown answers action" });
}
