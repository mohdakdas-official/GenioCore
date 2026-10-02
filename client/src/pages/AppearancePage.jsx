import { Check, Monitor, Moon, Sun } from "lucide-react";

import { Card, CardHeader } from "../components/ui/Card";

import { useTheme } from "../theme/useTheme";

const AppearancePage = () => {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    {
      id: "dark",
      title: "Dark",
      description: "Dark interface",
      icon: Moon,
    },
    {
      id: "light",
      title: "Light",
      description: "Light interface",
      icon: Sun,
    },
    {
      id: "system",
      title: "System",
      description: "Follow device preference",
      icon: Monitor,
    },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <Card className="space-y-4">
        <CardHeader
          title="Color Theme"
          subtitle="Choose a fixed interface theme or automatically follow your device preference"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {themeOptions.map((option) => {
            const Icon = option.icon;

            const isSelected = theme === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTheme(option.id)}
                className={`flex h-28 flex-col justify-between rounded-xl border p-4 text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-card ring-1 ring-primary"
                    : "border-border-subtle bg-surface opacity-70 hover:border-border-hover hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-primary" />

                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </div>

                <div>
                  <span className="block text-xs font-semibold text-text-primary">
                    {option.title}
                  </span>

                  <span className="font-mono text-[10px] text-muted">
                    {option.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default AppearancePage;
