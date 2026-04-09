export type CombatAction =
  | "attack"
  | "parry"
  | "heavy_attack"
  | "wait"
  | "roll"
  | "move_left"
  | "move_right"
  | "jump";

export interface AgentMemory {
  rollFrequency: number;
  aggressivePlayer: boolean;
  averageDistance: number;
  observedActions: number;
}

export interface AgentGameState {
  tick: number;
  playerHp: number;
  aiHp: number;
  playerDistance: number;
  playerRolling: boolean;
  playerAttacking: boolean;
  playerStamina: number;
  aiStamina: number;
  lastPlayerActions: CombatAction[];
}
