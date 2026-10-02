import { useContext, useEffect, useRef, useState } from "react";

import {
  Camera,
  CheckCircle2,
  Loader2,
  Lock,
  Palette,
  Shield,
  Trash2,
  User,
  X,
  XCircle,
  Pencil,
} from "lucide-react";

import { AuthContext } from "../../context/AuthContext";

import { useAvatar } from "../../hooks/useAvatar";

import { useSettingsProfile } from "../../hooks/useSettingsProfile";
import { useUsernameAvailability } from "../../hooks/useUsernameAvailability";
import { useChangePassword } from "../../hooks/useChangePassword";
import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Avatar } from "../../components/ui/Avatar";
import { Tabs } from "../../components/ui/Tabs";
import AppearancePage from "../AppearancePage";
import PageMeta from "../../components/PageMeta";

const SettingsPage = () => {
  const { updateUser } = useContext(AuthContext);

  const avatarInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("profile");

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [fullname, setFullname] = useState("");

  const [username, setUsername] = useState("");

  const [experienceLevel, setExperienceLevel] = useState("");

  const {
    user,
    preferences,
    isLoading: isProfileLoading,
    isSaving: isProfileSaving,
    error: profileError,
    success: profileSuccess,
    saveProfile,
    clearMessages,
  } = useSettingsProfile();

  const {
    selectedFile,
    displayAvatar,

    isUploading: isUploadingAvatar,
    isRemoving: isRemovingAvatar,

    error: avatarError,
    success: avatarSuccess,

    selectAvatar,
    uploadAvatar,
    removeAvatar,
    cancelSelection,
    clearMessages: clearAvatarMessages,
  } = useAvatar({
    currentAvatar: user?.avatar,

    onUserUpdated: (updatedUser) => {
      updateUser?.(updatedUser);
    },
  });

  const email = user?.email ?? "";

  const {
    status: usernameStatus,
    message: usernameMessage,
    isChecking: isCheckingUsername,
    canUseUsername,
  } = useUsernameAvailability({
    username,
    currentUsername: user?.username,
  });

  const {
    isChanging: isChangingPassword,
    error: passwordError,
    success: passwordSuccess,
    changePassword,
    clearMessages: clearPasswordMessages,
  } = useChangePassword();

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Palette,
    },
  ];

  const handleAvatarFileChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      selectAvatar(file);
    }

    /*
     * Reset input so same file
     * can be selected again.
     */
    event.target.value = "";
  };

  const handleAvatarUpload = async () => {
    try {
      await uploadAvatar();
    } catch {
      // Hook handles error.
    }
  };

  const handleAvatarRemove = async () => {
    try {
      await removeAvatar();
    } catch {
      // Hook handles error.
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();

    clearPasswordMessages();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return;
    }

    if (newPassword !== confirmPassword) {
      return;
    }

    if (newPassword.length < 8) {
      return;
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      // Error handled by hook.
    }
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();

    clearMessages();

    if (!fullname.trim()) {
      return;
    }

    if (!canUseUsername) {
      return;
    }

    try {
      const updated = await saveProfile({
        fullname: fullname.trim(),

        username: username.trim().toLowerCase(),

        experienceLevel,
      });

      if (updated?.user) {
        setFullname(updated.user.fullname ?? "");

        setUsername(updated.user.username ?? "");
      }

      if (updated?.preferences) {
        setExperienceLevel(updated.preferences.experienceLevel ?? "");
      }
    } catch {
      // Hook already handles error.
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    setFullname(user.fullname ?? "");
    setUsername(user.username ?? "");

    setExperienceLevel(preferences?.experienceLevel ?? "");
  }, [user, preferences]);

  return (
    <>
      <PageMeta
        title="Settings — GenioCore"
        description="Update your profile, appearance, account security, and other GenioCore settings."
      />
      <div className="space-y-6 max-w-full">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
          <div>
            <h2 className="text-lg font-bold text-text-primary tracking-tight">
              Platform Settings
            </h2>
            <p className="text-xs text-muted">
              Manage your profile, account security, and interface preferences.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="max-w-4xl"
        />

        {/* TAB: PROFILE */}
        {activeTab === "profile" && (
          <>
            {isProfileLoading ? (
              <Card className="py-12 text-center max-w-4xl">
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted" />

                <p className="mt-2 text-xs text-muted">Loading profile...</p>
              </Card>
            ) : (
              <form
                onSubmit={handleProfileSave}
                className="space-y-4 max-w-4xl"
              >
                {profileError && (
                  <Card className="border-error/20 bg-error/5">
                    <div className="flex items-start gap-2">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-error" />

                      <p className="text-xs text-error">{profileError}</p>
                    </div>
                  </Card>
                )}

                {profileSuccess && (
                  <Card className="border-success/20 bg-success/5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />

                      <p className="text-xs text-success">{profileSuccess}</p>
                    </div>
                  </Card>
                )}

                <Card className="space-y-6">
                  <CardHeader
                    title="Public Identity"
                    subtitle="Manage the profile information associated with your account"
                  />

                  {/* Profile Avatar */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <Avatar
                          name={fullname}
                          email={email}
                          size="lg"
                          src={displayAvatar}
                        />

                        {/* Edit avatar */}
                        <button
                          type="button"
                          onClick={() => {
                            clearAvatarMessages();
                            avatarInputRef.current?.click();
                          }}
                          disabled={isUploadingAvatar || isRemovingAvatar}
                          title="Change profile photo"
                          aria-label="Change profile photo"
                          className="cursor-pointer absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-md transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isUploadingAvatar ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Pencil className="h-3.5 w-3.5" />
                          )}
                        </button>

                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handleAvatarFileChange}
                        />
                      </div>

                      <div className="min-w-0">
                        <h4 className="truncate text-xs font-semibold text-text-primary">
                          {fullname || username || email}
                        </h4>

                        <p className="mt-0.5 truncate text-[11px] text-muted">
                          {username ? `@${username}` : email}
                        </p>

                        <p className="mt-1 text-[10px] text-text-disabled">
                          JPG, PNG or WEBP • Max 10 MB
                        </p>

                        {!selectedFile && user?.avatar && (
                          <button
                            type="button"
                            onClick={handleAvatarRemove}
                            disabled={isUploadingAvatar || isRemovingAvatar}
                            className="cursor-pointer mt-2 inline-flex items-center gap-1.5 text-[10px] font-medium text-muted transition-colors hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isRemovingAvatar ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}

                            {isRemovingAvatar ? "Removing..." : "Remove photo"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Selected image */}
                    {selectedFile && (
                      <div className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-text-primary">
                            {selectedFile.name}
                          </p>

                          <p className="mt-0.5 text-[10px] text-muted">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            icon={X}
                            disabled={isUploadingAvatar}
                            onClick={cancelSelection}
                          >
                            Cancel
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            variant="primary"
                            disabled={isUploadingAvatar}
                            onClick={handleAvatarUpload}
                          >
                            {isUploadingAvatar ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Uploading...
                              </span>
                            ) : (
                              "Save Photo"
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {avatarError && (
                      <div className="flex items-start gap-2 rounded-lg border border-error/20 bg-error/5 p-3">
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-error" />

                        <p className="text-[11px] text-error">{avatarError}</p>
                      </div>
                    )}

                    {avatarSuccess && (
                      <div className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 p-3">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />

                        <p className="text-[11px] text-success">
                          {avatarSuccess}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Name + Username */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      label="Full Name"
                      value={fullname}
                      onChange={(event) => {
                        clearMessages();

                        setFullname(event.target.value);
                      }}
                    />

                    <div className="space-y-1.5">
                      <Input
                        label="Username / Handle"
                        value={username}
                        onChange={(event) => {
                          clearMessages();

                          setUsername(event.target.value.toLowerCase());
                        }}
                        autoComplete="off"
                      />

                      {usernameMessage && (
                        <div
                          className={`flex items-center gap-1.5 text-[11px] ${
                            usernameStatus === "AVAILABLE"
                              ? "text-success"
                              : usernameStatus === "TAKEN" ||
                                  usernameStatus === "INVALID" ||
                                  usernameStatus === "ERROR"
                                ? "text-error"
                                : "text-muted"
                          }`}
                        >
                          {usernameStatus === "CHECKING" && (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          )}

                          {usernameStatus === "AVAILABLE" && (
                            <CheckCircle2 className="h-3 w-3" />
                          )}

                          {(usernameStatus === "TAKEN" ||
                            usernameStatus === "INVALID" ||
                            usernameStatus === "ERROR") && (
                            <XCircle className="h-3 w-3" />
                          )}

                          <span>{usernameMessage}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email + Experience */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      label="Email Address"
                      value={email}
                      disabled
                      helperText="Email address cannot be changed from profile settings."
                    />

                    <div className="space-y-1.5 text-left">
                      <label className="block text-xs font-medium text-text-primary">
                        Experience Level
                      </label>

                      <select
                        value={experienceLevel}
                        onChange={(event) => {
                          clearMessages();

                          setExperienceLevel(event.target.value);
                        }}
                        className="h-9 w-full rounded-lg border border-border-subtle bg-surface px-3 text-xs text-text-primary focus:border-primary focus:outline-none"
                      >
                        <option value="">Select experience level</option>

                        <option value="BEGINNER">Beginner</option>

                        <option value="INTERMEDIATE">Intermediate</option>

                        <option value="ADVANCED">Advanced</option>

                        <option value="PROFESSIONAL">Professional</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end border-t border-border-subtle pt-3">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={
                        isProfileSaving ||
                        isCheckingUsername ||
                        !fullname.trim() ||
                        !experienceLevel ||
                        !canUseUsername
                      }
                    >
                      {isProfileSaving ? "Saving..." : "Save Profile Details"}
                    </Button>
                  </div>
                </Card>
              </form>
            )}
          </>
        )}

        {/* TAB: PROFILE */}
        {activeTab === "appearance" && <AppearancePage />}

        {/* TAB: SECURITY */}
        {activeTab === "security" && (
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-4xl">
            {passwordError && (
              <Card className="border-error/20 bg-error/5">
                <div className="flex items-start gap-2">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-error" />

                  <p className="text-xs text-error">{passwordError}</p>
                </div>
              </Card>
            )}

            {passwordSuccess && (
              <Card className="border-success/20 bg-success/5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />

                  <p className="text-xs text-success">{passwordSuccess}</p>
                </div>
              </Card>
            )}

            <Card className="space-y-4">
              <CardHeader
                title="Change Password"
                subtitle="Verify your current password before setting a new one"
              />

              <div className="max-w-md space-y-3">
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => {
                    clearPasswordMessages();

                    setCurrentPassword(event.target.value);
                  }}
                  placeholder="***************"
                  autoComplete="current-password"
                />

                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => {
                    clearPasswordMessages();

                    setNewPassword(event.target.value);
                  }}
                  placeholder="***************"
                  autoComplete="new-password"
                  helperText="Password must contain at least 8 characters."
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => {
                    clearPasswordMessages();

                    setConfirmPassword(event.target.value);
                  }}
                  placeholder="***************"
                  autoComplete="new-password"
                />

                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[11px] text-error">
                    Passwords do not match.
                  </p>
                )}
              </div>

              <div className="flex justify-start border-t border-border-subtle pt-3">
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  icon={Lock}
                  disabled={
                    isChangingPassword ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword ||
                    newPassword.length < 8 ||
                    newPassword !== confirmPassword
                  }
                >
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </Card>
          </form>
        )}
      </div>
    </>
  );
};

export default SettingsPage;
