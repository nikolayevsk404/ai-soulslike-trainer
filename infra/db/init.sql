CREATE TABLE IF NOT EXISTS ai_behavior_logs (
  id SERIAL PRIMARY KEY,
  tick INT NOT NULL,
  player_pattern TEXT NOT NULL,
  player_action TEXT,
  ai_action TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
