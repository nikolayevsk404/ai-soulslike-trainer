import http from "node:http";
import express from "express";
import { GameManager } from "./game/gameManager";
import { initDb } from "./infra/db";
import { createSocketServer } from "./websocket/socket";

const port = Number(process.env.PORT ?? 3001);
const app = express();
const server = http.createServer(app);
const gameManager = new GameManager();
const socketServer = createSocketServer(server, gameManager);

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    tick: gameManager.getState().tick
  });
});

app.get("/replay", (_request, response) => {
  response.json({
    replay: gameManager.getReplay()
  });
});

const start = async () => {
  await initDb();

  setInterval(async () => {
    const payload = await gameManager.tick();
    socketServer.broadcastState(payload);
  }, 100);

  server.listen(port, () => {
    console.log(`backend listening on http://localhost:${port}`);
  });
};

start().catch((error) => {
  console.error("failed to start backend", error);
  process.exit(1);
});
