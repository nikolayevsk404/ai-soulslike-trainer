import type { AgentGameState, AgentMemory, CombatAction } from "./types";

const MEMORY_WINDOW = 12;

export class AdaptiveCombatAgent {
  private memory: AgentMemory = {
    rollFrequency: 0,
    aggressivePlayer: false,
    averageDistance: 0,
    observedActions: 0
  };

  decide(state: AgentGameState): CombatAction {
    this.updateMemory(state);

    if (this.memory.rollFrequency > 0.6 && state.aiStamina >= 20) {
      return "heavy_attack";
    }

    if (state.playerDistance < 2 && state.playerAttacking && state.aiStamina >= 12) {
      return "parry";
    }

    if (state.playerDistance <= 3.5 && state.aiStamina >= 10) {
      return "attack";
    }

    return "wait";
  }

  updateMemory(state: AgentGameState): AgentMemory {
    const recent = state.lastPlayerActions.slice(-MEMORY_WINDOW);
    const rollCount = recent.filter((action) => action === "roll").length;
    const attackCount = recent.filter((action) => action === "attack").length;
    const sampleSize = recent.length || 1;

    const observedActions = this.memory.observedActions + 1;

    this.memory = {
      rollFrequency: rollCount / sampleSize,
      aggressivePlayer: attackCount / sampleSize >= 0.45,
      averageDistance:
        (this.memory.averageDistance * this.memory.observedActions + state.playerDistance) /
        observedActions,
      observedActions
    };

    return this.memory;
  }

  getMemory(): AgentMemory {
    return { ...this.memory };
  }
}
