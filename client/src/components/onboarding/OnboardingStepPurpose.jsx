import React from "react";

import { PURPOSE_OPTIONS } from "../../constants/onboarding";

const OnboardingStepPurpose = ({ formData, updateFormData, error }) => {
  const togglePurpose = (value) => {
    const current = formData.purposes || [];

    const isSelected = current.includes(value);

    if (isSelected) {
      updateFormData(
        "purposes",
        current.filter((item) => item !== value),
      );

      return;
    }

    if (current.length >= 3) {
      return;
    }

    updateFormData("purposes", [...current, value]);
  };

  const selectedCount = formData.purposes?.length || 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
          What brings you to NeuAspire?
        </h2>

        <p className="text-sm text-text-secondary">
          Select up to 3 things you want to achieve.
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-error text-center" role="alert">
          {error}
        </p>
      )}

      {/* Options */}
      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          gap-2.5
          max-h-[280px]
          overflow-y-auto
          pr-1
        "
      >
        {PURPOSE_OPTIONS.map((option) => {
          const isSelected = formData.purposes?.includes(option.value);

          const isDisabled = !isSelected && selectedCount >= 3;

          return (
            <button
              key={option.value}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              aria-disabled={isDisabled}
              disabled={isDisabled}
              onClick={() => togglePurpose(option.value)}
              className={[
                "group",
                "p-3.5",
                "text-left",
                "rounded-xl",
                "border",
                "transition-all duration-200",
                "focus:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-primary/30",
                isSelected
                  ? "bg-primary/10 border-primary/50"
                  : "bg-surface border-border hover:bg-surface-hover hover:border-border-hover",
                isDisabled && "opacity-50 cursor-not-allowed",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={[
                    "text-sm font-medium",
                    isSelected
                      ? "text-text-primary"
                      : "text-text-secondary group-hover:text-text-primary",
                  ].join(" ")}
                >
                  {option.label}
                </span>

                <span
                  className={[
                    "shrink-0",
                    "w-4 h-4",
                    "rounded",
                    "border",
                    "flex items-center justify-center",
                    "text-[10px]",
                    "font-bold",
                    "transition-all duration-200",
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-border text-transparent",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  ✓
                </span>
              </div>

              <p className="text-[11px] leading-relaxed text-muted mt-1.5">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selection Counter */}
      <div className="flex items-center justify-center">
        <span
          className={[
            "text-[11px]",
            selectedCount >= 3 ? "text-primary" : "text-muted",
          ].join(" ")}
        >
          {selectedCount}/3 selected
        </span>
      </div>
    </div>
  );
};

export default OnboardingStepPurpose;
