import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  style = {},
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 600,
    fontFamily: 'inherit',
    border: '1px solid transparent',
    borderRadius: '8px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 180ms cubic-bezier(0.4, 0, 0.2, 1)',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    opacity: disabled || loading ? 0.65 : 1,
    outline: 'none',
  };

  const sizeStyles = {
    sm: {
      padding: '6px 12px',
      fontSize: '13px',
      lineHeight: '18px',
      borderRadius: '6px',
    },
    md: {
      padding: '9px 16px',
      fontSize: '14px',
      lineHeight: '20px',
      borderRadius: '8px',
    },
    lg: {
      padding: '12px 22px',
      fontSize: '15px',
      lineHeight: '22px',
      borderRadius: '10px',
    },
  };

  const variantStyles = {
    primary: {
      background: 'var(--color-primary, #1E6FD9)',
      color: '#FFFFFF',
      borderColor: 'var(--color-primary, #1E6FD9)',
      boxShadow: '0 1px 2px 0 rgba(30, 111, 217, 0.2)',
    },
    secondary: {
      background: '#FFFFFF',
      color: 'var(--text-primary, #1F2937)',
      borderColor: 'var(--border-color, #E2E8F0)',
      boxShadow: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--color-primary, #1E6FD9)',
      borderColor: 'var(--color-primary, #1E6FD9)',
    },
    danger: {
      background: 'var(--status-danger, #DC2626)',
      color: '#FFFFFF',
      borderColor: 'var(--status-danger, #DC2626)',
      boxShadow: '0 1px 2px 0 rgba(220, 38, 38, 0.2)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary, #4B5563)',
      borderColor: 'transparent',
    },
    success: {
      background: 'var(--status-success, #16A34A)',
      color: '#FFFFFF',
      borderColor: 'var(--status-success, #16A34A)',
      boxShadow: '0 1px 2px 0 rgba(22, 163, 74, 0.2)',
    },
  };

  const [isHovered, setIsHovered] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);

  let dynamicStyle = {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  if (!disabled && !loading) {
    if (isActive) {
      if (variant === 'primary') dynamicStyle.background = 'var(--color-primary-active, #134488)';
      if (variant === 'secondary') dynamicStyle.background = 'var(--bg-muted, #F8FAFC)';
      if (variant === 'danger') dynamicStyle.background = '#B91C1C';
    } else if (isHovered) {
      if (variant === 'primary') dynamicStyle.background = 'var(--color-primary-hover, #1857AD)';
      if (variant === 'secondary') {
        dynamicStyle.background = 'var(--bg-muted, #F8FAFC)';
        dynamicStyle.borderColor = '#CBD5E1';
      }
      if (variant === 'outline') dynamicStyle.background = 'var(--color-primary-light, #E8F1FD)';
      if (variant === 'danger') dynamicStyle.background = '#B91C1C';
      if (variant === 'ghost') dynamicStyle.background = 'var(--bg-muted, #F8FAFC)';
    }
  }

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      style={dynamicStyle}
      className={`btn-custom ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      {...props}
    >
      {loading && <Loader2 size={iconSize} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />}
      {!loading && Icon && iconPosition === 'left' && <Icon size={iconSize} aria-hidden="true" />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon size={iconSize} aria-hidden="true" />}
    </button>
  );
}
