import { describe, expect, it } from "vitest";
import { applyAction, createInitialGameState, gameLoop } from "../src";

describe("game-core", () => {
  it("aplica dano em ataque simples", () => {
    const base = createInitialGameState();
    const state = {
      ...base,
      player: { ...base.player, position: 0 },
      ai: { ...base.ai, position: 2 },
      distance: 2
    };
    const nextState = applyAction(state, "player", "attack");

    expect(nextState.ai.hp).toBe(90);
  });

  it("regenera stamina no loop", () => {
    const state = {
      ...createInitialGameState(),
      player: { ...createInitialGameState().player, stamina: 50 }
    };

    const nextState = gameLoop(state);
    expect(nextState.player.stamina).toBe(56);
    expect(nextState.tick).toBe(1);
  });

  it("define vencedor quando hp chega a zero", () => {
    const base = createInitialGameState();
    const state = {
      ...base,
      player: { ...base.player, position: 0 },
      ai: { ...base.ai, hp: 15, position: 2 },
      distance: 2
    };

    const nextState = applyAction(state, "player", "heavy_attack");
    expect(nextState.winner).toBe("player");
  });

  it("move o player lateralmente", () => {
    const state = createInitialGameState();
    const nextState = applyAction(state, "player", "move_right");

    expect(nextState.player.position).toBe(-5.2);
    expect(nextState.player.facing).toBe(1);
  });

  it("coloca o fighter no ar ao pular", () => {
    const state = createInitialGameState();
    const jumped = applyAction(state, "player", "jump");

    expect(jumped.player.airborne).toBe(true);
    expect(jumped.player.velocityY).toBeGreaterThan(0);
  });
});
