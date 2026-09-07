import React, { useRef } from "react";
import { Mail, Edit3, RefreshCw, Loader2, ArrowRight } from "lucide-react";

const OtpForm = ({
  stage,
  otpEmail,
  setOtpEmail,
  onRequestOtp,
  onVerifyOtp,
  onChangeEmail,
  onResendOtp,
  countdown,
  isCountingDown,
  otpValues,
  setOtpValues,
  isLoading,
  errors,
  clearError,
}) => {
  const otpInputRefs = useRef([]);

  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otpValues];
    newOtp[index] = value.slice(-1);
    setOtpValues(newOtp);

    if (errors.otp) clearError(["otp"]);
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      setOtpValues(pastedData.split(""));
      otpInputRefs.current[5]?.focus();
      if (errors.otp) clearError(["otp"]);
    }
  };

  return stage === "request" ? (
    <form onSubmit={onRequestOtp} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          Work Email
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="email"
            value={otpEmail}
            onChange={(e) => {
              setOtpEmail(e.target.value);
              if (errors.otpEmail || errors.form)
                clearError(["otpEmail", "form"]);
            }}
            placeholder="you@example.com"
            className={`w-full bg-surface-hover border ${
              errors.otpEmail
                ? "border-red-500/80 focus:border-red-500"
                : "border-border-subtle focus:border-primary"
            } rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-muted outline-none transition duration-150 focus:ring-1 focus:ring-primary/50`}
          />
        </div>
        {errors.otpEmail && (
          <p className="text-xs text-red-400 mt-1.5">{errors.otpEmail}</p>
        )}
      </div>

      {errors.form && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5">
          <p className="text-xs text-red-400">{errors.form}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="cursor-pointer w-full bg-primary hover:bg-primary-hover active:scale-[0.99] text-background font-semibold py-2.5 rounded-xl transition duration-150 flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(34,197,94,0.2)] disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Sending OTP...</span>
          </>
        ) : (
          <>
            <span>Send Verification Code</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  ) : (
    <form onSubmit={onVerifyOtp} className="space-y-4">
      <div className="flex items-center justify-between pb-1">
        <p className="text-xs text-text-secondary">
          Code sent to{" "}
          <span className="text-text-primary font-medium">{otpEmail}</span>
        </p>
        <button
          type="button"
          onClick={onChangeEmail}
          className="cursor-pointer text-xs text-success hover:underline flex items-center gap-1"
        >
          <Edit3 className="w-3 h-3" />
          Change
        </button>
      </div>

      <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
        {otpValues.map((val, idx) => (
          <input
            key={idx}
            ref={(el) => (otpInputRefs.current[idx] = el)}
            type="text"
            maxLength={1}
            inputMode="numeric"
            value={val}
            onChange={(e) => handleOtpChange(idx, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
            className="w-12 h-12 text-center text-lg font-bold bg-surface-hover border border-border-subtle focus:border-primary rounded-xl text-text-primary outline-none focus:ring-1 focus:ring-primary transition"
          />
        ))}
      </div>

      {errors.otp && <p className="text-xs text-red-400">{errors.otp}</p>}
      {errors.form && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5">
          <p className="text-xs text-red-400">{errors.form}</p>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted pt-1">
        <span>Didn't receive code?</span>
        {isCountingDown ? (
          <span className="text-muted font-mono">Resend in {countdown}s</span>
        ) : (
          <button
            type="button"
            onClick={onResendOtp}
            className="cursor-pointer text-success hover:underline flex items-center gap-1 font-medium"
          >
            <RefreshCw className="w-3 h-3" />
            Resend OTP
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="cursor-pointer w-full bg-primary hover:bg-primary-hover active:scale-[0.99] text-background font-semibold py-2.5 rounded-xl transition duration-150 flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(34,197,94,0.2)] disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verifying...</span>
          </>
        ) : (
          <>
            <span>Verify & Continue</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};

export default OtpForm;
