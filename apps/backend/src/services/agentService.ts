import { AdaptiveCombatAgent, type AgentGameState, type CombatAction } from "@ai-soulslike/agent";
import type { CoreAction, GameState } from "@ai-soulslike/game-core";

export class AgentService {
  private readonly agent = new AdaptiveCombatAgent();

  decide(state: GameState): CombatAction {
    return this.agent.decide(this.toAgentState(state));
  }

  getMemory() {
    return this.agent.getMemory();
  }

  toCoreAction(action: CombatAction): CoreAction {
    return action === "wait" ? "idle" : action;
  }

  decideMovement(state: GameState): CoreAction {
    if (state.distance > 3.4) {
      return state.ai.position > state.player.position ? "move_left" : "move_right";
    }

    if (state.distance < 1.4 && state.player.lastAction === "attack") {
      return state.ai.position > state.player.position ? "move_right" : "move_left";
    }

    return "idle";
  }

  private toAgentState(state: GameState): AgentGameState {
    const lastPlayerActions = state.logs
      .filter((entry) => entry.actor === "player")
      .slice(-12)
      .filter((entry) => entry.action !== "idle")
      .map((entry) => (entry.action === "idle" ? "wait" : entry.action));

    return {
      tick: state.tick,
      playerHp: state.player.hp,
      aiHp: state.ai.hp,
      playerDistance: state.distance,
      playerRolling: state.player.lastAction === "roll",
      playerAttacking: state.player.lastAction === "attack" || state.player.lastAction === "heavy_attack",
      playerStamina: state.player.stamina,
      aiStamina: state.ai.stamina,
      lastPlayerActions
    };
  }
}
