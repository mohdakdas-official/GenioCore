import { useMemo, useState } from "react";

import {
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileCode2,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Upload,
  XCircle,
} from "lucide-react";

import { Card, CardHeader } from "../../components/ui/Card";

import { Button } from "../../components/ui/Button";

const helpTopics = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Projects, code uploads, and your first code review.",
    icon: BookOpen,
    search: "project review upload",
  },
  {
    id: "reviews",
    title: "Reviews & Reports",
    description: "Review status, findings, scores, reports, and retries.",
    icon: FileCode2,
    search: "review status report failed retry",
  },
  {
    id: "account",
    title: "Account & Settings",
    description: "Profile, username, password, notifications, and appearance.",
    icon: Settings,
    search: "profile username password notification appearance",
  },
];

const faqs = [
  {
    id: "create-project",
    category: "Getting Started",
    q: "How do I start using the platform?",
    a: "Create a project first. After that, start a review for the project using the available code upload and review flow. The review is processed in the background and its status can be followed from the review interface.",
    keywords: "project create getting started upload review",
  },
  {
    id: "code-upload",
    category: "Getting Started",
    q: "How is code provided for a review?",
    a: "The current MVP uses the manual code upload workflow. Uploaded code is prepared as a code snapshot before the review job is sent for processing.",
    keywords: "zip upload manual snapshot source code",
  },
  {
    id: "github-support",
    category: "Getting Started",
    q: "Can I connect a GitHub repository directly?",
    a: "Direct GitHub repository integration is not part of the current MVP. The current working review flow uses manual code uploads. GitHub integration can be added later as a separate product capability.",
    keywords: "github repository integration manual upload",
  },
  {
    id: "review-status",
    category: "Reviews",
    q: "What do the different review statuses mean?",
    a: "QUEUED means the review is waiting for processing. PROCESSING means the worker is actively analyzing it. COMPLETED means the report is ready. FAILED means processing could not finish successfully. CANCELLED represents a review that was cancelled.",
    keywords: "queued processing completed failed cancelled status",
  },
  {
    id: "review-types",
    category: "Reviews",
    q: "What review types are available?",
    a: "The review system supports FULL, SECURITY, PERFORMANCE, and MAINTAINABILITY review types. A full review combines the broader analysis, while the other modes focus on a specific area.",
    keywords: "full security performance maintainability review type",
  },
  {
    id: "review-report",
    category: "Reviews",
    q: "What information is shown in a completed review?",
    a: "A completed review can include an overall score, security, performance, maintainability and reliability scores, a summary, issue counts by severity, individual findings, and execution information returned by the review pipeline.",
    keywords:
      "report score security performance maintainability reliability issues findings",
  },
  {
    id: "failed-review",
    category: "Reviews",
    q: "What should I do if a review fails?",
    a: "Open the failed review and check the failure information first. A review can fail because of an AI provider error, quota limitation, processing failure, or another pipeline problem. After the underlying issue is resolved, the review can be retried where retry is supported.",
    keywords: "failed failure error quota retry provider review",
  },
  {
    id: "notifications",
    category: "Notifications",
    q: "When are notifications created?",
    a: "Notifications can be created when a review completes, when a review permanently fails, and when completed analysis contains high or critical severity findings. Notifications can be marked as read or deleted.",
    keywords:
      "notification completed failed security high critical read delete",
  },
  {
    id: "username",
    category: "Account",
    q: "How do I change my username?",
    a: "Open Settings and go to Profile. When you enter a different username, the platform checks whether it is available. A taken or invalid username cannot be saved. The backend also performs a final uniqueness check when the profile is updated.",
    keywords: "settings profile username available taken change",
  },
  {
    id: "experience-level",
    category: "Account",
    q: "Where is my experience level stored?",
    a: "Your basic identity information such as full name, username and email belongs to your user account. Experience level is stored separately in your user preferences and can be updated from Profile settings.",
    keywords: "experience level preferences profile",
  },
  {
    id: "change-password",
    category: "Security",
    q: "What is the difference between Change Password and Forgot Password?",
    a: "Change Password is for a logged-in user who knows the current password. The current password is verified before the new one is saved. Forgot Password is the recovery flow used when the current password is not known and uses the existing verification process.",
    keywords: "password security forgot reset current change",
  },
  {
    id: "appearance",
    category: "Appearance",
    q: "How do Light, Dark, and System themes work?",
    a: "Dark and Light force a specific interface theme. System follows the operating system color preference. The selected theme is stored locally so the interface can restore the preference after a reload.",
    keywords: "appearance light dark system theme settings",
  },
  {
    id: "ast-support",
    category: "Platform",
    q: "Does the platform currently perform AST-based static analysis?",
    a: "The current MVP should not be treated as an AST-based static analysis engine. The working review pipeline analyzes prepared code snapshots using the configured AI review system. AST and language-parser integration can be introduced later as a separate capability.",
    keywords: "ast static analysis parser tree sitter",
  },
  {
    id: "ci-support",
    category: "Platform",
    q: "Does the platform currently provide CLI or CI/CD integration?",
    a: "Not in the current MVP. API tokens, a public CLI, GitHub Actions, GitLab CI integration, and automated pull-request quality gates should only be exposed after those backend capabilities are implemented.",
    keywords: "cli ci cd github actions gitlab api token pipeline",
  },
];

const normalize = (value) => value.toLowerCase().trim();

const HelpPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const [expandedFaqId, setExpandedFaqId] = useState("create-project");

  const filteredFaqs = useMemo(() => {
    const query = normalize(searchTerm);

    if (!query) {
      return faqs;
    }

    const terms = query.split(/\s+/).filter(Boolean);

    return faqs.filter((faq) => {
      const searchable = normalize(
        [faq.q, faq.a, faq.category, faq.keywords].join(" "),
      );

      return terms.some((term) => searchable.includes(term));
    });
  }, [searchTerm]);

  const handleTopicClick = (topic) => {
    setSearchTerm(topic.search);

    setExpandedFaqId(null);
  };

  const handleTroubleshooting = () => {
    setSearchTerm("failed review retry quota provider error");

    setExpandedFaqId("failed-review");
  };

  const clearSearch = () => {
    setSearchTerm("");
    setExpandedFaqId("create-project");
  };

  return (
    <div className="max-w-full space-y-6">
      {/* Header */}
      <div className="border-b border-border-subtle pb-2">
        <div className="flex items-center gap-2">
          <CircleHelp className="h-5 w-5 text-primary" />

          <h2 className="text-lg font-bold tracking-tight text-text-primary">
            Help & Documentation
          </h2>
        </div>

        <p className="mt-1 text-xs text-muted">
          Learn how projects, reviews, notifications, and account settings work.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search projects, reviews, reports, username, password..."
          className="h-11 w-full rounded-xl border border-border-subtle bg-card pl-10 pr-10 text-xs text-text-primary shadow-xs placeholder:text-muted focus:border-primary focus:outline-none"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={clearSearch}
            title="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-text-primary"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Help Topics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {helpTopics.map((topic) => {
          const Icon = topic.icon;

          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => handleTopicClick(topic)}
              className="text-left"
            >
              <Card hover className="h-full cursor-pointer space-y-2 group">
                <Icon className="h-5 w-5 text-primary" />

                <h4 className="text-xs font-semibold text-text-primary transition-colors group-hover:text-primary">
                  {topic.title}
                </h4>

                <p className="text-[11px] leading-relaxed text-muted">
                  {topic.description}
                </p>
              </Card>
            </button>
          );
        })}
      </div>

      {/* FAQ */}
      <Card className="space-y-4">
        <CardHeader
          title="Frequently Asked Questions"
          subtitle={
            searchTerm
              ? `${filteredFaqs.length} result${
                  filteredFaqs.length === 1 ? "" : "s"
                } found`
              : "Common questions about the current platform"
          }
        />

        {filteredFaqs.length === 0 ? (
          <div className="rounded-lg border border-border-subtle bg-surface px-4 py-10 text-center">
            <Search className="mx-auto h-6 w-6 text-muted opacity-50" />

            <p className="mt-2 text-xs font-medium text-text-primary">
              No help topics found
            </p>

            <p className="mt-1 text-[11px] text-muted">
              Try another search term or view all questions.
            </p>

            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="mt-4"
              onClick={clearSearch}
            >
              View All Questions
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredFaqs.map((faq) => {
              const isOpen = expandedFaqId === faq.id;

              return (
                <div
                  key={faq.id}
                  className="overflow-hidden rounded-lg border border-border-subtle bg-surface transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                    className="flex w-full items-center justify-between gap-3 p-3.5 text-left hover:bg-surface-hover/50"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-text-primary">
                        {faq.q}
                      </span>

                      <span className="mt-1 block font-mono text-[9px] uppercase tracking-wide text-text-disabled">
                        {faq.category}
                      </span>
                    </div>

                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="border-t border-border-subtle/50 px-3.5 pb-3.5 pt-3 text-xs leading-relaxed text-muted">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Useful Information */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-success" />

            <h4 className="text-xs font-semibold text-text-primary">
              Review Findings
            </h4>
          </div>

          <p className="text-[11px] leading-relaxed text-muted">
            Completed reviews can contain findings grouped by severity,
            including critical, high, medium, low, and informational issues.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />

            <h4 className="text-xs font-semibold text-text-primary">
              Notifications
            </h4>
          </div>

          <p className="text-[11px] leading-relaxed text-muted">
            Review completion, permanent failures, and important security
            findings can appear in the Notification Center.
          </p>
        </Card>
      </div>

      {/* Troubleshooting */}
      <Card className="flex flex-col items-start justify-between gap-4 border-border-subtle p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-warning" />

            <h4 className="text-xs font-semibold text-text-primary">
              Review failed?
            </h4>
          </div>

          <p className="mt-1 text-[11px] text-muted">
            Check common causes such as provider errors, quota limits, and retry
            behavior.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="secondary"
          icon={RefreshCw}
          onClick={handleTroubleshooting}
        >
          View Troubleshooting
        </Button>
      </Card>
    </div>
  );
};

export default HelpPage;
