import React, { useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { KeyRound, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button, Input, Badge, Toast } from '../components/ui';

export default function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (!strongPasswordRegex.test(form.newPassword)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, number, and symbol');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess('Your password has been changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Account Security &amp; Credentials</h1>
          <p style={styles.subtitle}>Update your hospital portal password to maintain HIPAA &amp; access compliance</p>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.iconWrap}>
              <KeyRound size={22} color="#1E6FD9" />
            </div>
            <div>
              <h2 style={styles.cardTitle}>Change Account Password</h2>
              <p style={styles.cardSubtitle}>Ensure your new password complies with the hospital security policy</p>
            </div>
          </div>

          {error && <Toast type="error" message={error} onClose={() => setError('')} style={{ marginBottom: '16px' }} />}
          {success && <Toast type="success" message={success} onClose={() => setSuccess('')} style={{ marginBottom: '16px' }} />}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Current Password *"
              type={show.current ? 'text' : 'password'}
              required
              placeholder="Enter existing password"
              value={form.currentPassword}
              icon={Lock}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShow({ ...show, current: !show.current })}
                  aria-label={show.current ? 'Hide current password' : 'Show current password'}
                  style={styles.eyeBtn}
                >
                  {show.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <Input
              label="New Password *"
              type={show.next ? 'text' : 'password'}
              required
              placeholder="Enter new strong password"
              value={form.newPassword}
              icon={Lock}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShow({ ...show, next: !show.next })}
                  aria-label={show.next ? 'Hide new password' : 'Show new password'}
                  style={styles.eyeBtn}
                >
                  {show.next ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <Input
              label="Confirm New Password *"
              type={show.confirm ? 'text' : 'password'}
              required
              placeholder="Re-enter new password"
              value={form.confirmPassword}
              icon={Lock}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShow({ ...show, confirm: !show.confirm })}
                  aria-label={show.confirm ? 'Hide confirm password' : 'Show confirm password'}
                  style={styles.eyeBtn}
                >
                  {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            {/* Password Policy Box */}
            <div style={styles.policyBox}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12px', color: '#0B2A4A', marginBottom: '6px' }}>
                <ShieldCheck size={14} color="#1E6FD9" />
                <span>Password Complexity Policy</span>
              </div>
              <ul style={styles.policyList}>
                <li>Minimum 8 characters</li>
                <li>At least one uppercase letter (A-Z) and lowercase letter (a-z)</li>
                <li>At least one number (0-9)</li>
                <li>At least one symbol (@$!%*?&amp;#)</li>
              </ul>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              style={{ width: '100%', marginTop: '6px' }}
            >
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  headerRow: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 800,
    color: 'var(--color-navy, #0B2A4A)',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-muted, #6B7280)',
    margin: 0,
  },
  container: {
    maxWidth: '540px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    border: '1px solid var(--border-color, #E2E8F0)',
    boxShadow: 'var(--shadow-sm)',
    padding: '28px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '22px',
  },
  iconWrap: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    backgroundColor: '#E8F1FD',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--color-navy, #0B2A4A)',
    margin: '0 0 2px 0',
  },
  cardSubtitle: {
    fontSize: '12px',
    color: '#6B7280',
    margin: 0,
  },
  eyeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#9CA3AF',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
  },
  policyBox: {
    backgroundColor: 'var(--bg-muted, #F8FAFC)',
    border: '1px solid var(--border-color, #E2E8F0)',
    borderRadius: '8px',
    padding: '12px 14px',
  },
  policyList: {
    margin: 0,
    paddingLeft: '18px',
    fontSize: '12px',
    color: '#4B5563',
    lineHeight: 1.6,
  },
};