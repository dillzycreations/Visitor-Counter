import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const db = new Low(new JSONFile("db.json"), { counters: {} });

// Helper: update counter safely
async function incrementCounter(id) {
  await db.read();
  db.data ||= { counters: {} };
  db.data.counters[id] = (db.data.counters[id] || 0) + 1;
  await db.write();
  return db.data.counters[id];
}

// Main API handler
export default async function handler(req, res) {
  const { id } = req.query;

  // if no ID, show all counters
  if (!id) {
    await db.read();
    return res.status(200).json(db.data.counters);
  }

  // Increment the counter
  const hits = await incrementCounter(id);

  // Return JSON
  return res.status(200).json({ id, hits });
}
