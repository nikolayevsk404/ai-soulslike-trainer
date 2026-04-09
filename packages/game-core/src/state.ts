import type { GameState } from "./types";

export const createInitialGameState = (): GameState => ({
  tick: 0,
  player: {
    hp: 100,
    stamina: 100,
    position: -6,
    velocityY: 0,
    facing: 1,
    airborne: false,
    lastAction: "idle",
    actionCooldown: 0
  },
  ai: {
    hp: 100,
    stamina: 100,
    position: 6,
    velocityY: 0,
    facing: -1,
    airborne: false,
    lastAction: "idle",
    actionCooldown: 0
  },
  distance: 12,
  logs: [],
  winner: null
});
