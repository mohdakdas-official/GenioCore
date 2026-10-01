import React from "react";
import {
  AlertOctagon,
  LogOut,
  Archive,
  RefreshCw,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { Modal } from "./Model";
import { Button } from "./Button";

const THEME_ACCENTS = {
  danger: {
    icon: ShieldAlert,
    colorToken: "text-error",
    bgBadge: "bg-error/15 border-error/30 text-error",
    glowBeam: "from-error/40 via-error/10 to-transparent",
    confirmBtnVariant: "danger",
    pulse: "bg-error",
  },
  warning: {
    icon: AlertOctagon,
    colorToken: "text-warning",
    bgBadge: "bg-warning/15 border-warning/30 text-warning",
    glowBeam: "from-warning/40 via-warning/10 to-transparent",
    confirmBtnVariant: "primary",
    pulse: "bg-warning",
  },
  archive: {
    icon: Archive,
    colorToken: "text-warning",
    bgBadge: "bg-warning/15 border-warning/30 text-warning",
    glowBeam: "from-warning/40 via-warning/10 to-transparent",
    confirmBtnVariant: "danger",
    pulse: "bg-warning",
  },
  restore: {
    icon: RefreshCw,
    colorToken: "text-success",
    bgBadge: "bg-success/15 border-success/30 text-success",
    glowBeam: "from-success/40 via-success/10 to-transparent",
    confirmBtnVariant: "primary",
    pulse: "bg-success",
  },
  logout: {
    icon: LogOut,
    colorToken: "text-error",
    bgBadge: "bg-error/15 border-error/30 text-error",
    glowBeam: "from-error/40 via-error/10 to-transparent",
    confirmBtnVariant: "danger",
    pulse: "bg-error",
  },
};

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  icon,
  isLoading = false,
  disableConfirm = false,
}) => {
  const currentAccent = THEME_ACCENTS[variant] || THEME_ACCENTS.danger;
  const ActiveIcon = icon || currentAccent.icon;

  const handleConfirm = async () => {
    if (isLoading || disableConfirm) return;
    await onConfirm?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? undefined : onClose}
      title={null}
      maxWidth="max-w-[420px]"
    >
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border text-center shadow-2xl">
        {/* Dynamic Top Glow Light Beam */}
        <div
          className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${currentAccent.glowBeam}`}
        />

        {/* Ambient Radial Spotlight */}
        <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-36 w-48 rounded-full bg-surface-hover opacity-80 blur-2xl" />

        <div className="relative px-6 pt-7 pb-6">
          {/* Centered Futuristic Badge */}
          <div className="relative mx-auto flex h-14 w-14 items-center justify-center">
            {/* Concentric outer ring */}
            <span
              className={`absolute inset-0 rounded-2xl border ${currentAccent.bgBadge} opacity-40 scale-110`}
            />
            {/* Main Icon Vessel */}
            <div
              className={`relative flex h-12 w-12 items-center justify-center rounded-xl border backdrop-blur-md ${currentAccent.bgBadge}`}
            >
              <ActiveIcon className="h-5 w-5 stroke-[2.2]" />
            </div>
          </div>

          {/* Typography */}
          <div className="mt-5 space-y-2">
            <h3 className="text-lg font-semibold tracking-tight text-text-primary">
              {title}
            </h3>

            {description && (
              <div className="rounded-xl bg-surface/70 border border-border-subtle p-3 mt-3 text-left">
                <p className="text-xs leading-relaxed text-muted font-normal">
                  {description}
                </p>
              </div>
            )}
          </div>

          {/* Modern Action Deck */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              disabled={isLoading}
              onClick={onClose}
              className="w-full justify-center rounded-xl border border-border-subtle bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary text-xs font-medium py-2.5 transition-colors"
            >
              {cancelText}
            </Button>

            <Button
              type="button"
              variant={currentAccent.confirmBtnVariant}
              disabled={isLoading || disableConfirm}
              onClick={handleConfirm}
              className="w-full justify-center rounded-xl text-xs font-semibold py-2.5 shadow-sm transition-transform active:scale-[0.97]"
            >
              {isLoading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-current" />
                  <span>Working...</span>
                </span>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
