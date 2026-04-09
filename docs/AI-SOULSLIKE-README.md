# AI Soulslike Trainer - Product Overview

## Visao geral

Simulador de combate 2D em tempo real onde um inimigo controlado por IA adapta sua estrategia ao comportamento recente do jogador.

## Objetivos

- demonstrar IA local sem dependencia de API externa
- aplicar arquitetura realtime com WebSocket
- manter separacao clara entre regras, agent e orquestracao
- criar base para evolucao em analytics e multiplayer

## Escopo funcional

- loop de combate em tempo real (player vs AI)
- acoes basicas: ataque, dodge, roll e variacoes
- memoria comportamental do agente
- logs de decisao para analise/replay

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express + WebSocket
- Pacotes: `agent` e `game-core` em TypeScript
- Infra opcional: PostgreSQL (logs) e Redis (estado realtime)

## Fluxo de alto nivel

`GameState -> Agent -> Decision -> Action -> Feedback -> Memory Update`

Eventos principais:

- cliente -> servidor: `PLAYER_ACTION`
- servidor -> cliente: `AI_ACTION`

## Diferenciais tecnicos

- IA adaptativa baseada em heuristica e memoria local
- arquitetura desacoplada e testavel por pacotes
- pipeline realtime pronto para iteracao de gameplay

## Documentos relacionados

- `AI-SOULSLIKE-ARCHITECTURE.md`
- `AI-SOULSLIKE-AGENT.md`
- `AI-SOULSLIKE-TASKS.md`