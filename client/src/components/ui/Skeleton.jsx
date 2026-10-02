export const Skeleton = ({ className = "" }) => {
  return (
    <div className={`animate-pulse bg-surface-hover rounded-md ${className}`} />
  );
};
