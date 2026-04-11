import { useEffect, useRef, useState } from "react";
import type { CoreAction, GameState } from "@ai-soulslike/game-core";
import { createInitialGameState } from "@game-core";
import { createGameSocket, type MatchStatus, type PlayerActionPayload, type ReplayEntry, type ServerEvent } from "../services/socket";

type LogLine = {
  id: string;
  text: string;
};

const appendLog = (current: LogLine[], text: string): LogLine[] =>
  [...current, { id: crypto.randomUUID(), text }].slice(-30);

export const useSocket = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const [state, setState] = useState<GameState>(createInitialGameState());
  const [replay, setReplay] = useState<ReplayEntry[]>([]);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<MatchStatus>("waiting");

  useEffect(() => {
    const socket = createGameSocket();
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      setConnected(true);
      setLogs((current) => appendLog(current, "Conectado ao servidor."));
    });

    socket.addEventListener("close", () => {
      setConnected(false);
      setLogs((current) => appendLog(current, "Conexao encerrada."));
    });

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data) as ServerEvent;

      if (message.type === "STATE_UPDATE") {
        setState(message.payload.state);
        setReplay(message.payload.replay);
        setStatus(message.payload.status);
      }

      if (message.type === "AI_ACTION") {
        setLogs((current) => appendLog(current, `IA respondeu com ${message.payload.action}.`));
      }

      if (message.type === "GAME_RESET") {
        setState(message.payload.state);
        setReplay([]);
        setStatus(message.payload.status);
        setLogs((current) => appendLog(current, "Partida reiniciada."));
      }
    });

    return () => {
      socket.close();
    };
  }, []);

  const sendAction = (action: CoreAction | PlayerActionPayload) => {
    if (status !== "running") {
      return;
    }

    const payload = typeof action === "string" ? { action } : action;

    socketRef.current?.send(
      JSON.stringify({
        type: "PLAYER_ACTION",
        payload
      })
    );

    setLogs((current) => appendLog(current, `Player usou ${payload.action}.`));
  };

  const resetGame = () => {
    socketRef.current?.send(JSON.stringify({ type: "RESET_GAME" }));
  };

  const startGame = () => {
    setLogs((current) => appendLog(current, "Combate iniciado."));
    socketRef.current?.send(JSON.stringify({ type: "START_GAME" }));
  };

  return {
    connected,
    status,
    state,
    replay,
    logs,
    sendAction,
    resetGame,
    startGame
  };
};

export type { LogLine };
