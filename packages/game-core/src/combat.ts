import { getActionCost } from "./stamina";
import type { ActorType, CoreAction, FighterState, GameState } from "./types";

interface ApplyActionOptions {
  facingOverride?: -1 | 1;
}

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

const getActionDuration = (action: CoreAction): number => {
  switch (action) {
    case "heavy_attack":
      return 8;
    case "attack":
      return 5;
    case "roll":
      return 4;
    case "parry":
      return 2;
    case "jump":
      return 5;
    case "move_left":
    case "move_right":
      return 2;
    case "idle":
    default:
      return 0;
  }
};

export const applyAction = (
  state: GameState,
  actor: ActorType,
  action: CoreAction,
  options: ApplyActionOptions = {}
): GameState => {
  const actorState = state[actor];
  const target = actor === "player" ? "ai" : "player";
  const targetState = state[target];
  const cost = getActionCost(action);
  const distance = Math.abs(state.player.position - state.ai.position);
  const facing = options.facingOverride ?? actorState.facing;
  const isMoveAction = action === "move_left" || action === "move_right";
  const canAdjustAirMovement = isMoveAction && actorState.airborne;

  if (state.winner || (actorState.actionCooldown > 0 && !canAdjustAirMovement) || !canSpendStamina(actorState, action)) {
    return state;
  }

  let updatedActor = {
    ...actorState,
    stamina: Math.max(0, actorState.stamina - cost),
    lastAction: canAdjustAirMovement ? actorState.lastAction : action,
    facing,
    actionCooldown: canAdjustAirMovement ? actorState.actionCooldown : getActionDuration(action)
  };

  let updatedTarget = { ...targetState };

  if ((action === "attack" && distance <= 3) || (action === "heavy_attack" && distance <= 3.5)) {
    const damage = updatedTarget.lastAction === "parry" || updatedTarget.lastAction === "roll" ? 0 : getDamage(action);
    updatedTarget = {
      ...updatedTarget,
      hp: Math.max(0, updatedTarget.hp - damage)
    };
  }

  if (action === "move_left") {
    updatedActor = {
      ...updatedActor,
      position: clampPosition(actorState.position - 0.95),
      facing: -1
    };
  }

  if (action === "move_right") {
    updatedActor = {
      ...updatedActor,
      position: clampPosition(actorState.position + 0.95),
      facing: 1
    };
  }

  if (action === "jump" && !actorState.airborne) {
    updatedActor = {
      ...updatedActor,
      airborne: true,
      velocityY: 2,
      position: clampPosition(actorState.position + facing * 0.35)
    };
  }

  if (action === "roll") {
    updatedActor = {
      ...updatedActor,
      position: clampPosition(actorState.position + facing * 1.55),
      facing
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
