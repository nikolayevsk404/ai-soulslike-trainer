import type { CoreAction } from "./types";

const COST_MAP: Record<Exclude<CoreAction, "idle">, number> = {
  move_left: 2,
  move_right: 2,
  jump: 8,
  attack: 10,
  parry: 12,
  heavy_attack: 20,
  roll: 15
};

export const getActionCost = (action: CoreAction): number => {
  if (action === "idle") {
    return 0;
  }

  return COST_MAP[action];
};

export const regenStamina = (stamina: number, amount = 6): number =>
  Math.min(100, stamina + amount);
