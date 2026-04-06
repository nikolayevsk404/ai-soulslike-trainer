# AI Soulslike Trainer

## Visão Geral
Simulador 2D soulslike com AI adaptativa em tempo real.

## Stack
React + Node + WebSocket + PostgreSQL

## Objetivo
Demonstrar IA + realtime + arquitetura limpa além de CRUD.

---

# AI Soulslike Trainer

## Visão Geral

Um simulador de combate estilo Elden Ring em 2D, onde o inimigo é controlado por um AI Agent adaptativo que aprende o comportamento do jogador em tempo real.

O objetivo não é só gameplay — é demonstrar:

- IA aplicada (agents + heurística + evolução)
- Arquitetura em tempo real
- Engenharia além de CRUD

## Tech Stack

### Frontend
- React (Vite)
- Canvas API / Phaser.js (opcional)

### Backend
- Node.js
- WebSocket (ws)
- Express

### Infra
- PostgreSQL (logs + comportamento)
- Redis (opcional - estado tempo real)

## Features

### Core Gameplay
- Player vs AI (tempo real)
- Movimento + ataque + dodge
- Sistema de stamina (tipo soulslike)

### AI
- Agent adaptativo baseado em comportamento
- Detecção de padrões:
  - roll spam
  - agressividade
  - distância média

### Realtime
- Comunicação via WebSocket
- Loop de jogo no servidor

### Observabilidade
- Logs de decisões da IA
- Replay simples (JSON)

## AI Architecture

### Conceito

O sistema NÃO depende de API externa.  
O agent é local e evolui com base em heurística + dados.

Fluxo:
GameState → Agent → Decision → Action → Feedback → Memory Update

## Agent Definition

### Nome
AdaptiveCombatAgent

### Input (GameState)
```ts
type GameState = {
  playerHp: number
  playerDistance: number
  playerRolling: boolean
  lastPlayerActions: string[]
}
```

### Output
```ts
type Action = 'attack' | 'dodge' | 'wait' | 'heavy_attack'
```

### Memory
```ts
memory = {
  rollFrequency: number
  aggressivePlayer: boolean
}
```

### Decision Rules
- IF rollFrequency > 0.6 → heavy_attack
- IF playerDistance < 2 → dodge
- ELSE → attack

### Evolução futura
- Persistência no banco
- Ajuste dinâmico de thresholds
- Reinforcement Learning (opcional)

## Arquitetura

```
/frontend (React)
   ↓ WebSocket
/backend (Node)
   ↓
/agent (IA local)
   ↓
/database (PostgreSQL)
```

## API / Eventos WebSocket

### Cliente → Servidor
```json
{
  "type": "PLAYER_ACTION",
  "payload": {
    "action": "roll"
  }
}
```

### Servidor → Cliente
```json
{
  "type": "AI_ACTION",
  "payload": {
    "action": "heavy_attack"
  }
}
```

## Game Loop (Servidor)

```js
setInterval(() => {
  const state = getGameState()
  const action = agent.decide(state)

  applyAction(action)
  broadcast(action)
}, 100)
```

## Testes

### Unit (Agent)
- Deve detectar roll spam
- Deve mudar comportamento baseado na distância

```ts
it('should counter roll spam', () => {
  const state = mockRollSpam()
  expect(agent.decide(state)).toBe('heavy_attack')
})
```

### Integration
- WebSocket conecta
- Eventos fluem corretamente

## Logs

Salvar decisões da IA:

```json
{
  "playerPattern": "roll_spam",
  "aiResponse": "heavy_attack",
  "timestamp": 123456
}
```

## Backlog Inicial (para IA gerar código)

### TASK 1 — Setup Backend
Crie um servidor Node.js com Express e WebSocket usando ws.

Estruture pastas em:
- src/server
- src/agent
- src/game

### TASK 2 — Game Loop
Implemente um game loop usando setInterval rodando a cada 100ms.

### TASK 3 — Agent
Crie a classe AdaptiveCombatAgent com:
- memória interna
- método decide(state)
- regras baseadas em comportamento do player

### TASK 4 — WebSocket Events
Implemente eventos:
- PLAYER_ACTION (entrada)
- AI_ACTION (saída)

### TASK 5 — Frontend
Crie uma tela simples em React com:
- botão de ataque
- botão de dodge
- log de ações

### TASK 6 — Logs + DB
Integre PostgreSQL para salvar decisões da IA

## Diferenciais Técnicos

- IA sem depender de API paga
- Arquitetura desacoplada (agent isolado)
- Realtime com WebSocket
- Testes unitários + integração
- Base pronta pra escalar pra multiplayer