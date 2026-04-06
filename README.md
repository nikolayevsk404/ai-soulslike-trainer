# AI Soulslike Trainer

Monorepo com frontend React, backend Node + WebSocket, agent adaptativo e regras puras de jogo.

## Rodando localmente

```bash
corepack pnpm dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:3001`

## Docker

```bash
docker compose up --build
```

## Estrutura

- `apps/frontend`: interface React + Vite
- `apps/backend`: servidor Express + WebSocket
- `packages/agent`: heuristica adaptativa da IA
- `packages/game-core`: loop e regras puras do combate
