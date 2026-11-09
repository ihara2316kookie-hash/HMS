import React from 'react';

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  style = {},
  ...props
}) {
  const variantStyles = {
    primary: {
      background: 'var(--color-primary-light, #E8F1FD)',
      color: 'var(--color-primary, #1E6FD9)',
      borderColor: 'var(--color-primary-tint, #D0E3FB)',
      dotColor: 'var(--color-primary, #1E6FD9)',
    },
    success: {
      background: 'var(--status-success-bg, #DCFCE7)',
      color: 'var(--status-success-text, #15803D)',
      borderColor: 'var(--status-success-border, #BBF7D0)',
      dotColor: 'var(--status-success, #16A34A)',
    },
    warning: {
      background: 'var(--status-warning-bg, #FEF3C7)',
      color: 'var(--status-warning-text, #B45309)',
      borderColor: 'var(--status-warning-border, #FDE68A)',
      dotColor: 'var(--status-warning, #D97706)',
    },
    danger: {
      background: 'var(--status-danger-bg, #FEE2E2)',
      color: 'var(--status-danger-text, #B91C1C)',
      borderColor: 'var(--status-danger-border, #FECACA)',
      dotColor: 'var(--status-danger, #DC2626)',
    },
    info: {
      background: 'var(--status-info-bg, #E0F2FE)',
      color: 'var(--status-info-text, #0369A1)',
      borderColor: 'var(--status-info-border, #BAE6FD)',
      dotColor: 'var(--status-info, #0284C7)',
    },
    neutral: {
      background: 'var(--bg-muted, #F8FAFC)',
      color: 'var(--text-secondary, #4B5563)',
      borderColor: 'var(--border-color, #E2E8F0)',
      dotColor: 'var(--text-muted, #6B7280)',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.neutral;

  const sizeStyles = {
    sm: {
      padding: '2px 8px',
      fontSize: '11px',
      lineHeight: '16px',
      borderRadius: '9999px',
    },
    md: {
      padding: '4px 10px',
      fontSize: '12px',
      lineHeight: '18px',
      borderRadius: '9999px',
    },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: 600,
        fontFamily: 'inherit',
        border: `1px solid ${currentVariant.borderColor}`,
        backgroundColor: currentVariant.background,
        color: currentVariant.color,
        letterSpacing: '0.01em',
        ...sizeStyles[size],
        ...style,
      }}
      className={`badge-pill ${className}`}
      {...props}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: currentVariant.dotColor,
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
