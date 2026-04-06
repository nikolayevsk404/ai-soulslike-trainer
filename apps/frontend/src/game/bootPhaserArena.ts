import type { GameState } from "@ai-soulslike/game-core";
import type { MatchStatus } from "../services/socket";

type CoreAction = GameState["player"]["lastAction"];

type PhaserLike = typeof import("phaser");

export interface PhaserArenaHooks {
  connected: boolean;
  status: MatchStatus;
  state: GameState;
  onAction: (action: CoreAction) => void;
  onReady?: () => void;
  onError?: (message: string) => void;
  onStageChange?: (stage: string) => void;
}

export interface PhaserArenaController {
  destroy: () => void;
  sync: (patch: Pick<PhaserArenaHooks, "connected" | "status" | "state" | "onAction">) => void;
}

const MIN_WORLD_X = 110;
const MAX_WORLD_X = 850;
const POSITION_MIN = -6;
const POSITION_MAX = 6;
const groundY = 432;

const toWorldX = (position: number) => {
  const normalized = (position - POSITION_MIN) / (POSITION_MAX - POSITION_MIN);
  return MIN_WORLD_X + normalized * (MAX_WORLD_X - MIN_WORLD_X);
};

const getJumpLift = (velocityY: number, airborne: boolean, peak = 96) => {
  if (!airborne) {
    return 0;
  }

  const normalized = Math.max(0, 1 - Math.abs(velocityY) / 1.9);
  return normalized * peak;
};

let phaserImportPromise: Promise<PhaserLike> | null = null;

const loadPhaser = async (): Promise<PhaserLike> => {
  if (!phaserImportPromise) {
    phaserImportPromise = import("phaser").then((module) =>
      (("default" in module ? module.default : module) as unknown) as PhaserLike
    );
  }

  return phaserImportPromise;
};

export const bootPhaserArena = async (
  container: HTMLElement,
  initialHooks: PhaserArenaHooks
): Promise<PhaserArenaController> => {
  const hooks = { ...initialHooks };
  const Phaser = await loadPhaser();

  hooks.onStageChange?.("modulo phaser carregado");

  let player: any;
  let boss: any;
  let overlay: any;
  let cursors: any;
  let keys: Record<string, any> | undefined;
  const actionCooldowns = new Map<string, number>();

  const scene = {
    key: "arena",
    create(this: any) {
      hooks.onStageChange?.("scene.create");

      this.add.rectangle(480, 270, 960, 540, 0x0f0d12, 1);
      this.add.rectangle(480, 120, 960, 180, 0x1d1821, 0.9);
      this.add.rectangle(480, 220, 960, 220, 0x141118, 0.75);
      this.add.rectangle(480, 460, 960, 160, 0x09080b, 0.95);
      this.add.rectangle(480, groundY + 4, 960, 8, 0xc7d0db, 0.3);
      this.add.rectangle(480, groundY + 34, 960, 90, 0x0a090c, 0.92);
      this.add.rectangle(210, 388, 120, 80, 0x1a1720, 0.65);
      this.add.rectangle(750, 398, 180, 60, 0x1a1720, 0.55);

      hooks.onStageChange?.("criando entidades");
      player = this.add.rectangle(360, groundY, 52, 78, 0xe4e7ef, 1).setOrigin(0.5, 1);
      boss = this.add.rectangle(620, groundY, 104, 148, 0x53698a, 1).setOrigin(0.5, 1);
      player.setStrokeStyle(2, 0x1d1d22, 1);
      boss.setStrokeStyle(3, 0x11141a, 1);
      this.add
        .text(28, 24, "WASD / setas para mover", {
          fontFamily: "Cinzel, Georgia, serif",
          fontSize: "18px",
          color: "#f2e5c8"
        })
        .setDepth(10);

      overlay = this.add
        .text(480, 262, "", {
          fontFamily: "Cinzel, Georgia, serif",
          fontSize: "30px",
          color: "#f0dfbc",
          align: "center"
        })
        .setOrigin(0.5)
        .setDepth(12);

      hooks.onStageChange?.("configurando input");
      cursors = this.input.keyboard?.createCursorKeys();
      keys = this.input.keyboard?.addKeys({
        w: Phaser.Input.Keyboard.KeyCodes.W,
        a: Phaser.Input.Keyboard.KeyCodes.A,
        s: Phaser.Input.Keyboard.KeyCodes.S,
        d: Phaser.Input.Keyboard.KeyCodes.D,
        j: Phaser.Input.Keyboard.KeyCodes.J,
        k: Phaser.Input.Keyboard.KeyCodes.K,
        l: Phaser.Input.Keyboard.KeyCodes.L,
        space: Phaser.Input.Keyboard.KeyCodes.SPACE
      }) as Record<string, any>;

      this.input.keyboard?.addCapture([
        Phaser.Input.Keyboard.KeyCodes.UP,
        Phaser.Input.Keyboard.KeyCodes.DOWN,
        Phaser.Input.Keyboard.KeyCodes.LEFT,
        Phaser.Input.Keyboard.KeyCodes.RIGHT,
        Phaser.Input.Keyboard.KeyCodes.SPACE,
        Phaser.Input.Keyboard.KeyCodes.W,
        Phaser.Input.Keyboard.KeyCodes.A,
        Phaser.Input.Keyboard.KeyCodes.S,
        Phaser.Input.Keyboard.KeyCodes.D
      ]);

      hooks.onStageChange?.("arena pronta");
      hooks.onReady?.();
    },
    update(this: any, time: number) {
      if (!player || !boss) {
        return;
      }

      player.x = Phaser.Math.Linear(player.x, toWorldX(hooks.state.player.position), 0.18);
      boss.x = Phaser.Math.Linear(boss.x, toWorldX(hooks.state.ai.position), 0.13);

      const playerJumpOffset = getJumpLift(hooks.state.player.velocityY, hooks.state.player.airborne, 92);
      const bossJumpOffset = getJumpLift(hooks.state.ai.velocityY, hooks.state.ai.airborne, 82);

      player.y = Phaser.Math.Linear(player.y, groundY - playerJumpOffset, 0.35);
      boss.y = Phaser.Math.Linear(boss.y, groundY - bossJumpOffset, 0.35);

      const bossScale = hooks.state.ai.lastAction === "heavy_attack" ? 1.08 : 1;
      const playerScale = hooks.state.player.lastAction === "roll" ? 0.92 : 1;
      player.setScale(Phaser.Math.Linear(player.scaleX, playerScale, 0.22));
      boss.setScale(Phaser.Math.Linear(boss.scaleX, bossScale, 0.18));

      if (overlay) {
        if (hooks.status === "waiting") {
          overlay.setText("Pressione START para entrar na luta");
          overlay.setVisible(true);
        } else if (hooks.status === "finished") {
          overlay.setText(hooks.state.winner === "player" ? "Vitoria" : "You Died");
          overlay.setVisible(true);
        } else {
          overlay.setVisible(false);
        }
      }

      if (!hooks.connected || !cursors || !keys) {
        return;
      }

      const trigger = (name: string, pressed: boolean, cooldown = 120) => {
        const lastTime = actionCooldowns.get(name) ?? 0;

        if (!pressed || time - lastTime < cooldown) {
          return false;
        }

        actionCooldowns.set(name, time);
        return true;
      };

      if (trigger("move_left", cursors.left.isDown || keys.a.isDown)) {
        hooks.onAction("move_left");
      } else if (trigger("move_right", cursors.right.isDown || keys.d.isDown)) {
        hooks.onAction("move_right");
      }

      if (trigger("jump", cursors.up.isDown || keys.w.isDown || keys.space.isDown, 320)) {
        hooks.onAction("jump");
      }

      if (trigger("attack", keys.j.isDown, 240)) {
        hooks.onAction("attack");
      }

      if (trigger("roll", keys.k.isDown || cursors.down.isDown, 260)) {
        hooks.onAction("roll");
      }

      if (trigger("dodge", keys.l.isDown, 260)) {
        hooks.onAction("dodge");
      }
    }
  };

  hooks.onStageChange?.("instanciando Phaser.Game");

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: container,
    width: 960,
    height: 540,
    transparent: true,
    backgroundColor: "#000000",
    scene,
    scale: {
      mode: Phaser.Scale.NONE,
      autoCenter: Phaser.Scale.NO_CENTER
    }
  });

  return {
    destroy: () => {
      game.destroy(true);
    },
    sync: (patch) => {
      hooks.connected = patch.connected;
      hooks.status = patch.status;
      hooks.state = patch.state;
      hooks.onAction = patch.onAction;
    }
  };
};
