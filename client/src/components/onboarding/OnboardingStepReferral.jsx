import React from "react";

import { REFERRAL_OPTIONS } from "../../constants/onboarding";

const OnboardingStepReferral = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
          How did you hear about GenioCore?
        </h2>

        <p className="text-sm text-text-secondary">
          Optional — helps us understand where developers find us.
        </p>
      </div>

      {/* Referral Options */}
      <div
        className="
          grid
          grid-cols-2
          sm:grid-cols-3
          gap-2.5
        "
        role="radiogroup"
        aria-label="Referral source"
      >
        {REFERRAL_OPTIONS.map((option) => {
          const isSelected = formData.referralSource === option.value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() =>
                updateFormData(
                  "referralSource",
                  isSelected ? null : option.value,
                )
              }
              className={[
                "min-h-11",
                "px-3",
                "py-2.5",
                "text-xs",
                "font-medium",
                "rounded-xl",
                "border",
                "transition-all duration-200",
                "focus:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-primary/30",
                isSelected
                  ? "bg-primary/10 border-primary/50 text-primary"
                  : "bg-surface border-border text-text-secondary hover:bg-surface-hover hover:border-border-hover hover:text-text-primary",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Optional Hint */}
      <div className="text-center">
        <span className="text-[11px] text-muted">You can skip this step.</span>
      </div>
    </div>
  );
};

export default OnboardingStepReferral;
