export default function SousHeader({ config, activeTab, onTabChange, onAction }) {
    return (
        <div className="flex items-end justify-between"
             style={{ borderBottom: "1px solid var(--border)" }}>

            <div className="flex">
                {config.links.map((item, index) => {
                    const isActive = activeTab === item.key;
                    return (
                        <button
                            key={index}
                            onClick={() => onTabChange(item.key)}
                            className="text-sm mr-5 py-2.5 -mb-px bg-transparent cursor-pointer transition-colors duration-200 whitespace-nowrap border-b-2"
                            style={{
                                borderColor: isActive ? "var(--brand-terre)" : "transparent",
                                color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                                fontWeight: isActive ? "500" : "400",
                            }}
                        >
                            {item.name}
                        </button>
                    );
                })}
            </div>

            {config.actions?.length > 0 && (
                <div className="flex items-center gap-2 pb-2">
                    {config.actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => onAction?.(action.id)}
                            className="text-sm font-medium cursor-pointer transition-all duration-200"
                            style={
                                action.variant === "primary"
                                    ? {
                                        backgroundColor: "var(--cta-bg)",
                                        color: "var(--cta-text)",
                                        padding: "7px 18px",
                                        borderRadius: "var(--radius-sm)",
                                        boxShadow: "var(--cta-shadow)",
                                        border: "none",
                                      }
                                    : {
                                        backgroundColor: "var(--cta-secondary-bg)",
                                        color: "var(--cta-secondary-text)",
                                        padding: "7px 14px",
                                        borderRadius: "var(--radius-sm)",
                                        border: "1px solid var(--border-strong)",
                                      }
                            }
                            onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor =
                                    action.variant === "primary"
                                        ? "var(--cta-bg-hover)"
                                        : "var(--cta-secondary-bg-hover)"
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor =
                                    action.variant === "primary"
                                        ? "var(--cta-bg)"
                                        : "var(--cta-secondary-bg)"
                            }}
                        >
                            {action.name}
                        </button>
                    ))}
                </div>
            )}

        </div>
    );
}