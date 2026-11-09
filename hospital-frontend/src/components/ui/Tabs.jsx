import React from 'react';

export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'underline',
  style = {},
}) {
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: variant === 'pills' ? '6px' : '20px',
        borderBottom: variant === 'underline' ? '1px solid var(--border-color, #E2E8F0)' : 'none',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: variant === 'underline' ? '0' : '4px',
        ...style,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        if (variant === 'pills') {
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => onChange(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: isActive ? 'var(--color-primary, #1E6FD9)' : 'var(--border-color, #E2E8F0)',
                backgroundColor: isActive ? 'var(--color-primary, #1E6FD9)' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary, #4B5563)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                whiteSpace: 'nowrap',
              }}
            >
              {Icon && <Icon size={16} />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  style={{
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-muted, #F8FAFC)',
                    color: isActive ? '#FFFFFF' : 'var(--text-muted, #6B7280)',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 4px',
              fontSize: '14px',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--color-primary, #1E6FD9)' : 'var(--text-secondary, #6B7280)',
              background: 'transparent',
              border: 'none',
              borderBottom: '2px solid',
              borderColor: isActive ? 'var(--color-primary, #1E6FD9)' : 'transparent',
              cursor: 'pointer',
              marginBottom: '-1px',
              transition: 'all 150ms ease',
              whiteSpace: 'nowrap',
            }}
          >
            {Icon && <Icon size={16} />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  backgroundColor: isActive ? 'var(--color-primary-light, #E8F1FD)' : 'var(--bg-muted, #F8FAFC)',
                  color: isActive ? 'var(--color-primary, #1E6FD9)' : 'var(--text-muted, #6B7280)',
                  fontWeight: 600,
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
