import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({
  type = 'info',
  message,
  children,
  onClose,
  duration = 5000,
  style = {},
}) {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      bg: 'var(--status-success-bg, #DCFCE7)',
      border: 'var(--status-success-border, #BBF7D0)',
      color: 'var(--status-success-text, #15803D)',
      iconColor: 'var(--status-success, #16A34A)',
    },
    error: {
      icon: AlertCircle,
      bg: 'var(--status-danger-bg, #FEE2E2)',
      border: 'var(--status-danger-border, #FECACA)',
      color: 'var(--status-danger-text, #B91C1C)',
      iconColor: 'var(--status-danger, #DC2626)',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'var(--status-warning-bg, #FEF3C7)',
      border: 'var(--status-warning-border, #FDE68A)',
      color: 'var(--status-warning-text, #B45309)',
      iconColor: 'var(--status-warning, #D97706)',
    },
    info: {
      icon: Info,
      bg: 'var(--status-info-bg, #E0F2FE)',
      border: 'var(--status-info-border, #BAE6FD)',
      color: 'var(--status-info-text, #0369A1)',
      iconColor: 'var(--status-info, #0284C7)',
    },
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '10px',
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
        fontSize: '14px',
        fontWeight: 500,
        boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.08)',
        animation: 'slideDown 200ms ease-out',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
        <Icon size={18} style={{ color: config.iconColor, flexShrink: 0 }} />
        <span>{message || children}</span>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: config.color,
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            opacity: 0.8,
            transition: 'opacity 150ms ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
