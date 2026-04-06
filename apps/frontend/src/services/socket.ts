import type { CoreAction, GameState } from "@ai-soulslike/game-core";

export type MatchStatus = "waiting" | "running" | "finished";

export interface ReplayEntry {
  tick: number;
  playerAction: CoreAction | null;
  aiAction: CoreAction | null;
  state: GameState;
}

export interface ServerEventMap {
  AI_ACTION: { action: CoreAction };
  STATE_UPDATE: { state: GameState; replay: ReplayEntry[]; status: MatchStatus };
  GAME_RESET: { state: GameState; status: MatchStatus };
  ERROR: { message: string };
}

export type ServerEvent = {
  [Type in keyof ServerEventMap]: {
    type: Type;
    payload: ServerEventMap[Type];
  };
}[keyof ServerEventMap];

export const createGameSocket = () => {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const url = `${protocol}://${window.location.hostname}:3001`;

  return new WebSocket(url);
};
