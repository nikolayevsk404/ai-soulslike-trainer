import type { GameState } from "@ai-soulslike/game-core";

interface GameCanvasProps {
  state: GameState;
}

export const GameCanvas = ({ state }: GameCanvasProps) => {
  const playerLeft = 18 + state.player.position * 12;
  const aiLeft = 58 + state.ai.position * 6;

  return (
    <div className="arena">
      <div className="lane" />
      <div className="fighter player" style={{ left: `${playerLeft}%` }}>
        <span>YOU</span>
      </div>
      <div className="fighter ai" style={{ left: `${aiLeft}%` }}>
        <span>AI</span>
      </div>
    </div>
  );
};
