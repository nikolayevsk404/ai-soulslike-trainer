FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-workspace.yaml tsconfig.base.json vitest.workspace.ts ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages/agent/package.json packages/agent/package.json
COPY packages/game-core/package.json packages/game-core/package.json

RUN pnpm install --recursive --no-frozen-lockfile

COPY apps/backend apps/backend
COPY packages packages

RUN pnpm --filter @ai-soulslike/backend build

EXPOSE 3001

CMD ["pnpm", "--filter", "@ai-soulslike/backend", "dev"]
