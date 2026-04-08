# Architecture

## Monorepo
- apps/frontend
- apps/backend
- packages/agent
- packages/game-core

## Regras
- Agent isolado
- Game-core puro
- Backend orquestra

---

# AI Soulslike Trainer — Estrutura Profissional

## Monorepo (recomendado)

```
ai-soulslike-trainer/
├── apps/
│   ├── frontend/        # React
│   └── backend/         # Node + WS
├── packages/
│   ├── game-core/       # regras do jogo (shared)
│   └── agent/           # IA isolada
├── infra/
│   ├── docker/
│   └── db/
├── docs/
├── .env.example
├── package.json
└── README.md
```

## Separação de responsabilidades

### packages/agent
Onde mora a IA (isolada, testável)

```
agent/
├── src/
│   ├── AdaptiveCombatAgent.ts
│   ├── types.ts
│   └── strategies/
│       └── behaviorStrategy.ts
├── tests/
└── package.json
```

### packages/game-core
Regras do jogo (sem framework)

```
game-core/
├── src/
│   ├── gameLoop.ts
│   ├── state.ts
│   └── mechanics/
│       ├── combat.ts
│       └── stamina.ts
├── tests/
```

### apps/backend
Orquestra tudo

```
backend/
├── src/
│   ├── server.ts
│   ├── websocket/
│   │   └── socket.ts
│   ├── game/
│   │   └── gameManager.ts
│   ├── services/
│   │   └── agentService.ts
│   └── infra/
│       └── db.ts
├── tests/
```

### apps/frontend
UI simples

```
frontend/
├── src/
│   ├── components/
│   │   ├── GameCanvas.tsx
│   │   └── Controls.tsx
│   ├── hooks/
│   │   └── useSocket.ts
│   ├── pages/
│   │   └── Game.tsx
│   └── services/
│       └── socket.ts
```

## Regras de arquitetura

- agent NÃO conhece websocket
- game-core NÃO conhece frontend/backend
- backend só orquestra
- frontend só renderiza

## Tasks (para geração de código)

### TASK 1 — Setup Monorepo

Crie um monorepo usando pnpm workspaces com a seguinte estrutura:

- apps/frontend (React + Vite + TypeScript)
- apps/backend (Node + TypeScript + Express)
- packages/agent (lib TS)
- packages/game-core (lib TS)

Configure:
- tsconfig base compartilhado
- scripts de build
- import aliases (@agent, @game-core)

Tudo deve rodar com:
```
pnpm install && pnpm dev
```

### TASK 2 — Agent (core IA)

No package packages/agent, crie:

- classe AdaptiveCombatAgent
- método decide(state)
- método updateMemory(state)

Regras:
- detectar frequência de roll
- detectar distância do player
- decidir entre: attack, dodge, heavy_attack

Criar tipagens fortes (TypeScript)  
Criar testes unitários com vitest

### TASK 3 — Game Core

No package packages/game-core:

- criar GameState
- criar gameLoop()
- criar sistema de stamina
- criar função applyAction()

Regras:
- gameLoop deve ser independente de framework
- tudo deve ser puro (testável)

Adicionar testes

### TASK 4 — WebSocket Backend

No apps/backend:

- criar servidor Express
- integrar WebSocket com ws ou socket.io
- criar evento PLAYER_ACTION
- criar evento AI_ACTION

Integrar com:
- game-core
- agent

Criar game loop rodando a cada 100ms

### TASK 5 — Integração Agent + Game

Criar um GameManager que:

- recebe estado do jogo
- chama agent.decide()
- aplica ação no game-core
- emite resultado via websocket

Garantir separação de responsabilidades

### TASK 6 — Frontend React

No apps/frontend:

- criar tela Game
- criar botões:
  - attack
  - dodge
  - roll

- conectar via WebSocket
- mostrar log de ações em tempo real

Manter UI simples (foco é arquitetura)

### TASK 7 — Testes

Adicionar testes:

- agent (comportamento)
- game-core (regras)
- backend (websocket mock)

Usar vitest ou jest

### TASK 8 — Logs + DB

Adicionar PostgreSQL no backend:

- salvar decisões da IA
- salvar padrões do jogador

Criar service de log desacoplado

## Dicas de execução

### Ordem recomendada
Agent → Game Core → Backend → Frontend

### Commits
```
feat(agent): add adaptive combat behavior
feat(game-core): implement stamina system
feat(ws): real-time player actions
```

### README
Após finalizar:
- adicionar prints
- documentar arquitetura

## Resultado esperado

- arquitetura limpa
- IA real (sem dependência externa)
- realtime funcional
- código testável

---

# Architecture (Updated with Docker)

## Monorepo
- apps/frontend
- apps/backend
- packages/agent
- packages/game-core

## Docker

### Services
- frontend (React)
- backend (Node)
- postgres

### docker-compose.yml (example)
```yaml
version: '3.8'
services:
  backend:
    build: ./apps/backend
    ports:
      - "3000:3000"
    depends_on:
      - db

  frontend:
    build: ./apps/frontend
    ports:
      - "5173:5173"

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: soulslike
    ports:
      - "5432:5432"
```
