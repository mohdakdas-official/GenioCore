import React from "react";

const STEP_LABELS = ["Profile", "Purpose", "Experience", "Referral"];

const OnboardingProgress = ({ currentStep, totalSteps }) => {
  const currentLabel = STEP_LABELS[currentStep - 1] || "";

  return (
    <div className="w-full mb-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted">
          Step {currentStep} of {totalSteps}
        </span>

        <span className="text-xs font-medium text-text-secondary">
          {currentLabel}
        </span>
      </div>

      {/* Progress Bars */}
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))`,
        }}
        aria-label={`Onboarding progress: step ${currentStep} of ${totalSteps}`}
      >
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;

          const isCompleted = stepNumber < currentStep;

          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={stepNumber}
              className={[
                "h-1.5 rounded-full",
                "transition-all duration-300",
                isCompleted && "bg-primary",
                isCurrent && "bg-primary shadow-brand",
                !isCompleted && !isCurrent && "bg-border-subtle",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-hidden="true"
            />
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingProgress;
