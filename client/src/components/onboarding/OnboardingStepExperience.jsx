import React from "react";

import { EXPERIENCE_OPTIONS } from "../../constants/onboarding";

const OnboardingStepExperience = ({ formData, updateFormData, error }) => {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
          What's your experience level?
        </h2>

        <p className="text-sm text-text-secondary">
          This helps us calibrate explanations and recommendations.
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-error text-center" role="alert">
          {error}
        </p>
      )}

      {/* Experience Options */}
      <div
        className="space-y-2"
        role="radiogroup"
        aria-label="Experience level"
      >
        {EXPERIENCE_OPTIONS.map((option) => {
          const isSelected = formData.experienceLevel === option.value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => updateFormData("experienceLevel", option.value)}
              className={[
                "w-full",
                "p-3.5",
                "text-left",
                "rounded-xl",
                "border",
                "flex",
                "items-center",
                "justify-between",
                "gap-4",
                "transition-all duration-200",
                "focus:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-primary/30",
                isSelected
                  ? "bg-primary/10 border-primary/50"
                  : "bg-surface border-border hover:bg-surface-hover hover:border-border-hover",
              ].join(" ")}
            >
              <div className="min-w-0">
                <p
                  className={[
                    "text-sm font-medium",
                    isSelected ? "text-text-primary" : "text-text-secondary",
                  ].join(" ")}
                >
                  {option.label}
                </p>

                <p className="text-[11px] text-muted mt-1 leading-relaxed">
                  {option.description}
                </p>
              </div>

              {/* Radio */}
              <span
                className={[
                  "shrink-0",
                  "w-5 h-5",
                  "rounded-full",
                  "border",
                  "flex",
                  "items-center",
                  "justify-center",
                  "transition-all duration-200",
                  isSelected ? "border-primary" : "border-border",
                ].join(" ")}
                aria-hidden="true"
              >
                {isSelected && (
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingStepExperience;
