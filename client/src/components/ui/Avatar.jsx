export const Avatar = ({
  name = "",
  email = "",
  size = "md",
  src = null,
  className = "",
}) => {
  const getInitials = () => {
    if (name) {
      const parts = name.trim().split(" ");
      return parts.length > 1
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : name.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return "NA";
  };

  const sizeClasses = {
    sm: "w-7 h-7 text-[11px]",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm font-medium",
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name || "Avatar"}
        className={`rounded-full object-cover border border-border-subtle ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-surface border border-border-subtle text-text-primary font-semibold flex items-center justify-center tracking-wider select-none shrink-0 ${sizeClasses[size]} ${className}`}
    >
      {getInitials()}
    </div>
  );
};
