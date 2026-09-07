import React from "react";

import { AVATAR_OPTIONS } from "../../constants/onboarding";

const OnboardingStepProfile = ({ formData, updateFormData, error }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
          Let's set up your profile
        </h2>

        <p className="text-sm text-text-secondary">
          Tell us a little about yourself.
        </p>
      </div>

      {/* Username */}
      <div className="space-y-2">
        <label
          htmlFor="username"
          className="block text-xs font-medium text-text-secondary"
        >
          Username <span className="text-error">*</span>
        </label>

        <input
          id="username"
          type="text"
          value={formData.username}
          onChange={(event) =>
            updateFormData(
              "username",
              event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
            )
          }
          placeholder="e.g. akdas_dev"
          autoFocus
          autoComplete="username"
          maxLength={30}
          spellCheck={false}
          className={[
            "w-full",
            "px-3.5 py-2.5",
            "text-sm",
            "text-text-primary",
            "bg-surface",
            "border",
            "rounded-lg",
            "placeholder:text-muted",
            "transition-all duration-200",
            "focus:outline-none",
            "focus:ring-2",
            error
              ? "border-error focus:border-error focus:ring-error/20"
              : "border-border focus:border-primary focus:ring-primary/20",
          ].join(" ")}
        />

        <div className="flex items-center justify-between">
          <span className={`text-xs ${error ? "text-error" : "text-muted"}`}>
            {error || "5–30 characters. Letters, numbers and underscores only."}
          </span>

          <span className="text-[11px] text-muted">
            {formData.username.length}/30
          </span>
        </div>
      </div>

      {/* Avatar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-text-secondary">
            Choose an avatar
          </label>

          <span className="text-[11px] text-muted">Optional</span>
        </div>

        <div
          className="
            grid
            grid-cols-3
            sm:grid-cols-6
            gap-3
          "
          role="radiogroup"
          aria-label="Choose an avatar"
        >
          {AVATAR_OPTIONS.map((item) => {
            const isSelected = formData.avatar === item.id;

            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={item.label}
                onClick={() =>
                  updateFormData("avatar", isSelected ? null : item.id)
                }
                className={[
                  "relative",
                  "aspect-square",
                  "rounded-xl",
                  "overflow-hidden",
                  "border",
                  "bg-surface",
                  "transition-all duration-200",
                  "focus:outline-none",
                  "focus-visible:ring-2",
                  "focus-visible:ring-primary/40",
                  isSelected
                    ? "border-primary ring-2 ring-primary/20 scale-[1.03]"
                    : "border-border hover:border-border-hover hover:bg-surface-hover",
                ].join(" ")}
              >
                <img
                  src={item.src}
                  alt=""
                  className="
                    w-full
                    h-full
                    object-cover
                  "
                  draggable="false"
                />

                {/* Selected Indicator */}
                {isSelected && (
                  <span
                    className="
                      absolute
                      top-1.5
                      right-1.5
                      w-5
                      h-5
                      rounded-full
                      bg-primary
                      text-primary-foreground
                      flex
                      items-center
                      justify-center
                      text-[11px]
                      font-bold
                      shadow-sm
                    "
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OnboardingStepProfile;
