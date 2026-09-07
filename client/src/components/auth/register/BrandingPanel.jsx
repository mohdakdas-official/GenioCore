import React from "react";
import {
  Sparkles,
  Terminal,
  ShieldCheck,
  Cpu,
  GitPullRequest,
  CheckCircle2,
} from "lucide-react";

export default function BrandingPanel() {
  return (
    <div className="lg:col-span-6 bg-surface p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(var(--border-subtle)_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>NeuAspire AI Engine</span>
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-text-primary">
          NeuAspire
        </h1>
        <p className="mt-2 text-base text-foreground font-medium">
          Build better software with AI.
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          Create your account and start getting intelligent, automated code
          reviews for your engineering team.
        </p>
      </div>

      <div className="my-8 relative z-10">
        <div className="rounded-xl border border-border bg-card/95 shadow-2xl p-5 font-mono text-xs text-text-secondary">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle text-muted">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-error inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-warning inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-success inline-block" />
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted">
              <Terminal className="w-3.5 h-3.5 text-primary" />
              <span>neuaspire-engine.ts</span>
            </div>
          </div>

          <div className="space-y-1 text-text-secondary leading-relaxed">
            <p>
              <span className="text-info font-medium">const</span> analysis ={" "}
              <span className="text-primary font-medium">await</span>{" "}
              engine.audit(repo);
            </p>
            <p className="text-muted">// Neural Static Analysis Running</p>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-surface border border-border-subtle">
              <span className="flex items-center gap-2 text-text-secondary">
                <ShieldCheck className="w-3.5 h-3.5 text-success" />
                Zero Security Flaws
              </span>
              <span className="text-success font-semibold text-[11px]">
                100% Secure
              </span>
            </div>

            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-surface border border-border-subtle">
              <span className="flex items-center gap-2 text-text-secondary">
                <Cpu className="w-3.5 h-3.5 text-primary" />
                Performance & Memory
              </span>
              <span className="text-primary font-semibold text-[11px]">
                Optimal
              </span>
            </div>

            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-surface border border-border-subtle">
              <span className="flex items-center gap-2 text-text-secondary">
                <GitPullRequest className="w-3.5 h-3.5 text-info" />
                PR Auto-Remediation
              </span>
              <span className="text-info font-semibold text-[11px]">
                Enabled
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted">
                Code Health Index
              </span>
              <p className="text-lg font-bold text-text-primary tracking-tight">
                96 <span className="text-xs text-muted font-normal">/ 100</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-success/10 border border-success/20 text-success text-[11px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Production Ready
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-xs text-muted flex items-center justify-between">
        <span>Enterprise Grade Security</span>
        <span>Real-time Code Audits</span>
      </div>
    </div>
  );
}
