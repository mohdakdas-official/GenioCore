import React from "react";
import {
  Sparkles,
  ShieldCheck,
  Gauge,
  CheckCircle2,
  Terminal,
  Layers3,
  FileCode2,
} from "lucide-react";

const LeftSection = () => {
  return (
    <div className="lg:col-span-6 bg-gradient-to-b from-card to-background p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border-subtle relative overflow-hidden">
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Brand Header */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-success text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-assisted code review</span>
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-text-primary">
          GenioCore
        </h1>

        <p className="mt-2 text-base text-text-secondary font-medium">
          Review code with more clarity and context.
        </p>

        <p className="mt-1 max-w-lg text-sm leading-6 text-muted">
          Analyze source code for security, performance, and maintainability
          concerns with structured AI-assisted review findings.
        </p>
      </div>

      {/* Review Pipeline Mockup */}
      <div className="my-8 relative z-10">
        <div className="rounded-xl border border-border-subtle bg-background/95 shadow-2xl p-5 font-mono text-xs text-text-secondary relative">
          {/* Terminal Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-muted">
              <Terminal className="w-3.5 h-3.5 text-primary" />
              <span>review-pipeline</span>
            </div>
          </div>

          {/* Code Preview */}
          <div className="space-y-1 leading-relaxed">
            <p>
              <span className="text-secondary">const</span>{" "}
              <span className="text-text-primary">review</span> ={" "}
              <span className="text-primary">await</span> analyze(snapshot);
            </p>

            <p className="text-muted">// structured code analysis</p>
          </div>

          {/* Analysis Types */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
              <span className="flex items-center gap-2 text-text-secondary">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                Security Analysis
              </span>

              <span className="text-[10px] text-muted">enabled</span>
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
              <span className="flex items-center gap-2 text-text-secondary">
                <Gauge className="w-3.5 h-3.5 text-primary" />
                Performance Review
              </span>

              <span className="text-[10px] text-muted">enabled</span>
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
              <span className="flex items-center gap-2 text-text-secondary">
                <Layers3 className="w-3.5 h-3.5 text-primary" />
                Maintainability
              </span>

              <span className="text-[10px] text-muted">enabled</span>
            </div>
          </div>

          {/* Pipeline Status */}
          <div className="mt-5 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted mb-3">
              <FileCode2 className="w-3.5 h-3.5" />
              Review Flow
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[10px]">
              <span className="px-2 py-1 rounded-md bg-surface border border-border-subtle text-text-secondary">
                Snapshot
              </span>

              <span className="text-muted">→</span>

              <span className="px-2 py-1 rounded-md bg-surface border border-border-subtle text-text-secondary">
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

      {/* Real Capability Indicators */}
      <div className="relative z-10 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
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
};

export default LeftSection;
