import React from "react";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Terminal,
} from "lucide-react";

const LeftSection = () => {
  return (
    <div className="lg:col-span-6 bg-gradient-to-b from-card to-background p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border-subtle relative overflow-hidden">
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Brand Header */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-success text-xs font-mono mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>NeuAspire v2.4 Engine</span>
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-text-primary">
          NeuAspire
        </h1>

        <p className="mt-2 text-base text-text-secondary font-medium">
          AI-powered code reviews for better software.
        </p>

        <p className="mt-1 text-sm text-muted">
          Analyze your code, catch critical issues early, and ship secure
          software with automated intelligence.
        </p>
      </div>

      {/* Terminal Mockup */}
      <div className="my-8 relative z-10">
        <div className="rounded-xl border border-border-subtle bg-background/95 shadow-2xl p-5 font-mono text-xs text-text-secondary relative">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5 text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
            </div>

            <div className="flex items-center gap-1 text-[11px] text-muted">
              <Terminal className="w-3.5 h-3.5 text-primary" />
              <span>ai-analyzer.ts</span>
            </div>
          </div>

          <div className="space-y-1 text-muted leading-relaxed">
            <p>
              <span className="text-[#06B6D4]">const</span> review ={" "}
              <span className="text-primary">await</span> analyze(pullRequest);
            </p>
            <p className="text-gray-500">
              // NeuAspire Static & Security Matrix
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-white/[0.03] border border-white/5">
              <span className="flex items-center gap-2 text-text-secondary">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                Security Vulnerability Scan
              </span>
              <span className="text-success font-semibold text-[11px]">
                Passed
              </span>
            </div>

            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-white/[0.03] border border-white/5">
              <span className="flex items-center gap-2 text-text-secondary">
                <Zap className="w-3.5 h-3.5 text-primary" />
                Performance Optimization
              </span>
              <span className="text-success font-semibold text-[11px]">
                0 Bottlenecks
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted">
                Quality Score
              </span>
              <p className="text-lg font-bold text-text-primary tracking-tight">
                98{" "}
                <span className="text-xs text-gray-500 font-normal">/ 100</span>
              </p>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary/15 border border-primary/30 text-success text-[11px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ready to Merge
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="relative z-10 text-xs text-muted flex items-center justify-between">
        <span>SOC2 Type II Certified</span>
        <span>Zero-Retention AI</span>
      </div>
    </div>
  );
};

export default LeftSection;
