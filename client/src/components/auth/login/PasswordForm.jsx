import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const PasswordForm = ({ onSubmit, isLoading, errors, clearError }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, password, rememberMe });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Input */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          Work Email
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.passwordEmail || errors.form)
                clearError(["passwordEmail", "form"]);
            }}
            placeholder="you@example.com"
            className={`w-full bg-surface-hover border ${
              errors.passwordEmail
                ? "border-red-500/80 focus:border-red-500"
                : "border-border-subtle focus:border-primary"
            } rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-muted outline-none transition duration-150 focus:ring-1 focus:ring-primary/50`}
          />
        </div>
        {errors.passwordEmail && (
          <p className="text-xs text-red-400 mt-1.5">{errors.passwordEmail}</p>
        )}
      </div>

      {/* Password Input */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          Password
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password || errors.form)
                clearError(["password", "form"]);
            }}
            placeholder="Enter your password"
            className={`w-full bg-surface-hover border ${
              errors.password
                ? "border-red-500/80 focus:border-red-500"
                : "border-border-subtle focus:border-primary"
            } rounded-xl pl-10 pr-10 py-2.5 text-sm text-text-primary placeholder:text-muted outline-none transition duration-150 focus:ring-1 focus:ring-primary/50`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-gray-200 transition"
            tabIndex="-1"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-400 mt-1.5">{errors.password}</p>
        )}
      </div>

      {/* General Error Banner */}
      {errors.form && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5">
          <p className="text-xs text-red-400">{errors.form}</p>
        </div>
      )}

      {/* Remember Me & Forgot Link */}
      <div className="flex items-center justify-between text-xs pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none text-muted hover:text-text-secondary">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded bg-surface-hover border border-white/20 text-primary accent-primary focus:ring-0 focus:outline-none"
          />
          Remember me
        </label>

        <Link
          to="/v1/auth/forgot-password"
          className="text-muted hover:text-success transition"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit Action */}
      <button
        type="submit"
        disabled={isLoading}
        className="cursor-pointer w-full mt-2 bg-primary hover:bg-primary-hover active:scale-[0.99] text-background font-semibold py-2.5 rounded-xl transition duration-150 flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(34,197,94,0.2)] disabled:opacity-50 disabled:pointer-events-none"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};

export default PasswordForm;
