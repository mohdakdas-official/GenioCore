import { useState } from "react";

import { useNavigate } from "react-router-dom";

import useOnboarding from "../../hooks/useOnboarding";

import { completeOnboarding } from "../../services/onboarding.service";

import { uploadUserAvatar } from "../../services/user.service";

import { TOTAL_STEPS } from "../../constants/onboarding";

import OnboardingProgress from "../../components/onboarding/OnboardingProgress";
import OnboardingStepProfile from "../../components/onboarding/OnboardingStepProfile";
import OnboardingStepPurpose from "../../components/onboarding/OnboardingStepPurpose";
import OnboardingStepExperience from "../../components/onboarding/OnboardingStepExperience";
import OnboardingStepReferral from "../../components/onboarding/OnboardingStepReferral";
import PageMeta from "../../components/PageMeta";

const OnboardingPage = () => {
  const navigate = useNavigate();

  const { updateUser } = useOnboarding?.() || {};

  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);

  const [inlineError, setInlineError] = useState("");

  const [apiError, setApiError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    avatarFile: null,
    purposes: [],
    experienceLevel: null,
    referralSource: null,
  });

  /*
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

  /*
   * Validate current step.
   */
  const validateCurrentStep = () => {
    /*
     * Step 1
     */
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

    /*
     * Step 2
     */
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

    /*
     * Step 3
     */
    if (step === 3 && !formData.experienceLevel) {
      setInlineError("Please select your current experience level.");

      return false;
    }

    /*
     * Step 4 is optional.
     */

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    setInlineError("");

    setStep((previous) => Math.min(previous + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    if (loading) {
      return;
    }

    setInlineError("");
    setApiError("");

    setStep((previous) => Math.max(previous - 1, 1));
  };

  /*
   * Onboarding JSON payload.
   *
   * Avatar File must never be
   * included here.
   */
  const formatPayload = () => {
    return {
      username: formData.username.trim().toLowerCase(),

      purposes: formData.purposes || [],

      experienceLevel: formData.experienceLevel,

      referralSource: formData.referralSource || null,
    };
  };

  const getResponseData = (response) => {
    return response?.data?.data ?? response?.data ?? response ?? null;
  };

  const submitOnboarding = async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    setApiError("");
    setInlineError("");

    try {
      /*
       * --------------------------------
       * 1. Complete onboarding
       * --------------------------------
       */
      const payload = formatPayload();

      const onboardingResponse = await completeOnboarding(payload);

      const onboardingUser = getResponseData(onboardingResponse);

      if (onboardingUser && updateUser) {
        updateUser(onboardingUser);
      }

      /*
       * --------------------------------
       * 2. Upload optional avatar
       * --------------------------------
       */
      if (formData.avatarFile) {
        try {
          const avatarResponse = await uploadUserAvatar(formData.avatarFile);

          const updatedUser = getResponseData(avatarResponse);

          if (updatedUser && updateUser) {
            updateUser(updatedUser);
          }
        } catch (avatarError) {
          console.error("Avatar upload failed:", avatarError);

          /*
           * Do not rollback
           * onboarding because
           * avatar is optional.
           */
        }
      }

      /*
       * --------------------------------
       * 3. Dashboard
       * --------------------------------
       */
      navigate("/v1/dashboard", {
        replace: true,
      });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to complete onboarding. Please try again.";

      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    if (!validateCurrentStep()) {
      return;
    }

    submitOnboarding();
  };

  const handleSkip = () => {
    if (step !== TOTAL_STEPS) {
      return;
    }

    submitOnboarding();
  };

  return (
    <>
      <PageMeta
        title="Set Up Your Account — GenioCore"
        description="Complete your GenioCore profile, select your goals and experience level, and finish account setup."
      />
      <main className="flex min-h-screen w-full flex-col bg-background px-4 py-5 text-foreground selection:bg-primary/20 sm:px-6 sm:py-6">
        {/* Header */}
        <header className="mx-auto flex h-auto w-full max-w-xl shrink-0 items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-text-primary">
            Neu
            <span className="text-primary">Aspire</span>
          </span>

          <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
            Setup
          </span>
        </header>

        {/* Content */}
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-8">
          <OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} />

          {apiError && (
            <div
              className="mb-4 rounded-lg border border-error/30 bg-error/10 px-3.5 py-2.5 text-center text-xs text-error"
              role="alert"
            >
              {apiError}
            </div>
          )}

          <div className="relative rounded-2xl border border-border bg-card p-5 shadow-xl transition-all duration-300 sm:p-7">
            {step === 1 && (
              <OnboardingStepProfile
                formData={formData}
                updateFormData={updateFormData}
                error={inlineError}
              />
            )}

            {step === 2 && (
              <OnboardingStepPurpose
                formData={formData}
                updateFormData={updateFormData}
                error={inlineError}
              />
            )}

            {step === 3 && (
              <OnboardingStepExperience
                formData={formData}
                updateFormData={updateFormData}
                error={inlineError}
              />
            )}

            {step === 4 && (
              <OnboardingStepReferral
                formData={formData}
                updateFormData={updateFormData}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mx-auto flex w-full max-w-xl shrink-0 items-center justify-between pt-2">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="rounded-lg px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step === TOTAL_STEPS && (
              <button
                type="button"
                onClick={handleSkip}
                disabled={loading}
                className="rounded-lg px-3 py-2 text-xs font-medium text-muted transition-colors hover:text-text-secondary disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                Skip
              </button>
            )}

            {step < TOTAL_STEPS && (
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="flex min-w-24 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-brand transition-all duration-200 hover:bg-primary-hover active:bg-primary-active disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                Continue
                <span aria-hidden="true" className="text-sm">
                  →
                </span>
              </button>
            )}

            {step === TOTAL_STEPS && (
              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="flex min-w-28 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-brand transition-all duration-200 hover:bg-primary-hover active:bg-primary-active disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                {loading ? (
                  <>
                    <span
                      className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
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
    </>
  );
};

export default OnboardingPage;
