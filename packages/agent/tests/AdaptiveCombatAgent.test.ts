import { describe, expect, it } from "vitest";
import { AdaptiveCombatAgent } from "../src/AdaptiveCombatAgent";
import type { AgentGameState } from "../src/types";

const buildState = (overrides: Partial<AgentGameState> = {}): AgentGameState => ({
  tick: 1,
  playerHp: 100,
  aiHp: 100,
  playerDistance: 3,
  playerRolling: false,
  playerAttacking: false,
  playerStamina: 100,
  aiStamina: 100,
  lastPlayerActions: ["attack", "roll", "roll", "roll", "roll", "roll"],
  ...overrides
});

describe("AdaptiveCombatAgent", () => {
  it("countera roll spam com heavy attack", () => {
    const agent = new AdaptiveCombatAgent();
    const action = agent.decide(buildState());

    expect(action).toBe("heavy_attack");
  });

  it("faz parry quando o player ataca de perto", () => {
    const agent = new AdaptiveCombatAgent();
    const action = agent.decide(
      buildState({
        playerDistance: 1.5,
        playerAttacking: true,
        lastPlayerActions: ["attack", "attack", "parry"]
      })
    );

    expect(action).toBe("parry");
  });

  it("mantem memoria atualizada com distancia media", () => {
    const agent = new AdaptiveCombatAgent();
    agent.updateMemory(buildState({ playerDistance: 5, lastPlayerActions: ["attack"] }));
    const memory = agent.updateMemory(buildState({ playerDistance: 1, lastPlayerActions: ["roll"] }));

    expect(memory.averageDistance).toBe(3);
    expect(memory.rollFrequency).toBe(1);
  });
});
