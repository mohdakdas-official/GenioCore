import { useState } from "react";

import { useNavigate } from "react-router-dom";

import useOnboarding from "../../hooks/useOnboarding";

import { completeOnboarding } from "../../services/onboarding.service";

import { AVATAR_OPTIONS, TOTAL_STEPS } from "../../constants/onboarding";

import OnboardingProgress from "../../components/onboarding/OnboardingProgress";
import OnboardingStepProfile from "../../components/onboarding/OnboardingStepProfile";
import OnboardingStepPurpose from "../../components/onboarding/OnboardingStepPurpose";
import OnboardingStepExperience from "../../components/onboarding/OnboardingStepExperience";
import OnboardingStepReferral from "../../components/onboarding/OnboardingStepReferral";

const OnboardingPage = () => {
  const navigate = useNavigate();

  const { updateUser } = useOnboarding?.() || {};

  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);

  const [inlineError, setInlineError] = useState("");

  const [apiError, setApiError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    avatar: null,
    purposes: [],
    experienceLevel: null,
    referralSource: null,
  });

  /**
   * Update form state.
   */
  const updateFormData = (field, value) => {
    setInlineError("");
    setApiError("");

    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /**
   * Validate the currently visible step.
   */
  const validateCurrentStep = () => {
    // ----------------------------------
    // Step 1 — Profile
    // ----------------------------------
    if (step === 1) {
      const username = formData.username.trim();

      if (!username) {
        setInlineError("Please enter a username.");

        return false;
      }

      if (username.length < 5 || username.length > 30) {
        setInlineError("Username must be between 5 and 30 characters.");

        return false;
      }

      if (!/^[a-z0-9_]+$/.test(username)) {
        setInlineError(
          "Username can only contain lowercase letters, numbers, and underscores.",
        );

        return false;
      }
    }

    // ----------------------------------
    // Step 2 — Purpose
    // ----------------------------------
    if (step === 2) {
      const purposes = formData.purposes || [];

      if (purposes.length === 0) {
        setInlineError("Please select at least one purpose to continue.");

        return false;
      }

      if (purposes.length > 3) {
        setInlineError("You can select up to 3 purposes.");

        return false;
      }
    }

    // ----------------------------------
    // Step 3 — Experience
    // ----------------------------------
    if (step === 3) {
      if (!formData.experienceLevel) {
        setInlineError("Please select your current experience level.");

        return false;
      }
    }

    // ----------------------------------
    // Step 4 — Referral
    // ----------------------------------
    // Referral is optional.
    // No validation required.
    // ----------------------------------

    return true;
  };

  /**
   * Move to next step.
   */
  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    setInlineError("");

    setStep((previous) => Math.min(previous + 1, TOTAL_STEPS));
  };

  /**
   * Move to previous step.
   */
  const handleBack = () => {
    if (loading) {
      return;
    }

    setInlineError("");
    setApiError("");

    setStep((previous) => Math.max(previous - 1, 1));
  };

  /**
   * Convert selected local avatar
   * into an absolute URL.
   *
   * Example:
   *
   * /avatars/avatar-1.png
   *
   * becomes:
   *
   * http://localhost:5173/avatars/avatar-1.png
   *
   * or in production:
   *
   * https://neuaspire.vercel.app/avatars/avatar-1.png
   */
  const getAvatarUrl = () => {
    if (!formData.avatar) {
      return null;
    }

    const selectedAvatar = AVATAR_OPTIONS.find(
      (avatar) => avatar.id === formData.avatar,
    );

    if (!selectedAvatar?.src) {
      return null;
    }

    return new URL(selectedAvatar.src, window.location.origin).href;
  };

  /**
   * Prepare backend payload.
   */
  const formatPayload = () => {
    const payload = {
      purposes: formData.purposes || [],

      experienceLevel: formData.experienceLevel,

      referralSource: formData.referralSource || null,
    };

    const username = formData.username.trim();

    if (username) {
      payload.username = username;
    }

    const avatarUrl = getAvatarUrl();

    if (avatarUrl) {
      payload.avatar = avatarUrl;
    }

    return payload;
  };

  /**
   * Submit onboarding.
   */
  const submitOnboarding = async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    setApiError("");
    setInlineError("");

    try {
      const payload = formatPayload();

      console.log("Onboarding Payload:", payload);

      const response = await completeOnboarding(payload);

      if (response?.user && updateUser) {
        updateUser(response.user);
      }

      navigate("/v1/dashboard", {
        replace: true,
      });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save your preferences. Please try again.";

      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Finish onboarding.
   */
  const handleFinish = () => {
    if (!validateCurrentStep()) {
      return;
    }

    submitOnboarding();
  };

  /**
   * Step 4 referral is optional.
   * Therefore Skip can directly submit.
   */
  const handleSkip = () => {
    if (step !== TOTAL_STEPS) {
      return;
    }

    submitOnboarding();
  };

  return (
    <main
      className="
        min-h-screen
        w-full
        bg-background
        text-foreground
        flex
        flex-col
        px-4
        py-5
        sm:px-6
        sm:py-6
        selection:bg-primary/20
      "
    >
      {/* ========================================
          Header
      ========================================= */}
      <header
        className="
          w-full
          max-w-xl
          mx-auto
          flex
          items-center
          justify-between
          shrink-0
        "
      >
        <span
          className="
            text-sm
            font-semibold
            tracking-[0.16em]
            uppercase
            text-text-primary
          "
        >
          Neu
          <span className="text-primary">Aspire</span>
        </span>

        <span
          className="
            text-[11px]
            font-medium
            tracking-wider
            uppercase
            text-muted
          "
        >
          Setup
        </span>
      </header>

      {/* ========================================
          Main Content
      ========================================= */}
      <div
        className="
          w-full
          max-w-xl
          mx-auto
          flex-1
          flex
          flex-col
          justify-center
          py-8
        "
      >
        {/* Progress */}
        <OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} />

        {/* ======================================
            API Error
        ====================================== */}
        {apiError && (
          <div
            className="
              mb-4
              px-3.5
              py-2.5
              rounded-lg
              border
              border-error/30
              bg-error/10
              text-error
              text-xs
              text-center
            "
            role="alert"
          >
            {apiError}
          </div>
        )}

        {/* ======================================
            Main Card
        ====================================== */}
        <div
          className="
            relative
            bg-card
            border
            border-border
            rounded-2xl
            p-5
            sm:p-7
            shadow-xl
            transition-all
            duration-300
          "
        >
          {/* Step 1 */}
          {step === 1 && (
            <OnboardingStepProfile
              formData={formData}
              updateFormData={updateFormData}
              error={inlineError}
            />
          )}

          {/* Step 2 */}
          {step === 2 && (
            <OnboardingStepPurpose
              formData={formData}
              updateFormData={updateFormData}
              error={inlineError}
            />
          )}

          {/* Step 3 */}
          {step === 3 && (
            <OnboardingStepExperience
              formData={formData}
              updateFormData={updateFormData}
              error={inlineError}
            />
          )}

          {/* Step 4 */}
          {step === 4 && (
            <OnboardingStepReferral
              formData={formData}
              updateFormData={updateFormData}
            />
          )}
        </div>
      </div>

      {/* ========================================
          Footer Navigation
      ========================================= */}
      <footer
        className="
          w-full
          max-w-xl
          mx-auto
          flex
          items-center
          justify-between
          shrink-0
          pt-2
        "
      >
        {/* --------------------------------------
            Left Action
        -------------------------------------- */}
        <div>
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="
                px-3
                py-2
                text-xs
                font-medium
                text-text-secondary
                hover:text-text-primary
                transition-colors
                disabled:opacity-50
                disabled:cursor-not-allowed
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-primary/30
                rounded-lg
              "
            >
              Back
            </button>
          )}
        </div>

        {/* --------------------------------------
            Right Actions
        -------------------------------------- */}
        <div className="flex items-center gap-2">
          {/* Step 4 Skip */}
          {step === TOTAL_STEPS && (
            <button
              type="button"
              onClick={handleSkip}
              disabled={loading}
              className="
                px-3
                py-2
                text-xs
                font-medium
                text-muted
                hover:text-text-secondary
                transition-colors
                disabled:opacity-50
                disabled:cursor-not-allowed
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-primary/30
                rounded-lg
              "
            >
              Skip
            </button>
          )}

          {/* Continue */}
          {step < TOTAL_STEPS && (
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="
                min-w-24
                px-4
                py-2.5
                text-xs
                font-semibold
                rounded-lg
                bg-primary
                text-primary-foreground
                hover:bg-primary-hover
                active:bg-primary-active
                shadow-brand
                transition-all
                duration-200
                disabled:opacity-50
                disabled:cursor-not-allowed
                flex
                items-center
                justify-center
                gap-2
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-primary/30
              "
            >
              Continue
              <span aria-hidden="true" className="text-sm">
                →
              </span>
            </button>
          )}

          {/* Finish */}
          {step === TOTAL_STEPS && (
            <button
              type="button"
              onClick={handleFinish}
              disabled={loading}
              className="
                min-w-28
                px-4
                py-2.5
                text-xs
                font-semibold
                rounded-lg
                bg-primary
                text-primary-foreground
                hover:bg-primary-hover
                active:bg-primary-active
                shadow-brand
                transition-all
                duration-200
                disabled:opacity-50
                disabled:cursor-not-allowed
                flex
                items-center
                justify-center
                gap-2
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-primary/30
              "
            >
              {loading ? (
                <>
                  <span
                    className="
                      w-3.5
                      h-3.5
                      border-2
                      border-primary-foreground/30
                      border-t-primary-foreground
                      rounded-full
                      animate-spin
                    "
                    aria-hidden="true"
                  />
                  Saving...
                </>
              ) : (
                <>
                  Finish Setup
                  <span aria-hidden="true" className="text-sm">
                    →
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </footer>
    </main>
  );
};

export default OnboardingPage;
