import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-lg",
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-xs animate-fade-in"
        onClick={() => onClose?.()}
      />

      {/* Viewport-safe positioning */}
      <div className="absolute inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center px-4 py-8 sm:py-10">
          {/* Dialog */}
          <div
            className={`
              relative
              z-10
              flex
              w-full
              ${maxWidth}
              max-h-[calc(100dvh-5rem)]
              flex-col
              overflow-hidden
              rounded-xl
              border
              border-border-subtle
              bg-card
              shadow-xl
              animate-scale-in
            `}
          >
            {/* Fixed Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border-subtle px-5 py-4">
              <div className="min-w-0 pr-4">
                <h3 className="text-sm font-semibold text-text-primary">
                  {title}
                </h3>

                {subtitle && (
                  <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onClose?.()}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
