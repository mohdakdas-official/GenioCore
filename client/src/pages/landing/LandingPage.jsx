import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Gauge,
  Layers3,
  LockKeyhole,
  SearchCode,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Workflow,
  Zap,
} from "lucide-react";

import { Button } from "../../components/ui/Button";

const features = [
  {
    icon: ShieldCheck,
    title: "Security Analysis",
    description:
      "Review source code for security risks and surface findings with severity, location and remediation guidance.",
  },
  {
    icon: Gauge,
    title: "Performance Review",
    description:
      "Analyze code for performance concerns and identify areas that may impact efficiency or scalability.",
  },
  {
    icon: Layers3,
    title: "Maintainability",
    description:
      "Evaluate code quality and maintainability so complex or fragile areas are easier to identify.",
  },
  {
    icon: Workflow,
    title: "Multi-provider AI Routing",
    description:
      "Route review workloads across supported AI providers with automatic fallback when a provider is unavailable.",
  },
  {
    icon: SearchCode,
    title: "Actionable Findings",
    description:
      "Get structured findings with affected files, severity, explanation and recommended improvements.",
  },
  {
    icon: Code2,
    title: "Review History",
    description:
      "Keep projects and completed reviews organized so previous analysis stays accessible from one workspace.",
  },
];

const workflow = [
  {
    number: "01",
    icon: Code2,
    title: "Create a project",
    description:
      "Set up a project workspace for the source code you want to review.",
  },
  {
    number: "02",
    icon: UploadCloud,
    title: "Upload a snapshot",
    description:
      "Upload your project as a ZIP archive. Relevant source files are validated and sanitized before analysis.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Run the review",
    description:
      "Choose a review scope and let the review pipeline process the project in manageable chunks.",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Inspect the results",
    description:
      "Review scores, findings, affected files and recommendations from a structured report.",
  },
];

const securityPoints = [
  "Sensitive .env and credential files are excluded from review snapshots.",
  "Uploaded snapshots are stored privately rather than exposed through public URLs.",
  "Source archives are sanitized before they enter the review pipeline.",
  "Projects and reviews are protected behind authenticated user access.",
];

const LandingPage = () => {
  const navigate = useNavigate();

  const goToSignup = () => {
    navigate("/v1/auth/signup");
  };

  const goToLogin = () => {
    navigate("/v1/auth/login");
  };

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-border-subtle bg-background/85 backdrop-blur-xl">
        <div className="flex h-20 w-full items-center justify-between px-5 sm:px-8 lg:px-12 xl:px-16">
          <a href="#top" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
              <Code2 className="h-5 w-5 text-primary" />
            </div>

            <div>
              <div className="text-base font-black tracking-[-0.03em] text-text-primary">
                GenioCore
              </div>

              <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted">
                by Entellens
              </div>
            </div>
          </a>
          <nav className="hidden items-center gap-7 text-xs font-medium text-text-secondary md:flex">
            <a
              href="#features"
              className="transition-colors hover:text-text-primary"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="transition-colors hover:text-text-primary"
            >
              How it works
            </a>

            <a
              href="#security"
              className="transition-colors hover:text-text-primary"
            >
              Security
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={goToLogin}
              className="hidden sm:inline-flex"
            >
              Sign in
            </Button>

            <Button
              size="sm"
              variant="primary"
              icon={ArrowRight}
              iconPosition="right"
              onClick={goToSignup}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="relative min-h-[calc(100svh-5rem)] overflow-hidden">
          {/* Background */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[15%] top-[-160px] h-[700px] w-[700px] rounded-full bg-primary/[0.08] blur-[160px]" />

            <div className="absolute bottom-[-180px] right-[-80px] h-[650px] w-[650px] rounded-full bg-secondary/[0.06] blur-[160px]" />

            <div
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
                backgroundSize: "52px 52px",
              }}
            />

            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" />
          </div>

          <div className="relative grid min-h-[calc(100svh-5rem)] w-full items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-12 lg:px-12 lg:py-16 xl:px-16">
            {/* LEFT */}
            <div className="lg:col-span-7 xl:col-span-7">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                AI-assisted code intelligence
              </div>

              <h1
                className="
          max-w-[950px]
          text-[3.4rem]
          font-black
          leading-[0.91]
          tracking-[-0.065em]
          text-text-primary
          sm:text-[4.7rem]
          lg:text-[5.4rem]
          xl:text-[6.4rem]
          2xl:text-[7.2rem]
        "
              >
                FIND ISSUES
                <span className="block text-text-primary">BEFORE THEY</span>
                <span className="block bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                  SHIP.
                </span>
              </h1>

              <p className="mt-8 max-w-xl text-sm leading-7 text-muted sm:text-base lg:text-lg lg:leading-8">
                Review source code for security, performance and maintainability
                concerns through structured AI-assisted analysis.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  variant="primary"
                  icon={ArrowRight}
                  iconPosition="right"
                  onClick={goToSignup}
                  className="h-12 px-6 text-sm"
                >
                  Start Reviewing
                </Button>

                <Button
                  size="lg"
                  variant="ghost"
                  onClick={goToLogin}
                  className="h-12 px-6 text-sm"
                >
                  Sign In
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3">
                {["Security", "Performance", "Maintainability"].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-xs font-medium text-text-secondary"
                  >
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — PRODUCT VISUAL */}
            <div className="relative lg:col-span-5 xl:col-span-5">
              <div className="absolute -inset-10 rounded-full bg-primary/[0.06] blur-[100px]" />

              <div className="relative lg:translate-x-4 xl:translate-x-8">
                <div className="overflow-hidden rounded-[24px] border border-border-subtle bg-card shadow-2xl">
                  {/* Window Bar */}
                  <div className="flex h-12 items-center justify-between border-b border-border-subtle bg-surface px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-error/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                    </div>

                    <span className="font-mono text-[10px] text-muted">
                      geniocore / review
                    </span>

                    <div className="w-12" />
                  </div>

                  <div className="p-5 sm:p-6 lg:p-5 xl:p-7">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-5 border-b border-border-subtle pb-5">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                          Analysis
                        </span>

                        <h3 className="mt-1 text-xl font-bold tracking-tight text-text-primary">
                          Code Review
                        </h3>
                      </div>

                      <span className="rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-[9px] font-bold tracking-wide text-success">
                        COMPLETED
                      </span>
                    </div>

                    {/* Review Areas */}
                    <div className="mt-5 grid grid-cols-3 gap-2">
                      {[
                        ["Security", ShieldCheck],
                        ["Performance", Gauge],
                        ["Maintainability", Layers3],
                      ].map(([label, Icon]) => (
                        <div
                          key={label}
                          className="rounded-xl border border-border-subtle bg-surface p-3"
                        >
                          <Icon className="h-4 w-4 text-primary" />

                          <div className="mt-4 text-[10px] font-semibold text-text-secondary">
                            {label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Findings */}
                    <div className="mt-5">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                          Findings
                        </span>

                        <SearchCode className="h-4 w-4 text-muted" />
                      </div>

                      <div className="space-y-2">
                        {[
                          ["Security finding", "HIGH"],
                          ["Performance finding", "MEDIUM"],
                          ["Maintainability finding", "LOW"],
                        ].map(([title, severity]) => (
                          <div
                            key={title}
                            className="flex items-center justify-between gap-4 rounded-xl border border-border-subtle bg-surface px-4 py-3.5"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-2 rounded-full bg-primary" />

                              <span className="text-[11px] font-medium text-text-secondary">
                                {title}
                              </span>
                            </div>

                            <span className="font-mono text-[8px] text-muted">
                              {severity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom */}
                    <div className="mt-5 flex items-center justify-between border-t border-border-subtle pt-4">
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.15em] text-muted">
                          Review Pipeline
                        </div>

                        <div className="mt-1 text-xs font-semibold text-text-primary">
                          Analysis complete
                        </div>
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* floating card */}
                <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-border-subtle bg-background/90 px-4 py-3 shadow-xl backdrop-blur-xl sm:block">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Workflow className="h-4 w-4 text-primary" />
                    </div>

                    <div>
                      <div className="text-[10px] font-semibold text-text-primary">
                        Multi-provider routing
                      </div>

                      <div className="mt-0.5 text-[9px] text-muted">
                        Automatic fallback
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section
          id="features"
          className="border-y border-border-subtle bg-surface/35"
        >
          <div className="w-full px-5 py-24 sm:px-8 lg:px-12 xl:px-16">
            <div className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Capabilities
              </div>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-text-primary">
                One workspace for deeper code analysis.
              </h2>

              <p className="mt-4 text-sm leading-6 text-muted">
                Focus on the parts of a codebase that matter without turning
                review results into an unstructured wall of AI output.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="group rounded-2xl border border-border-subtle bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-hover hover:bg-card-hover"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/15 bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>

                  <h3 className="mt-5 text-sm font-semibold text-text-primary">
                    {title}
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-muted">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works">
          <div className="w-full px-5 py-24 sm:px-8 lg:px-12 xl:px-16">
            <div className="mx-auto max-w-2xl text-center">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Workflow
              </div>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-text-primary">
                From source code to structured review.
              </h2>

              <p className="mt-4 text-sm leading-6 text-muted">
                A straightforward review pipeline designed around real project
                snapshots.
              </p>
            </div>

            <div className="mt-14 grid gap-4 lg:grid-cols-4">
              {workflow.map(
                ({ number, icon: Icon, title, description }, index) => (
                  <div
                    key={number}
                    className="relative rounded-2xl border border-border-subtle bg-card p-5"
                  >
                    {index < workflow.length - 1 && (
                      <ArrowRight className="absolute -right-6 top-8 z-10 hidden h-4 w-4 text-text-disabled lg:block" />
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>

                      <span className="font-mono text-[10px] text-text-disabled">
                        {number}
                      </span>
                    </div>

                    <h3 className="mt-5 text-sm font-semibold text-text-primary">
                      {title}
                    </h3>

                    <p className="mt-2 text-xs leading-6 text-muted">
                      {description}
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>

        {/* SECURITY */}
        <section
          id="security"
          className="border-y border-border-subtle bg-surface/35"
        >
          <div className="w-full grid gap-12 px-5 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/15 bg-primary/10">
                <LockKeyhole className="h-5 w-5 text-primary" />
              </div>

              <div className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Source handling
              </div>

              <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight text-text-primary">
                Review source code without treating uploads casually.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
                GenioCore applies validation and sanitization before source
                snapshots enter the AI review pipeline.
              </p>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-card p-6 sm:p-8">
              <div className="space-y-5">
                {securityPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                    </div>

                    <p className="text-xs leading-6 text-text-secondary">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="w-full px-5 py-24 sm:px-8 lg:px-12 xl:px-16">
            <div className="relative overflow-hidden rounded-3xl border border-border-subtle bg-card px-6 py-12 text-center shadow-lg sm:px-10 sm:py-16">
              <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 rounded-full bg-primary/[0.08] blur-[100px]" />

              <div className="relative">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>

                <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight text-text-primary">
                  Turn your next code review into something you can act on.
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted">
                  Create a project, upload a source snapshot and run your first
                  AI-assisted review.
                </p>

                <Button
                  size="lg"
                  variant="primary"
                  icon={ArrowRight}
                  iconPosition="right"
                  onClick={goToSignup}
                  className="mt-8"
                >
                  Start Your First Review
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border-subtle bg-background">
        <div className="w-full px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-base font-black tracking-[-0.03em] text-text-primary">
                GenioCore
              </div>

              <div className="mt-1 text-[11px] text-muted">
                An Entellens product.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-muted">
              <button
                type="button"
                onClick={goToLogin}
                className="cursor-pointer transition-colors hover:text-text-primary"
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={goToSignup}
                className="cursor-pointer transition-colors hover:text-text-primary"
              >
                Create Account
              </button>

              <a
                href="#features"
                className="transition-colors hover:text-text-primary"
              >
                Features
              </a>

              <a
                href="#security"
                className="transition-colors hover:text-text-primary"
              >
                Security
              </a>
            </div>

            <div className="text-[10px] uppercase tracking-[0.16em] text-text-disabled">
              © {new Date().getFullYear()} Entellens
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
