import type { GameState } from "./types";

export const createInitialGameState = (): GameState => ({
  tick: 0,
  player: {
    hp: 100,
    stamina: 100,
    position: 0,
    velocityY: 0,
    facing: 1,
    airborne: false,
    lastAction: "idle",
    actionCooldown: 0
  },
  ai: {
    hp: 100,
    stamina: 100,
    position: 3,
    velocityY: 0,
    facing: -1,
    airborne: false,
    lastAction: "idle",
    actionCooldown: 0
  },
  distance: 3,
  logs: [],
  winner: null
});
