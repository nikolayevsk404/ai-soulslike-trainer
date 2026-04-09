# AI Soulslike Trainer - Tasks

## Fase 1 - Fundacao

- [ ] estruturar monorepo (`apps` + `packages`) com TypeScript
- [ ] configurar scripts compartilhados de dev/build/test
- [ ] definir contratos tipados de eventos e estado

## Fase 2 - Nucleo de jogo e IA

- [ ] implementar `packages/game-core` (estado, mecanicas, stamina)
- [ ] implementar `packages/agent` com `AdaptiveCombatAgent`
- [ ] cobrir regras base do agente com testes unitarios

## Fase 3 - Backend realtime

- [ ] criar servidor Node + Express + WebSocket
- [ ] integrar game loop (tick fixo, ex.: 100 ms)
- [ ] processar `PLAYER_ACTION` e emitir `AI_ACTION`

## Fase 4 - Frontend

- [ ] construir tela de combate com controles basicos
- [ ] conectar ao backend via WebSocket
- [ ] exibir log de acoes em tempo real

## Fase 5 - Observabilidade e persistencia

- [ ] registrar decisoes da IA por tick
- [ ] persistir logs em PostgreSQL
- [ ] preparar replay simples a partir de eventos
