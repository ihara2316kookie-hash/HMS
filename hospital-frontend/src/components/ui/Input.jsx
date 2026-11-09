import React, { forwardRef, useState } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    required = false,
    icon: Icon,
    rightElement,
    className = '',
    style = {},
    containerStyle = {},
    id,
    disabled = false,
    type = 'text',
    ...props
  },
  ref
) {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', ...containerStyle }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-primary, #1F2937)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--status-danger, #DC2626)' }} aria-hidden="true">*</span>}
        </label>
      )}

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              color: error ? 'var(--status-danger, #DC2626)' : isFocused ? 'var(--color-primary, #1E6FD9)' : 'var(--text-muted, #9CA3AF)',
              transition: 'color 180ms ease',
            }}
          >
            <Icon size={18} />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          style={{
            width: '100%',
            height: '42px',
            paddingLeft: Icon ? '40px' : '14px',
            paddingRight: rightElement ? '42px' : '14px',
            paddingTop: '8px',
            paddingBottom: '8px',
            fontSize: '14px',
            lineHeight: '20px',
            fontFamily: 'inherit',
            color: 'var(--text-primary, #1F2937)',
            backgroundColor: disabled ? 'var(--bg-muted, #F8FAFC)' : '#FFFFFF',
            border: `1px solid ${error ? 'var(--status-danger, #DC2626)' : isFocused ? 'var(--color-primary, #1E6FD9)' : 'var(--border-color, #E2E8F0)'}`,
            borderRadius: '8px',
            boxShadow: isFocused
              ? error
                ? '0 0 0 3px rgba(220, 38, 38, 0.2)'
                : '0 0 0 3px rgba(30, 111, 217, 0.2)'
              : '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
            outline: 'none',
            transition: 'border-color 180ms ease, box-shadow 180ms ease',
            cursor: disabled ? 'not-allowed' : 'text',
            ...style,
          }}
          className={className}
          {...props}
        />

        {rightElement && (
          <div
            style={{
              position: 'absolute',
              right: '10px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <span
          id={`${inputId}-error`}
          role="alert"
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--status-danger, #DC2626)',
            marginTop: '2px',
          }}
        >
          {error}
        </span>
      ) : helperText ? (
        <span
          id={`${inputId}-helper`}
          style={{
            fontSize: '12px',
            color: 'var(--text-muted, #6B7280)',
            marginTop: '2px',
          }}
        >
          {helperText}
        </span>
      ) : null}
    </div>
  );
});

export default Input;
