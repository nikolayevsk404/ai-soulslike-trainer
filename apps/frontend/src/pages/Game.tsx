import { useEffect, useState } from "react";
import { PhaserArena } from "../game/PhaserArena";
import { assetReplacementGuide } from "../game/assets";
import { useSocket } from "../hooks/useSocket";

export const GamePage = () => {
  const [arenaVersion, setArenaVersion] = useState(0);
  const [arenaReady, setArenaReady] = useState(false);
  const [arenaProgress, setArenaProgress] = useState(8);
  const [arenaError, setArenaError] = useState<string | null>(null);
  const [arenaStage, setArenaStage] = useState("aguardando boot");
  const { connected, status, state, replay, logs, sendAction, resetGame, startGame } = useSocket();
  const isRunning = connected && status === "running" && !Boolean(state.winner);
  const canStart = connected && arenaReady && !arenaError && status !== "running";

  useEffect(() => {
    setArenaReady(false);
    setArenaProgress(8);
    setArenaError(null);
    setArenaStage("reiniciando arena");
  }, [arenaVersion]);

  useEffect(() => {
    if (arenaReady || arenaError) {
      return;
    }

    const progressInterval = window.setInterval(() => {
      setArenaProgress((current) => (current >= 92 ? current : current + 6));
    }, 180);

    const timeout = window.setTimeout(() => {
      setArenaError(`Timeout no boot do Phaser. Ultimo estagio: ${arenaStage}.`);
    }, 7000);

    return () => {
      window.clearInterval(progressInterval);
      window.clearTimeout(timeout);
    };
  }, [arenaError, arenaReady, arenaStage, arenaVersion]);

  const handleArenaReady = () => {
    setArenaReady(true);
    setArenaError(null);
    setArenaProgress(100);
  };

  const handleArenaError = (message: string) => {
    setArenaError(message);
  };

  const handleArenaStage = (stage: string) => {
    setArenaStage(stage);
  };

  const retryArena = () => {
    setArenaVersion((current) => current + 1);
  };

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Limgrave Protocol</p>
          <h1>Enfrente um boss que observa, aprende e contra-ataca.</h1>
          <p className="description">
            Phaser controla a arena, o backend dita o combate e a apresentacao ja esta preparada para receber sprites
            e background reais em PNG.
          </p>
          {!arenaReady && !arenaError && <p className="loading-copy">Carregando arena Phaser...</p>}
          {arenaError && <p className="error-copy">{arenaError}</p>}
          {!arenaReady && <p className="loading-stage">Estagio: {arenaStage}</p>}
        </div>
        <div className={`status ${connected ? "online" : "offline"}`}>
          {connected ? `WS online • ${status} • phaser` : "WS offline"}
        </div>
      </section>

      <section className="board">
        <div className="panel">
          <div className="top-actions">
            <button disabled={!canStart} onClick={startGame}>
              start
            </button>
            <button className="ghost" onClick={retryArena}>
              recarregar arena
            </button>
            <button className="ghost" onClick={resetGame}>
              reset fight
            </button>
          </div>

          <div className="hud">
            <article>
              <span>Player HP</span>
              <strong>{state.player.hp}</strong>
            </article>
            <article>
              <span>Player Stamina</span>
              <strong>{state.player.stamina}</strong>
            </article>
            <article>
              <span>AI HP</span>
              <strong>{state.ai.hp}</strong>
            </article>
            <article>
              <span>Distance</span>
              <strong>{state.distance.toFixed(1)}</strong>
            </article>
            <article>
              <span>Boss Action</span>
              <strong>{state.ai.lastAction}</strong>
            </article>
          </div>

          <div className="arena-wrap">
            <>
              <PhaserArena
                key={arenaVersion}
                connected={isRunning}
                onAction={sendAction}
                onError={handleArenaError}
                onReady={handleArenaReady}
                onStageChange={handleArenaStage}
                state={state}
                status={status}
              />
              {!arenaReady && (
                <div className="arena-loading">
                  <div className="arena-loading-card">
                    <p>{arenaError ? "Falha ao iniciar a arena" : "Inicializando cenario, boss e player..."}</p>
                    <div className="progress-track" aria-hidden="true">
                      <div className="progress-fill" style={{ width: `${arenaProgress}%` }} />
                    </div>
                    <small>Estagio atual: {arenaStage}</small>
                    <span>{arenaError ? "Erro detectado" : `${arenaProgress}%`}</span>
                    {arenaError && (
                      <button className="ghost" onClick={retryArena}>
                        tentar novamente
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          </div>

          <div className="controls legend">
            <button disabled={!isRunning} onClick={() => sendAction("attack")}>
              J attack
            </button>
            <button disabled={!isRunning} onClick={() => sendAction("roll")}>
              K roll
            </button>
            <button disabled={!isRunning} onClick={() => sendAction("dodge")}>
              L dodge
            </button>
            <button disabled={!isRunning} onClick={() => sendAction("jump")}>
              Space jump
            </button>
          </div>

          <div className="winner">
            {!arenaReady && !arenaError && "Aguarde a arena terminar de carregar."}
            {!arenaReady && arenaError && "A arena falhou ao iniciar corretamente."}
            {arenaReady && status === "waiting" && "Pressione Start para comecar a luta."}
            {status === "running" && `Tick ${state.tick}`}
            {status === "finished" && `${state.winner === "player" ? "Voce" : "IA"} venceu.`}
          </div>
        </div>

        <div className="sidebar">
          <article className="panel">
            <h2>Log em tempo real</h2>
            <div className="log-list">
              {logs.map((line) => (
                <p key={line.id}>{line.text}</p>
              ))}
            </div>
          </article>

          <article className="panel">
            <h2>Assets substituiveis</h2>
            <div className="log-list">
              {assetReplacementGuide.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </article>

          <article className="panel">
            <h2>Replay / Analise</h2>
            <p>{replay.length} snapshots capturados.</p>
            <div className="log-list">
              {replay.slice(-8).reverse().map((entry) => (
                <p key={`${entry.tick}-${entry.aiAction}`}>
                  Tick {entry.tick}: player {entry.playerAction ?? "none"} | IA {entry.aiAction}
                </p>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
};
