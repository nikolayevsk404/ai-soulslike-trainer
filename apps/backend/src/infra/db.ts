import { Pool } from "pg";

let pool: Pool | null = null;

export const getDbPool = (): Pool | null => {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
  }

  return pool;
};

export const initDb = async (): Promise<void> => {
  const db = getDbPool();

  if (!db) {
    return;
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS ai_behavior_logs (
      id SERIAL PRIMARY KEY,
      tick INT NOT NULL,
      player_pattern TEXT NOT NULL,
      player_action TEXT,
      ai_action TEXT NOT NULL,
      snapshot JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
};
