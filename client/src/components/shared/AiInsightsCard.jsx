import { Sparkles } from "lucide-react";
import { Card } from "../ui/Card";

export const AiInsightsCard = ({ insights = [] }) => {
  return (
    <Card className="border-border-subtle bg-gradient-to-r from-card to-surface">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md border border-primary/20 bg-primary/10">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
        </div>

        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
          AI Code Intelligence Summary
        </h3>
      </div>

      {insights.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {insights.map((item, index) => {
            const Icon = item.icon || Sparkles;

            return (
              <div
                key={item.id ?? `${item.category}-${index}`}
                className="flex flex-col justify-between rounded-lg border border-border-subtle bg-surface p-3.5 transition-colors hover:border-border-hover"
              >
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="rounded border border-border-subtle bg-surface-hover px-2 py-0.5 font-mono text-[10px] uppercase text-muted">
                      {item.category}
                    </span>

                    <Icon
                      className={`h-3.5 w-3.5 ${item.color || "text-primary"}`}
                    />
                  </div>

                  <h4 className="mb-1 text-xs font-semibold text-text-primary">
                    {item.title}
                  </h4>

                  <p className="text-[11px] leading-relaxed text-muted">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-28 items-center justify-center rounded-lg border border-border-subtle bg-surface">
          <div className="text-center">
            <Sparkles className="mx-auto mb-2 h-4 w-4 text-muted" />

            <p className="text-xs text-muted">
              No completed review insights available yet.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};
