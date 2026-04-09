# AI Soulslike Trainer

Monorepo de simulacao de combate 2D em tempo real com IA adaptativa, backend WebSocket e regras de jogo desacopladas.

## Visao geral

O projeto simula um combate estilo soulslike onde o inimigo e controlado por um agente que reage aos padroes de comportamento do jogador durante a partida.

Objetivos principais:

- demonstrar arquitetura realtime alem de CRUD
- isolar regras de jogo e IA em pacotes testaveis
- registrar decisoes do agente para analise de comportamento

## Stack

- `apps/frontend`: React + Vite
- `apps/backend`: Node.js + Express + WebSocket
- `packages/agent`: IA adaptativa (`AdaptiveCombatAgent`)
- `packages/game-core`: loop e mecanicas puras do combate
- infra opcional: PostgreSQL (logs) e Redis (estado realtime)

## Arquitetura e fluxo

Fluxo de decisao em runtime:

`GameState -> Agent -> Decision -> Action -> Feedback -> Memory Update`

Fluxo de comunicacao:

1. Cliente envia eventos de jogador (ex.: `PLAYER_ACTION`) via WebSocket.
2. Backend atualiza o estado do jogo e consulta o agente.
3. Agente decide acao (`attack`, `dodge`, `heavy_attack`, etc.).
4. Backend aplica regras do `game-core` e retorna evento `AI_ACTION`.

## Estrutura do repositorio

- `apps/frontend`: interface do jogo e controles
- `apps/backend`: servidor HTTP/WS e orquestracao do loop
- `packages/agent`: estrategia adaptativa da IA
- `packages/game-core`: regras puras, estado e mecanicas
- `docs`: especificacao, arquitetura e backlog

## Como rodar localmente

```bash
corepack pnpm dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

## Docker

```bash
docker compose up --build
```

## Documentacao

Os documentos de referencia ficam em `docs/`:

- `docs/README.md`: indice da documentacao
- `docs/AI-SOULSLIKE-README.md`: visao de produto e escopo original
- `docs/AI-SOULSLIKE-ARCHITECTURE.md`: arquitetura e separacao por pacotes
- `docs/AI-SOULSLIKE-AGENT.md`: definicao do `AdaptiveCombatAgent`
- `docs/AI-SOULSLIKE-TASKS.md`: backlog inicial
