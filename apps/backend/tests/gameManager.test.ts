import { describe, expect, it } from "vitest";
import { GameManager } from "../src/game/gameManager";

describe("GameManager", () => {
  it("da uma janela inicial antes da IA atacar", async () => {
    const manager = new GameManager();
    manager.start();
    manager.queuePlayerAction("roll");

    const result = await manager.tick();

    expect(result.state.tick).toBe(1);
    expect(result.state.logs.some((entry) => entry.actor === "player")).toBe(true);
    expect(result.state.logs.some((entry) => entry.actor === "ai")).toBe(false);
    expect(result.aiAction).toBeNull();
  });

  it("faz a IA agir apenas depois da janela inicial", async () => {
    const manager = new GameManager();
    manager.start();

    let result = await manager.tick();

    for (let index = 0; index < 23; index += 1) {
      result = await manager.tick();
    }

    expect(result.state.tick).toBe(24);
    expect(result.state.logs.some((entry) => entry.actor === "ai")).toBe(true);
  });
});
