export type ActorType = "player" | "ai";
export type CoreAction =
  | "idle"
  | "move_left"
  | "move_right"
  | "jump"
  | "attack"
  | "parry"
  | "heavy_attack"
  | "roll";

export interface FighterState {
  hp: number;
  stamina: number;
  position: number;
  velocityY: number;
  facing: -1 | 1;
  airborne: boolean;
  lastAction: CoreAction;
  actionCooldown: number;
}

export interface ActionEvent {
  actor: ActorType;
  action: CoreAction;
  tick: number;
}

export interface GameState {
  tick: number;
  player: FighterState;
  ai: FighterState;
  distance: number;
  logs: ActionEvent[];
  winner: ActorType | null;
}
