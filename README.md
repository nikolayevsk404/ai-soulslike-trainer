# AI Soulslike Trainer

Monorepo com frontend React, backend Node + WebSocket, agent adaptativo e regras puras de jogo.

## Documentacao

Os documentos de requisitos e arquitetura ficam em `doc/`:

- `doc/README.md`: indice da documentacao
- `doc/AI-SOULSLIKE-README.md`: visao geral do produto
- `doc/AI-SOULSLIKE-ARCHITECTURE.md`: arquitetura e separacao por pacotes
- `doc/AI-SOULSLIKE-AGENT.md`: resumo do `AdaptiveCombatAgent`
- `doc/AI-SOULSLIKE-TASKS.md`: backlog inicial

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
- `doc`: documentos de requisitos, arquitetura e backlog
