const PageLoader = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center">
        {/* Loader */}
        <div className="relative flex items-center justify-center h-14 w-14">
          {/* Glow */}
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" />

          {/* Track */}
          <div className="absolute inset-0 rounded-full border-2 border-border" />

          {/* Spinner */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary animate-spin" />

          {/* Center */}
          <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-brand" />
        </div>

        {/* Message */}
        <p className="mt-5 text-sm font-medium text-text-primary">{message}</p>

        {/* Supporting text */}
        <p className="mt-1 text-xs text-muted">Please wait a moment...</p>
      </div>
    </div>
  );
};

export default PageLoader;
