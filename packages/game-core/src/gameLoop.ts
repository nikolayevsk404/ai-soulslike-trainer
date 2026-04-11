import { regenStamina } from "./stamina";
import type { FighterState, GameState } from "./types";

const updateAirState = (velocityY: number, airborne: boolean) => {
  const nextVelocityY = airborne ? velocityY - 0.35 : 0;
  const nextAirborne = airborne && nextVelocityY > -2;

  return {
    velocityY: nextAirborne ? nextVelocityY : 0,
    airborne: nextAirborne
  };
};

const tickFighter = (fighter: FighterState): FighterState => {
  const nextAir = updateAirState(fighter.velocityY, fighter.airborne);
  const nextCooldown = Math.max(0, fighter.actionCooldown - 1);
  const shouldReturnToIdle = nextCooldown === 0 && !nextAir.airborne && fighter.lastAction !== "idle";

  return {
    ...fighter,
    ...nextAir,
    stamina: regenStamina(fighter.stamina),
    actionCooldown: nextCooldown,
    lastAction: shouldReturnToIdle ? "idle" : fighter.lastAction
  };
};

export const gameLoop = (state: GameState): GameState => {
  return {
    ...state,
    tick: state.tick + 1,
    player: tickFighter(state.player),
    ai: tickFighter(state.ai)
  };
};
