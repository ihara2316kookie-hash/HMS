import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Activity, Mail, Lock, Eye, EyeOff, ShieldCheck, HeartPulse,
  Clock, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Button, Input, Badge } from '../components/ui';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for development testing only
  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setFieldErrors({});
    setError('');
  };

  return (
    <div style={styles.page}>
      <div className="login-card-container" style={styles.cardContainer}>
        {/* Left Side: Brand Showcase Panel */}
        <div className="login-brand-panel" style={styles.brandPanel}>
          {/* Brand header */}
          <div style={styles.brandHeader}>
            <div style={styles.brandIconWrap}>
              <Activity size={22} color="#FFFFFF" />
            </div>
            <div>
              <span style={styles.brandName}>MediCare</span>
              <span style={styles.brandBadge}>HMS Enterprise</span>
            </div>
          </div>

          {/* Value proposition */}
          <div className="login-hero-content" style={styles.heroContent}>
            <Badge variant="primary" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.25)', marginBottom: '16px' }}>
              Trusted Healthcare Operations
            </Badge>
            <h1 style={styles.heroTitle}>
              Advanced Medical Operations & Clinical Care
            </h1>
            <p style={styles.heroText}>
              A unified platform for patient registration, doctor schedules, electronic records, laboratory diagnostics, and financial billing.
            </p>

            {/* Feature highlights */}
            <div style={styles.featureList}>
              <div style={styles.featureItem}>
                <div style={styles.featureIcon}>
                  <CheckCircle2 size={16} color="#93C5FD" />
                </div>
                <span>Role-Based Secure Clinical Workflows</span>
              </div>
              <div style={styles.featureItem}>
                <div style={styles.featureIcon}>
                  <ShieldCheck size={16} color="#93C5FD" />
                </div>
                <span>Integrated Pharmacy & Lab Management</span>
              </div>
              <div style={styles.featureItem}>
                <div style={styles.featureIcon}>
                  <HeartPulse size={16} color="#93C5FD" />
                </div>
                <span>Real-Time Inpatient & Bed Occupancy Tracking</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div style={styles.brandFooter}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={14} color="#93C5FD" />
              <span>24/7 Hospital System Service Support</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form Card */}
        <div className="login-form-panel" style={styles.formPanel}>
          <div style={styles.formContent}>
            <div style={styles.formHeader}>
              <h2 style={styles.title}>Welcome back</h2>
              <p style={styles.subtitle}>Please sign in to access your hospital portal</p>
            </div>

            {/* Error banner */}
            {error && (
              <div style={styles.alertError} role="alert">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate style={styles.form}>
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="doctor@hospital.com"
                value={email}
                icon={Mail}
                error={fieldErrors.email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                }}
                autoComplete="email"
                autoFocus
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                value={password}
                icon={Lock}
                error={fieldErrors.password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                }}
                autoComplete="current-password"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={styles.eyeBtn}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                style={{ width: '100%', marginTop: '6px' }}
              >
                Sign In to Account
              </Button>
            </form>

            {/* Development-only Quick Roles Fill (import.meta.env.DEV) */}
            {import.meta.env.DEV && (
              <div style={styles.devSection}>
                <div style={styles.devHeader}>
                  <span>DEVELOPMENT QUICK-FILL</span>
                  <Badge variant="neutral" size="sm">Dev Only</Badge>
                </div>
                <div style={styles.devButtonsGrid}>
                  <button
                    type="button"
                    style={styles.devRoleBtn}
                    onClick={() => handleDemoFill('admin@hospital.com', 'Admin@123')}
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    style={styles.devRoleBtn}
                    onClick={() => handleDemoFill('doctor@hospital.com', 'Doctor@123')}
                  >
                    Doctor
                  </button>
                  <button
                    type="button"
                    style={styles.devRoleBtn}
                    onClick={() => handleDemoFill('reception@hospital.com', 'Reception@123')}
                  >
                    Receptionist
                  </button>
                  <button
                    type="button"
                    style={styles.devRoleBtn}
                    onClick={() => handleDemoFill('nurse@hospital.com', 'Nurse@123')}
                  >
                    Nurse
                  </button>
                  <button
                    type="button"
                    style={styles.devRoleBtn}
                    onClick={() => handleDemoFill('lab@hospital.com', 'Lab@123')}
                  >
                    Laboratory
                  </button>
                  <button
                    type="button"
                    style={styles.devRoleBtn}
                    onClick={() => handleDemoFill('pharmacy@hospital.com', 'Pharmacy@123')}
                  >
                    Pharmacist
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    backgroundColor: 'var(--bg-canvas, #F5F8FC)',
  },
  cardContainer: {
    width: '100%',
    maxWidth: '1020px',
    minHeight: '620px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 20px 25px -5px rgba(11, 42, 74, 0.12), 0 8px 10px -6px rgba(11, 42, 74, 0.08)',
    border: '1px solid var(--border-color, #E2E8F0)',
  },
  brandPanel: {
    background: 'linear-gradient(145deg, #0B2A4A 0%, #164373 50%, #1E6FD9 100%)',
    color: '#FFFFFF',
    padding: '48px 40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  brandHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  brandIconWrap: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255, 255, 255, 0.25)',
  },
  brandName: {
    fontSize: '20px',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: '#FFFFFF',
    display: 'block',
  },
  brandBadge: {
    fontSize: '11px',
    color: '#93C5FD',
    fontWeight: 500,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  heroContent: {
    margin: '36px 0',
  },
  heroTitle: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#FFFFFF',
    lineHeight: 1.25,
    margin: '0 0 16px 0',
  },
  heroText: {
    fontSize: '14px',
    color: '#D0E3FB',
    lineHeight: 1.6,
    margin: '0 0 28px 0',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: '#F0F7FF',
    fontWeight: 500,
  },
  featureIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  brandFooter: {
    fontSize: '12px',
    color: '#BFDBFE',
    borderTop: '1px solid rgba(255, 255, 255, 0.15)',
    paddingTop: '16px',
  },
  formPanel: {
    padding: '48px 44px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  formContent: {
    maxWidth: '400px',
    margin: '0 auto',
    width: '100%',
  },
  formHeader: {
    marginBottom: '26px',
  },
  title: {
    fontSize: '26px',
    fontWeight: 800,
    color: 'var(--color-navy, #0B2A4A)',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary, #6B7280)',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  alertError: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    borderRadius: '8px',
    backgroundColor: 'var(--status-danger-bg, #FEE2E2)',
    border: '1px solid var(--status-danger-border, #FECACA)',
    color: 'var(--status-danger-text, #B91C1C)',
    fontSize: '13px',
    fontWeight: 500,
    marginBottom: '18px',
  },
  eyeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted, #9CA3AF)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    borderRadius: '4px',
  },
  devSection: {
    marginTop: '28px',
    paddingTop: '20px',
    borderTop: '1px dashed var(--border-color, #E2E8F0)',
  },
  devHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-muted, #6B7280)',
    letterSpacing: '0.04em',
    marginBottom: '10px',
  },
  devButtonsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '6px',
  },
  devRoleBtn: {
    padding: '6px 8px',
    fontSize: '11px',
    fontWeight: 600,
    borderRadius: '6px',
    border: '1px solid var(--border-color, #E2E8F0)',
    backgroundColor: 'var(--bg-muted, #F8FAFC)',
    color: 'var(--text-secondary, #4B5563)',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  },
};