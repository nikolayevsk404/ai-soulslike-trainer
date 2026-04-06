FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/game-core/package.json packages/game-core/package.json

RUN pnpm install --recursive --no-frozen-lockfile

COPY apps/frontend apps/frontend
COPY packages/game-core packages/game-core

EXPOSE 5173

CMD ["pnpm", "--filter", "@ai-soulslike/frontend", "dev", "--", "--host", "0.0.0.0"]
