import { getActionCost } from "./stamina";
import type { ActorType, CoreAction, FighterState, GameState } from "./types";

const canSpendStamina = (fighter: FighterState, action: CoreAction) =>
  fighter.stamina >= getActionCost(action);

const clampPosition = (position: number) => Math.max(-6, Math.min(6, position));

const getDamage = (action: CoreAction): number => {
  if (action === "heavy_attack") {
    return 18;
  }

  if (action === "attack") {
    return 10;
  }

  return 0;
};

export const applyAction = (state: GameState, actor: ActorType, action: CoreAction): GameState => {
  const actorState = state[actor];
  const target = actor === "player" ? "ai" : "player";
  const targetState = state[target];
  const cost = getActionCost(action);
  const distance = Math.abs(state.player.position - state.ai.position);

  if (state.winner || actorState.actionCooldown > 0 || !canSpendStamina(actorState, action)) {
    return state;
  }

  let updatedActor = {
    ...actorState,
    stamina: Math.max(0, actorState.stamina - cost),
    lastAction: action,
    actionCooldown:
      action === "heavy_attack"
        ? 7
        : action === "attack"
          ? 5
          : action === "roll" || action === "dodge"
            ? 4
            : action === "jump"
              ? 3
              : 2
  };

  let updatedTarget = { ...targetState };

  if ((action === "attack" && distance <= 3) || (action === "heavy_attack" && distance <= 3.5)) {
    const damage = updatedTarget.lastAction === "dodge" || updatedTarget.lastAction === "roll" ? 0 : getDamage(action);
    updatedTarget = {
      ...updatedTarget,
      hp: Math.max(0, updatedTarget.hp - damage)
    };
  }

  if (action === "move_left") {
    updatedActor = {
      ...updatedActor,
      position: clampPosition(actorState.position - 0.8),
      facing: -1
    };
  }

  if (action === "move_right") {
    updatedActor = {
      ...updatedActor,
      position: clampPosition(actorState.position + 0.8),
      facing: 1
    };
  }

  if (action === "jump" && !actorState.airborne) {
    updatedActor = {
      ...updatedActor,
      airborne: true,
      velocityY: 1.9
    };
  }

  if (action === "dodge" || action === "roll") {
    updatedActor = {
      ...updatedActor,
      position:
        action === "dodge"
          ? clampPosition(actorState.position - actorState.facing * 0.9)
          : clampPosition(actorState.position + actorState.facing * 1.2)
    };
  }

  const nextState = {
    ...state,
    [actor]: updatedActor,
    [target]: updatedTarget,
    distance:
      actor === "player"
        ? Math.abs(updatedActor.position - state.ai.position)
        : Math.abs(state.player.position - updatedActor.position),
    logs: [...state.logs, { actor, action, tick: state.tick }]
  };

  if (updatedTarget.hp <= 0) {
    return {
      ...nextState,
      winner: actor
    };
  }

  return nextState;
};
