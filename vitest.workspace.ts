import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "packages/agent/vitest.config.ts",
  "packages/game-core/vitest.config.ts",
  "apps/backend/vitest.config.ts"
]);
