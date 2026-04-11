import type { GameState } from "@ai-soulslike/game-core";
import type { MatchStatus, PlayerActionPayload } from "../services/socket";
import { soulslikeAssets } from "./assets";

type CoreAction = GameState["player"]["lastAction"];

type PhaserLike = typeof import("phaser");

export interface PhaserArenaHooks {
  connected: boolean;
  status: MatchStatus;
  state: GameState;
  onAction: (action: CoreAction | PlayerActionPayload) => void;
  onReady?: () => void;
  onError?: (message: string) => void;
  onStageChange?: (stage: string) => void;
}

export interface PhaserArenaController {
  destroy: () => void;
  sync: (patch: Pick<PhaserArenaHooks, "connected" | "status" | "state" | "onAction">) => void;
}

const ARENA_WIDTH = 960;
const ARENA_HEIGHT = 540;
const MIN_WORLD_X = ARENA_WIDTH * 0.2;
const MAX_WORLD_X = ARENA_WIDTH * 0.8;
const POSITION_MIN = -6;
const POSITION_MAX = 6;
const groundY = 446;

type VisualState = "standing" | "walking1" | "walking2" | "jumping" | "attacking" | "rolling" | "parrying" | "dead";

const toWorldX = (position: number) => {
  const normalized = (position - POSITION_MIN) / (POSITION_MAX - POSITION_MIN);
  return MIN_WORLD_X + normalized * (MAX_WORLD_X - MIN_WORLD_X);
};

const getJumpLift = (velocityY: number, airborne: boolean, peak = 96) => {
  if (!airborne) {
    return 0;
  }

  const normalized = Math.max(0, 1 - Math.abs(velocityY) / 2);
  return normalized * peak;
};

const getVisualGroundOffset = (actor: "player" | "boss", visual: VisualState) => {
  if (actor === "player") {
    if (visual === "walking1") {
      return 6;
    }

    if (visual === "walking2") {
      return 2;
    }

    if (visual === "rolling") {
      return 4;
    }
  }

  return 0;
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
  let background: any;
  let overlay: any;
  let cursors: any;
  let bossMusic: any;
  let victorySound: any;
  let defeatSound: any;
  let lastStatus: MatchStatus | null = null;
  let keys: Record<string, any> | undefined;
  const actionCooldowns = new Map<string, number>();

  const resetArenaAudio = () => {
    bossMusic?.stop();
    victorySound?.stop();
    defeatSound?.stop();
  };

  const scene = {
    key: "arena",
    preload(this: any) {
      hooks.onStageChange?.("carregando assets");

      this.load.image("arena-background", soulslikeAssets.background);

      this.load.image("player-standing", soulslikeAssets.player.standing);
      this.load.image("player-walking1", soulslikeAssets.player.walking1);
      this.load.image("player-walking2", soulslikeAssets.player.walking2);
      this.load.image("player-jumping", soulslikeAssets.player.jumping);
      this.load.image("player-attacking", soulslikeAssets.player.attacking);
      this.load.image("player-rolling", soulslikeAssets.player.rolling);
      this.load.image("player-parrying", soulslikeAssets.player.parrying);
      this.load.image("player-dead", soulslikeAssets.player.dead);

      this.load.image("boss-standing", soulslikeAssets.boss.standing);
      this.load.image("boss-walking1", soulslikeAssets.boss.walking1);
      this.load.image("boss-walking2", soulslikeAssets.boss.walking2);
      this.load.image("boss-jumping", soulslikeAssets.boss.jumping);
      this.load.image("boss-attacking", soulslikeAssets.boss.attacking);
      this.load.image("boss-dead", soulslikeAssets.boss.dead);

      this.load.audio("soundtrack", "assets/sounds/soundtrack.mp3");
      this.load.audio("victory", "assets/sounds/victory.mp3");
      this.load.audio("defeat", "assets/sounds/defeat.mp3");
    },
    create(this: any) {
      hooks.onStageChange?.("scene.create");
      background = this.add.image(ARENA_WIDTH / 2, ARENA_HEIGHT / 2, "arena-background").setDepth(0);
      background.setDisplaySize(ARENA_WIDTH, ARENA_HEIGHT);

      hooks.onStageChange?.("criando entidades");
      player = this.add.image(MIN_WORLD_X, groundY, "player-standing").setOrigin(0.5, 1).setDepth(4);
      boss = this.add.image(MAX_WORLD_X, groundY, "boss-standing").setOrigin(0.5, 1).setDepth(4);
      player.setDisplaySize(136, 170);
      boss.setDisplaySize(216, 262);

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
        a: Phaser.Input.Keyboard.KeyCodes.A,
        d: Phaser.Input.Keyboard.KeyCodes.D,
        z: Phaser.Input.Keyboard.KeyCodes.Z,
        x: Phaser.Input.Keyboard.KeyCodes.X,
        c: Phaser.Input.Keyboard.KeyCodes.C,
        space: Phaser.Input.Keyboard.KeyCodes.SPACE
      }) as Record<string, any>;

      this.input.keyboard?.addCapture([
        Phaser.Input.Keyboard.KeyCodes.UP,
        Phaser.Input.Keyboard.KeyCodes.DOWN,
        Phaser.Input.Keyboard.KeyCodes.LEFT,
        Phaser.Input.Keyboard.KeyCodes.RIGHT,
        Phaser.Input.Keyboard.KeyCodes.A,
        Phaser.Input.Keyboard.KeyCodes.D,
        Phaser.Input.Keyboard.KeyCodes.SPACE,
        Phaser.Input.Keyboard.KeyCodes.Z,
        Phaser.Input.Keyboard.KeyCodes.X,
        Phaser.Input.Keyboard.KeyCodes.C
      ]);

      hooks.onStageChange?.("arena pronta");
      hooks.onReady?.();

      bossMusic = this.sound.add("soundtrack", { loop: true, volume: 0.5 });
      victorySound = this.sound.add("victory", { volume: 0.7 });
      defeatSound = this.sound.add("defeat", { volume: 0.7 });
    },
    update(this: any, time: number) {
      if (!player || !boss) {
        return;
      }

      if (hooks.status !== lastStatus) {
        if (hooks.status === "waiting") {
          resetArenaAudio();
        }

        if (hooks.status === "running") {
          victorySound?.stop();
          defeatSound?.stop();

          if (!bossMusic.isPlaying) {
            bossMusic.play();
          }
        }

        if (hooks.status === "finished") {
          bossMusic.stop();
          victorySound.stop();
          defeatSound.stop();

          if (hooks.state.winner === "player") {
            victorySound.play();
          } else {
            defeatSound.play();
          }
        }

        lastStatus = hooks.status;
      }

      player.x = Phaser.Math.Linear(player.x, toWorldX(hooks.state.player.position), 0.36);
      boss.x = Phaser.Math.Linear(boss.x, toWorldX(hooks.state.ai.position), 0.28);

      const walkingFrame: "walking1" | "walking2" = Math.floor(time / 220) % 2 === 0 ? "walking1" : "walking2";

      const resolveVisualState = (
        fighter: GameState["player"],
        status: MatchStatus,
        isWinner: boolean,
        actor: "player" | "boss"
      ): VisualState => {
        if (fighter.hp <= 0 || (status === "finished" && !isWinner)) {
          return "dead";
        }

        if (fighter.airborne || fighter.lastAction === "jump") {
          return "jumping";
        }

        if (fighter.lastAction === "attack" || fighter.lastAction === "heavy_attack") {
          return "attacking";
        }

        if (fighter.lastAction === "move_left" || fighter.lastAction === "move_right") {
          return walkingFrame;
        }

        if (fighter.lastAction === "roll" && actor === "player") {
          return "rolling";
        }

        if (fighter.lastAction === "parry" && actor === "player") {
          return "parrying";
        }

        return "standing";
      };

      const playerVisual = resolveVisualState(hooks.state.player, hooks.status, hooks.state.winner === "player", "player");
      const bossVisual = resolveVisualState(hooks.state.ai, hooks.status, hooks.state.winner === "ai", "boss");

      const playerJumpOffset = getJumpLift(hooks.state.player.velocityY, hooks.state.player.airborne, 92);
      const bossJumpOffset = getJumpLift(hooks.state.ai.velocityY, hooks.state.ai.airborne, 82);
      const playerGroundOffset = getVisualGroundOffset("player", playerVisual);
      const bossGroundOffset = getVisualGroundOffset("boss", bossVisual);

      player.y = Phaser.Math.Linear(player.y, groundY - playerJumpOffset + playerGroundOffset, 0.42);
      boss.y = Phaser.Math.Linear(boss.y, groundY - bossJumpOffset + bossGroundOffset, 0.42);

      const nextPlayerTexture = `player-${playerVisual}`;
      const nextBossTexture = `boss-${bossVisual}`;

      if (player.texture?.key !== nextPlayerTexture) {
        player.setTexture(nextPlayerTexture);
      }

      if (boss.texture?.key !== nextBossTexture) {
        boss.setTexture(nextBossTexture);
      }

      player.setFlipX(hooks.state.player.facing < 0);
      boss.setFlipX(hooks.state.ai.facing < 0);

      const bossScale = hooks.state.ai.lastAction === "heavy_attack" ? 1.03 : 1;
      const playerScale = hooks.state.player.lastAction === "roll" ? 0.94 : 1;
      player.setScale(Phaser.Math.Linear(player.scaleX, playerScale, 0.18));
      boss.setScale(Phaser.Math.Linear(boss.scaleX, bossScale, 0.12));

      if (overlay) {
        if (hooks.status === "waiting") {
          overlay.setText("Pressione START para começar");
          overlay.setVisible(true);
        } else if (hooks.status === "finished") {
          overlay.setText(hooks.state.winner === "player" ? "Enemy Felled" : "You Died");
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

      const movingLeft = cursors.left.isDown || keys.a.isDown;
      const movingRight = cursors.right.isDown || keys.d.isDown;
      const inputFacing: -1 | 1 | undefined = movingLeft ? -1 : movingRight ? 1 : undefined;

      if (trigger("move_left", movingLeft, 120)) {
        hooks.onAction({ action: "move_left", facing: -1 });
      } else if (trigger("move_right", movingRight, 120)) {
        hooks.onAction({ action: "move_right", facing: 1 });
      }

      if (trigger("jump", cursors.up.isDown || keys.space.isDown, 520)) {
        hooks.onAction(typeof inputFacing === "number" ? { action: "jump", facing: inputFacing } : "jump");
      }

      if (trigger("attack", keys.z.isDown, 420)) {
        hooks.onAction(typeof inputFacing === "number" ? { action: "attack", facing: inputFacing } : "attack");
      }

      if (trigger("roll", keys.x.isDown || cursors.down.isDown, 460)) {
        hooks.onAction({ action: "roll", facing: inputFacing ?? hooks.state.player.facing });
      }

      if (trigger("parry", keys.c.isDown, 120)) {
        hooks.onAction(typeof inputFacing === "number" ? { action: "parry", facing: inputFacing } : "parry");
      }
    }
  };

  hooks.onStageChange?.("instanciando Phaser.Game");

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: container,
    width: ARENA_WIDTH,
    height: ARENA_HEIGHT,
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
      resetArenaAudio();
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
