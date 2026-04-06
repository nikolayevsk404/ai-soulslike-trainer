import type { CoreAction, GameState } from "@ai-soulslike/game-core";

export type MatchStatus = "waiting" | "running" | "finished";

export type ClientEventType = "PLAYER_ACTION" | "RESET_GAME" | "START_GAME";
export type ServerEventType = "STATE_UPDATE" | "AI_ACTION" | "GAME_RESET" | "ERROR";

export interface ClientMessage {
  type: ClientEventType;
  payload?: {
    action?: CoreAction;
  };
}

export interface ServerMessage {
  type: ServerEventType;
  payload: Record<string, unknown>;
}

export interface ReplayEntry {
  tick: number;
  playerAction: CoreAction | null;
  aiAction: CoreAction | null;
  state: GameState;
}
