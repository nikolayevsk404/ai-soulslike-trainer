import { describe, expect, it } from "vitest";
import { applyAction, createInitialGameState, gameLoop, getActionCost, type GameState } from "../src";

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

    expect(nextState.player.position).toBe(-5.05);
    expect(nextState.player.facing).toBe(1);
  });

  it("coloca o fighter no ar ao pular", () => {
    const state = createInitialGameState();
    const jumped = applyAction(state, "player", "jump");

    expect(jumped.player.airborne).toBe(true);
    expect(jumped.player.velocityY).toBeGreaterThan(0);
  });

  it("encerra a acao e volta para idle apos o cooldown", () => {
    let state = applyAction(createInitialGameState(), "player", "attack");

    for (let index = 0; index < 6; index += 1) {
      state = gameLoop(state);
    }

    expect(state.player.actionCooldown).toBe(0);
    expect(state.player.lastAction).toBe("idle");
  });

  it("nao gasta stamina ao andar ou aparar", () => {
    const base = createInitialGameState();
    const moved = applyAction(base, "player", "move_right");
    const parried = applyAction(base, "player", "parry");

    expect(moved.player.stamina).toBe(base.player.stamina);
    expect(parried.player.stamina).toBe(base.player.stamina);
  });

  it("gasta mais stamina em atacar, rolar e pular", () => {
    expect(getActionCost("attack")).toBe(18);
    expect(getActionCost("roll")).toBe(24);
    expect(getActionCost("jump")).toBe(14);
  });

  it("usa a direcao informada no roll", () => {
    const base: GameState = {
      ...createInitialGameState(),
      player: { ...createInitialGameState().player, position: 0 }
    };
    const rolled = applyAction(base, "player", "roll", { facingOverride: -1 });

    expect(rolled.player.facing).toBe(-1);
    expect(rolled.player.position).toBeLessThan(base.player.position);
  });

  it("mantem movimento horizontal durante o pulo", () => {
    const base: GameState = {
      ...createInitialGameState(),
      player: { ...createInitialGameState().player, position: 0, facing: -1 }
    };
    const jumped = applyAction(base, "player", "jump", { facingOverride: -1 });
    const drifting = applyAction(jumped, "player", "move_left");

    expect(jumped.player.position).toBeLessThan(base.player.position);
    expect(drifting.player.position).toBeLessThan(jumped.player.position);
    expect(drifting.player.lastAction).toBe("jump");
  });
});
