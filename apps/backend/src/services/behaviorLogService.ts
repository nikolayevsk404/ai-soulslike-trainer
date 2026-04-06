import type { AgentMemory } from "@ai-soulslike/agent";
import type { CoreAction, GameState } from "@ai-soulslike/game-core";
import { getDbPool } from "../infra/db";

export interface BehaviorLogInput {
  tick: number;
  playerAction: CoreAction | null;
  aiAction: CoreAction | null;
  state: GameState;
  memory: AgentMemory;
}

export class BehaviorLogService {
  private readonly replay: BehaviorLogInput[] = [];

  async log(entry: BehaviorLogInput): Promise<void> {
    this.replay.push(entry);

    const db = getDbPool();

    if (!db) {
      return;
    }

    const pattern = entry.memory.rollFrequency > 0.6 ? "roll_spam" : entry.memory.aggressivePlayer ? "aggressive" : "balanced";

    if (!entry.aiAction) {
      return;
    }

    await db.query(
      `
        INSERT INTO ai_behavior_logs (tick, player_pattern, player_action, ai_action, snapshot)
        VALUES ($1, $2, $3, $4, $5)
      `,
      [entry.tick, pattern, entry.playerAction, entry.aiAction, JSON.stringify(entry.state)]
    );
  }

  getReplay(): BehaviorLogInput[] {
    return this.replay.map((entry) => ({ ...entry }));
  }

  reset(): void {
    this.replay.length = 0;
  }
}
