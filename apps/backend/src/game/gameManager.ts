import { applyAction, createInitialGameState, gameLoop, type CoreAction, type GameState } from "@ai-soulslike/game-core";
import { AgentService } from "../services/agentService";
import { BehaviorLogService } from "../services/behaviorLogService";
import type { MatchStatus, ReplayEntry } from "../types";

export class GameManager {
  private static readonly AI_OPENING_GRACE_TICKS = 12;
  private static readonly AI_THINK_INTERVAL = 3;

  private state: GameState = createInitialGameState();
  private readonly agentService = new AgentService();
  private readonly logService = new BehaviorLogService();
  private pendingPlayerAction: CoreAction | null = null;
  private status: MatchStatus = "waiting";

  start() {
    if (this.status === "finished") {
      this.reset();
    }

    this.status = "running";
  }

  queuePlayerAction(action: CoreAction) {
    if (this.status !== "running") {
      return;
    }

    this.pendingPlayerAction = action;
  }

  reset() {
    this.state = createInitialGameState();
    this.pendingPlayerAction = null;
    this.status = "waiting";
    this.logService.reset();
  }

  getState() {
    return this.state;
  }

  getStatus() {
    return this.status;
  }

  getReplay(): ReplayEntry[] {
    return this.logService.getReplay().map((entry) => ({
      tick: entry.tick,
      playerAction: entry.playerAction,
      aiAction: entry.aiAction,
      state: entry.state
    }));
  }

  async tick() {
    if (this.status !== "running") {
      return {
        state: this.state,
        aiAction: null
      };
    }

    let nextState = gameLoop(this.state);
    const playerAction = this.pendingPlayerAction;

    if (playerAction) {
      nextState = applyAction(nextState, "player", playerAction);
    }

    let aiAction: CoreAction = "idle";

    const aiCanAct =
      nextState.tick > GameManager.AI_OPENING_GRACE_TICKS &&
      nextState.tick % GameManager.AI_THINK_INTERVAL === 0;

    if (aiCanAct) {
      const agentDecision = this.agentService.decide(nextState);
      aiAction = this.agentService.toCoreAction(agentDecision);

      if (aiAction === "idle") {
        aiAction = this.agentService.decideMovement(nextState);
      }

      nextState = applyAction(nextState, "ai", aiAction);
    }

    this.state = nextState;
    this.pendingPlayerAction = null;

    if (nextState.winner) {
      this.status = "finished";
    }

    await this.logService.log({
      tick: nextState.tick,
      playerAction,
      aiAction: aiCanAct ? aiAction : null,
      state: nextState,
      memory: this.agentService.getMemory()
    });

    return {
      state: nextState,
      aiAction: aiCanAct ? aiAction : null
    };
  }
}
