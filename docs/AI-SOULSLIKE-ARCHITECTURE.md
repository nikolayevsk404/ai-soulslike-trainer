# AI Soulslike Trainer - Architecture

## Arquitetura geral

Modulos principais:

- `apps/frontend`: interface, controles e renderizacao de estado
- `apps/backend`: servidor HTTP/WS, loop e orquestracao
- `packages/agent`: logica de decisao do `AdaptiveCombatAgent`
- `packages/game-core`: estado e regras puras do combate

Fluxo macro:

`Player Action -> Backend -> GameState -> Agent Decision -> Apply Action -> Broadcast`

## Estrutura recomendada

```txt
ai-soulslike-trainer/
├── apps/
│   ├── frontend/
│   └── backend/
├── packages/
│   ├── agent/
│   └── game-core/
├── infra/
└── docs/
```

## Separacao de responsabilidades

- `agent` nao conhece WebSocket nem camada de transporte
- `game-core` nao conhece frontend/backend
- `backend` integra estado, regras e comunicacao em tempo real
- `frontend` envia intencoes do jogador e renderiza respostas

## Contratos e runtime

Eventos base:

- entrada: `PLAYER_ACTION`
- saida: `AI_ACTION`

Recomendacoes:

- tick de jogo constante (ex.: 100 ms)
- mensagens com schema tipado e versionado
- registro de contexto de decisao do agente por tick

## Observabilidade e qualidade

- logs de padrao de jogador e resposta escolhida
- testes unitarios em `agent` e `game-core`
- testes de integracao no backend para fluxo WS

## Deploy local com containers (opcional)

Servicos sugeridos:

- `frontend`
- `backend`
- `postgres`
