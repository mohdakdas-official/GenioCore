import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const FormField = ({
  label,
  name,
  type = "text",
  placeholder,
  icon: Icon,
  register,
  error,
  isMatchValid,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";
  const inputType = isPasswordType && showPassword ? "text" : type;

  const getBorderColor = () => {
    if (error) return "border-error focus:border-error focus:ring-error/20";
    if (isMatchValid)
      return "border-success/60 focus:border-success focus:ring-success/20";
    return "border-border-subtle focus:border-primary focus:ring-primary/20";
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-text-secondary">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        )}
        <input
          type={inputType}
          {...register(name)}
          placeholder={placeholder}
          className={`w-full bg-surface border ${getBorderColor()} rounded-xl ${
            Icon ? "pl-10" : "pl-4"
          } ${
            isPasswordType ? "pr-10" : "pr-4"
          } py-2.5 text-sm text-foreground placeholder:text-muted outline-none transition duration-150 focus:ring-2`}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-text-primary transition p-0.5"
            tabIndex="-1"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-error">{error.message}</p>}
    </div>
  );
};

export default FormField;
