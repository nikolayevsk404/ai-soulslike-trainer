import { regenStamina } from "./stamina";
import type { GameState } from "./types";

const updateAirState = (velocityY: number, airborne: boolean) => {
  const nextVelocityY = airborne ? velocityY - 0.35 : 0;
  const nextAirborne = airborne && nextVelocityY > -1.9;

  return {
    velocityY: nextAirborne ? nextVelocityY : 0,
    airborne: nextAirborne
  };
};

export const gameLoop = (state: GameState): GameState => {
  const nextPlayerAir = updateAirState(state.player.velocityY, state.player.airborne);
  const nextAiAir = updateAirState(state.ai.velocityY, state.ai.airborne);

  return {
    ...state,
    tick: state.tick + 1,
    player: {
      ...state.player,
      ...nextPlayerAir,
      stamina: regenStamina(state.player.stamina),
      actionCooldown: Math.max(0, state.player.actionCooldown - 1)
    },
    ai: {
      ...state.ai,
      ...nextAiAir,
      stamina: regenStamina(state.ai.stamina),
      actionCooldown: Math.max(0, state.ai.actionCooldown - 1)
    }
  };
};
