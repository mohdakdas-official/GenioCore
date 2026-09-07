import React from "react";
import { useTheme } from "../theme/useTheme";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const AppearancePage = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      value: "light",
      label: "Light",
      description: "Use the light appearance",
    },
    {
      value: "dark",
      label: "Dark",
      description: "Use the dark appearance",
    },
    {
      value: "system",
      label: "System",
      description: "Follow your device settings",
    },
  ];

  return (
    <div className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Appearance
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            Customize how NeuAspire looks on your device.
          </p>
        </div>

        {/* Appearance Card */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Theme</h2>

            <p className="mt-1 text-sm text-muted">
              Choose your preferred appearance.
            </p>
          </div>

          {/* Theme Options */}
          <div className="mt-6 space-y-3">
            {themes.map((item) => {
              const isActive = theme === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTheme(item.value)}
                  className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition-all ${
                    isActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-border-hover hover:bg-surface"
                  }`}
                >
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isActive ? "text-primary" : "text-text-primary"
                      }`}
                    >
                      {item.label}
                    </p>

                    <p className="mt-1 text-xs text-text-secondary">
                      {item.description}
                    </p>
                  </div>

                  {/* Selected Indicator */}
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      isActive ? "border-primary" : "border-border"
                    }`}
                  >
                    {isActive && (
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Current Theme */}
          <div className="mt-6 border-t border-border-subtle pt-5">
            <p className="text-xs text-muted">Current theme</p>

            <p className="mt-1 text-sm font-medium capitalize text-text-primary">
              {theme}
            </p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
          >
            <ArrowLeft size={18} />
            Back to home
          </Link>

          <Link
            to="/v1/auth/signup"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-brand transition-colors hover:bg-primary-hover active:bg-primary-active"
          >
            Get started for free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AppearancePage;
