import type { CoreAction } from "./types";

const COST_MAP: Record<Exclude<CoreAction, "idle">, number> = {
  move_left: 0,
  move_right: 0,
  jump: 14,
  attack: 18,
  parry: 0,
  heavy_attack: 28,
  roll: 24
};

export const getActionCost = (action: CoreAction): number => {
  if (action === "idle") {
    return 0;
  }

  return COST_MAP[action];
};

export const regenStamina = (stamina: number, amount = 6): number =>
  Math.min(100, stamina + amount);
