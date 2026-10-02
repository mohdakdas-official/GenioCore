import { useEffect, useRef, useState } from "react";

import { Loader2, Pencil, Trash2, User } from "lucide-react";

const MAX_AVATAR_SIZE = 10 * 1024 * 1024;

const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const OnboardingStepProfile = ({ formData, updateFormData, error }) => {
  const fileInputRef = useRef(null);

  const [avatarPreview, setAvatarPreview] = useState("");

  const [avatarError, setAvatarError] = useState("");

  /*
   * Generate preview from
   * selected File object.
   */
  useEffect(() => {
    if (!formData.avatarFile) {
      setAvatarPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(formData.avatarFile);

    setAvatarPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [formData.avatarFile]);

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    /*
     * Allows selecting the
     * same file again later.
     */
    event.target.value = "";

    setAvatarError("");

    if (!file) {
      return;
    }

    if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
      setAvatarError("Please select a JPG, PNG, or WEBP image.");

      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError("Profile photo must be smaller than 10 MB.");

      return;
    }

    updateFormData("avatarFile", file);
  };

  const removeAvatar = () => {
    setAvatarError("");

    updateFormData("avatarFile", null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
          Let's set up your profile
        </h2>

        <p className="text-sm text-text-secondary">
          Choose your username and optionally add a profile photo.
        </p>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-border bg-surface shadow-md">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile preview"
                className="h-full w-full object-cover"
                draggable="false"
              />
            ) : (
              <User className="h-9 w-9 text-muted" />
            )}
          </div>

          {/* Pencil */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title={avatarPreview ? "Change profile photo" : "Add profile photo"}
            aria-label={
              avatarPreview ? "Change profile photo" : "Add profile photo"
            }
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-md transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        <p className="mt-3 text-[11px] text-muted">
          JPG, PNG or WEBP • Max 10 MB
        </p>

        {formData.avatarFile && (
          <button
            type="button"
            onClick={removeAvatar}
            className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-muted transition-colors hover:text-error"
          >
            <Trash2 className="h-3 w-3" />
            Remove photo
          </button>
        )}

        {avatarError && (
          <p className="mt-2 text-center text-xs text-error" role="alert">
            {avatarError}
          </p>
        )}
      </div>

      {/* Username */}
      <div className="space-y-2">
        <label
          htmlFor="username"
          className="block text-xs font-medium text-text-secondary"
        >
          Username <span className="text-error">*</span>
        </label>

        <input
          id="username"
          type="text"
          value={formData.username}
          onChange={(event) =>
            updateFormData(
              "username",
              event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
            )
          }
          placeholder="e.g. akdas_dev"
          autoFocus
          autoComplete="username"
          maxLength={30}
          spellCheck={false}
          className={[
            "w-full",
            "px-3.5 py-2.5",
            "text-sm",
            "text-text-primary",
            "bg-surface",
            "border",
            "rounded-lg",
            "placeholder:text-muted",
            "transition-all duration-200",
            "focus:outline-none",
            "focus:ring-2",
            error
              ? "border-error focus:border-error focus:ring-error/20"
              : "border-border focus:border-primary focus:ring-primary/20",
          ].join(" ")}
        />

        <div className="flex items-center justify-between gap-3">
          <span className={`text-xs ${error ? "text-error" : "text-muted"}`}>
            {error || "5–30 characters. Letters, numbers and underscores only."}
          </span>

          <span className="shrink-0 text-[11px] text-muted">
            {formData.username.length}
            /30
          </span>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStepProfile;
