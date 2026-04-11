import { WebSocket, WebSocketServer } from "ws";
import type { Server } from "http";
import { GameManager } from "../game/gameManager";
import type { ClientMessage, ServerMessage } from "../types";

const send = (socket: WebSocket, message: ServerMessage) => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
};

const broadcast = (wss: WebSocketServer, message: ServerMessage) => {
  for (const client of wss.clients) {
    send(client, message);
  }
};

export const createSocketServer = (server: Server, gameManager: GameManager) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (socket) => {
    send(socket, {
      type: "STATE_UPDATE",
      payload: {
        state: gameManager.getState(),
        replay: gameManager.getReplay(),
        status: gameManager.getStatus()
      }
    });

    socket.on("message", (rawMessage) => {
      const message = JSON.parse(rawMessage.toString()) as ClientMessage;

      if (message.type === "START_GAME") {
        gameManager.start();
        broadcast(wss, {
          type: "STATE_UPDATE",
          payload: {
            state: gameManager.getState(),
            replay: gameManager.getReplay(),
            status: gameManager.getStatus()
          }
        });
        return;
      }

      if (message.type === "PLAYER_ACTION" && message.payload?.action) {
        gameManager.queuePlayerAction(message.payload.action, message.payload.facing);
        return;
      }

      if (message.type === "RESET_GAME") {
        gameManager.reset();
        broadcast(wss, {
          type: "GAME_RESET",
          payload: {
            state: gameManager.getState(),
            status: gameManager.getStatus()
          }
        });
      }
    });
  });

  return {
    wss,
    broadcastState: (payload: { state: unknown; aiAction: unknown }) => {
      if (payload.aiAction) {
        broadcast(wss, {
          type: "AI_ACTION",
          payload: {
            action: payload.aiAction
          }
        });
      }

      broadcast(wss, {
        type: "STATE_UPDATE",
        payload: {
          state: payload.state,
          replay: gameManager.getReplay(),
          status: gameManager.getStatus()
        }
      });
    }
  };
};
