import React from "react";
import {
  Sparkles,
  Terminal,
  ShieldCheck,
  Gauge,
  Layers3,
  CheckCircle2,
  FileCode2,
} from "lucide-react";

export default function BrandingPanel() {
  return (
    <div className="lg:col-span-6 bg-surface p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--border-subtle)_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

      {/* Brand */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-assisted code review</span>
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-text-primary">
          GenioCore
        </h1>

        <p className="mt-2 text-base text-foreground font-medium">
          Build better software with clearer code insights.
        </p>

        <p className="mt-1 max-w-lg text-sm leading-6 text-text-secondary">
          Analyze source code for security, performance, and maintainability
          concerns through structured AI-assisted reviews.
        </p>
      </div>

      {/* Review Preview */}
      <div className="my-8 relative z-10">
        <div className="rounded-xl border border-border bg-card/95 shadow-2xl p-5 font-mono text-xs text-text-secondary">
          {/* Terminal Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-subtle">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-error inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-warning inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-success inline-block" />
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-muted">
              <Terminal className="w-3.5 h-3.5 text-primary" />
              <span>geniocore-review</span>
            </div>
          </div>

          {/* Code */}
          <div className="space-y-1 text-text-secondary leading-relaxed">
            <p>
              <span className="text-info font-medium">const</span> review ={" "}
              <span className="text-primary font-medium">await</span>{" "}
              analyze(snapshot);
            </p>

            <p className="text-muted">
              // processing sanitized source snapshot
            </p>
          </div>

          {/* Review Areas */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface border border-border-subtle">
              <span className="flex items-center gap-2 text-text-secondary">
                <ShieldCheck className="w-3.5 h-3.5 text-success" />
                Security Analysis
              </span>

              <span className="text-[10px] text-muted">enabled</span>
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface border border-border-subtle">
              <span className="flex items-center gap-2 text-text-secondary">
                <Gauge className="w-3.5 h-3.5 text-primary" />
                Performance Review
              </span>

              <span className="text-[10px] text-muted">enabled</span>
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface border border-border-subtle">
              <span className="flex items-center gap-2 text-text-secondary">
                <Layers3 className="w-3.5 h-3.5 text-info" />
                Maintainability
              </span>

              <span className="text-[10px] text-muted">enabled</span>
            </div>
          </div>

          {/* Pipeline */}
          <div className="mt-5 pt-4 border-t border-border-subtle">
            <div className="flex items-center gap-2 mb-3 text-[10px] uppercase tracking-wider text-muted">
              <FileCode2 className="w-3.5 h-3.5" />
              Review Pipeline
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[10px]">
              <span className="px-2 py-1 rounded-md bg-background border border-border-subtle text-text-secondary">
                Snapshot
              </span>

              <span className="text-muted">→</span>

              <span className="px-2 py-1 rounded-md bg-background border border-border-subtle text-text-secondary">
                Analysis
              </span>

              <span className="text-muted">→</span>

              <span className="px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-success">
                Findings
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Real Product Capabilities */}
      <div className="relative z-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
          Sanitized snapshots
        </span>

        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
          Private source storage
        </span>

        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
          Structured findings
        </span>
      </div>
    </div>
  );
}
