# AI Soulslike Trainer - Agent Spec

## Nome

`AdaptiveCombatAgent`

## Papel no sistema

Analisar o `GameState` atual e historico recente do jogador para decidir a proxima acao do inimigo em tempo real.

## Entrada (`GameState`)

- distancia do jogador
- estado de HP/stamina
- historico de acoes recentes
- sinais de padrao (ex.: roll repetido)

## Saida (`Action`)

Acoes previstas para o inimigo:

- `attack`
- `dodge`
- `wait`
- `heavy_attack`

## Memoria interna

Exemplos de sinais acumulados:

- frequencia de roll
- perfil de agressividade
- tendencia de distancia media

## Regras base (MVP)

- se `rollFrequency` for alta, priorizar `heavy_attack`
- se distancia estiver curta, priorizar `dodge`
- caso contrario, usar `attack` como comportamento padrao

## Evolucoes sugeridas

- ajuste dinamico de thresholds por sessao
- persistencia de metricas de comportamento
- estrategias adicionais por estilo de jogador
