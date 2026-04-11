import { useEffect, useRef } from "react";
import type { GameState } from "@ai-soulslike/game-core";
import type { MatchStatus, PlayerActionPayload } from "../services/socket";
import { bootPhaserArena, type PhaserArenaController } from "./bootPhaserArena";

interface PhaserArenaProps {
  state: GameState;
  connected: boolean;
  status: MatchStatus;
  onAction: (action: GameState["player"]["lastAction"] | PlayerActionPayload) => void;
  onReady?: () => void;
  onError?: (message: string) => void;
  onStageChange?: (stage: string) => void;
}

export const PhaserArena = ({ state, connected, status, onAction, onReady, onError, onStageChange }: PhaserArenaProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<PhaserArenaController | null>(null);
  const latestRef = useRef({ state, connected, status, onAction, onReady, onError, onStageChange });

  useEffect(() => {
    latestRef.current = { state, connected, status, onAction, onReady, onError, onStageChange };
  }, [connected, onAction, onError, onReady, onStageChange, state, status]);

  useEffect(() => {
    if (!containerRef.current || controllerRef.current) {
      return;
    }

    let cancelled = false;

    const reportError = (message: string) => {
      if (!cancelled) {
        latestRef.current.onError?.(message);
        console.error("[PhaserArena]", message);
      }
    };

    const handleWindowError = (event: ErrorEvent) => {
      const message = event.error instanceof Error ? event.error.message : event.message || "Erro desconhecido no boot do Phaser.";
      reportError(`window.onerror: ${message}`);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason =
        event.reason instanceof Error
          ? event.reason.message
          : typeof event.reason === "string"
            ? event.reason
            : JSON.stringify(event.reason);
      reportError(`unhandledrejection: ${reason}`);
    };

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    void bootPhaserArena(containerRef.current, {
      connected: latestRef.current.connected,
      status: latestRef.current.status,
      state: latestRef.current.state,
      onAction: latestRef.current.onAction,
      onReady: latestRef.current.onReady,
      onError: reportError,
      onStageChange: latestRef.current.onStageChange
    })
      .then((controller) => {
        if (cancelled) {
          controller.destroy();
          return;
        }

        controllerRef.current = controller;
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Falha ao iniciar o Phaser.";
        reportError(`boot: ${message}`);
      });

    return () => {
      cancelled = true;
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    controllerRef.current?.sync({
      connected,
      status,
      state,
      onAction
    });
  }, [connected, onAction, state, status]);

  return <div className="phaser-shell" ref={containerRef} />;
};
