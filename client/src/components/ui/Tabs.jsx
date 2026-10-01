export const Tabs = ({ tabs = [], activeTab, onChange, className }) => {
  return (
    <div
      className={`flex items-center gap-1 border-b border-border-subtle overflow-x-auto scrollbar-none ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all duration-150 whitespace-nowrap cursor-pointer -mb-px ${
              isActive
                ? "border-primary text-text-primary font-semibold"
                : "border-transparent text-muted hover:text-text-secondary hover:border-border-hover"
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={`ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "bg-surface text-muted border border-border-subtle"
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
