import type { CoreAction } from "@ai-soulslike/game-core";

const actions: CoreAction[] = ["attack", "dodge", "roll"];

interface ControlsProps {
  disabled?: boolean;
  onAction: (action: CoreAction) => void;
  onReset: () => void;
}

export const Controls = ({ disabled, onAction, onReset }: ControlsProps) => (
  <div className="controls">
    {actions.map((action) => (
      <button key={action} disabled={disabled} onClick={() => onAction(action)}>
        {action}
      </button>
    ))}
    <button className="ghost" onClick={onReset}>
      reset
    </button>
  </div>
);
