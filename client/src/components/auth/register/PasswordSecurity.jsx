import React from "react";
import { CheckCircle2, Circle } from "lucide-react";

export function PasswordRequirementItem({ satisfied, label }) {
  return (
    <div className="flex items-center gap-2 text-xs transition-colors duration-150">
      {satisfied ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
      ) : (
        <Circle className="w-3.5 h-3.5 text-muted shrink-0" />
      )}
      <span
        className={satisfied ? "text-text-primary font-medium" : "text-muted"}
      >
        {label}
      </span>
    </div>
  );
}

export function PasswordStrengthBar({ passedCount }) {
  const getStrengthConfig = () => {
    if (passedCount === 0)
      return { label: "Empty", color: "bg-transparent", text: "text-muted" };
    if (passedCount <= 2)
      return { label: "Weak", color: "bg-error", text: "text-error" };
    if (passedCount <= 4)
      return { label: "Fair", color: "bg-warning", text: "text-warning" };
    return { label: "Strong", color: "bg-success", text: "text-success" };
  };

  const strength = getStrengthConfig();

  return (
    <div className="space-y-1 pt-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-text-secondary">Security strength</span>
        <span className={`font-semibold ${strength.text}`}>
          {strength.label}
        </span>
      </div>
      <div className="grid grid-cols-5 gap-1.5 h-1 w-full bg-surface rounded-full overflow-hidden">
        {[1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className={`h-full transition-all duration-300 ${
              index <= passedCount ? strength.color : "bg-border-subtle"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
