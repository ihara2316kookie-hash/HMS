import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  loading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="460px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: confirmVariant === 'danger' ? 'var(--status-danger-bg, #FEE2E2)' : 'var(--status-warning-bg, #FEF3C7)',
            color: confirmVariant === 'danger' ? 'var(--status-danger, #DC2626)' : 'var(--status-warning, #D97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={22} />
        </div>

        <div>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--color-navy, #0B2A4A)',
              margin: '0 0 6px 0',
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary, #4B5563)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
}
