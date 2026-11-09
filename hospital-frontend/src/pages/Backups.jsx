import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import {
  Database, Download, Play, ShieldAlert,
  Clock, CheckCircle2, HardDrive, RefreshCw
} from 'lucide-react';
import { Button, Badge, Toast, DataTable } from '../components/ui';

export default function Backups() {
  const [backups, setBackups] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runningBackup, setRunningBackup] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [backupRes, planRes] = await Promise.all([
        api.get('/backups'),
        api.get('/backups/recovery-plan'),
      ]);
      setBackups(backupRes.data || []);
      setPlan(planRes.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load backup data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const runBackup = async (type) => {
    setError('');
    setSuccess('');
    setRunningBackup(true);
    try {
      const res = await api.post('/backups/run', { type });
      setSuccess(res.data.message || `Manual ${type} database backup completed`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Backup failed');
    } finally {
      setRunningBackup(false);
    }
  };

  const downloadBackup = async (type, fileName) => {
    try {
      const res = await api.get(`/backups/download/${type}/${fileName}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Download failed');
    }
  };

  const columns = [
    {
      header: 'Backup Archive',
      key: 'name',
      render: (b) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={16} color="#1E6FD9" />
          <span style={{ fontWeight: 600, color: 'var(--color-navy, #0B2A4A)', fontSize: '13px' }}>
            {b.name}
          </span>
        </div>
      ),
    },
    {
      header: 'Schedule Cadence',
      key: 'type',
      render: (b) => (
        <Badge variant={b.type === 'weekly' ? 'primary' : 'neutral'} size="sm">
          {b.type ? b.type.toUpperCase() : 'DAILY'}
        </Badge>
      ),
    },
    {
      header: 'Archive Size',
      key: 'size',
      render: (b) => (
        <span style={{ fontSize: '13px', color: '#4B5563' }}>
          {b.size ? `${(b.size / 1024).toFixed(1)} KB` : 'Standard'}
        </span>
      ),
    },
    {
      header: 'Created On',
      key: 'createdAt',
      render: (b) => (
        <span style={{ fontSize: '12px', color: '#6B7280' }}>
          {b.createdAt ? new Date(b.createdAt).toLocaleString() : 'Recent'}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (b) => (
        <Button
          size="sm"
          variant="secondary"
          icon={Download}
          onClick={() => downloadBackup(b.type || 'daily', b.name)}
        >
          Download
        </Button>
      ),
    },
  ];

  return (
    <Layout>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Database Backup & Disaster Recovery</h1>
          <p style={styles.subtitle}>Automate daily snapshots, weekly database archives, and off-site data exports</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="secondary"
            icon={Play}
            onClick={() => runBackup('daily')}
            loading={runningBackup}
          >
            Run Daily Snapshot
          </Button>
          <Button
            variant="primary"
            icon={Play}
            onClick={() => runBackup('weekly')}
            loading={runningBackup}
          >
            Run Full Weekly Backup
          </Button>
        </div>
      </div>

      {error && <Toast type="error" message={error} onClose={() => setError('')} style={{ marginBottom: '16px' }} />}
      {success && <Toast type="success" message={success} onClose={() => setSuccess('')} style={{ marginBottom: '16px' }} />}

      {/* Disaster Recovery Policy Card */}
      {plan && (
        <div style={styles.planCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <HardDrive size={18} color="#1E6FD9" />
            <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--color-navy, #0B2A4A)' }}>
              Disaster Recovery Policy (RTO &amp; RPO)
            </h3>
          </div>
          <div style={styles.planGrid}>
            <div style={styles.planItem}>
              <div style={styles.planLabel}>RPO (Recovery Point)</div>
              <div style={styles.planVal}>{plan.rpo || '24 Hours'}</div>
            </div>
            <div style={styles.planItem}>
              <div style={styles.planLabel}>RTO (Recovery Time)</div>
              <div style={styles.planVal}>{plan.rto || '1 Hour'}</div>
            </div>
            <div style={styles.planItem}>
              <div style={styles.planLabel}>Daily Automated Schedule</div>
              <div style={styles.planVal}>{plan.schedule?.daily || 'Every midnight (00:00)'}</div>
            </div>
            <div style={styles.planItem}>
              <div style={styles.planLabel}>Weekly Full Archive</div>
              <div style={styles.planVal}>{plan.schedule?.weekly || 'Sundays at 02:00'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Archives Table */}
      <DataTable
        columns={columns}
        data={backups}
        loading={loading}
        pageSize={10}
        emptyTitle="No Backup Archives"
        emptyDescription="No automated or manual database backups have been generated yet."
      />
    </Layout>
  );
}

const styles = {
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
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
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #E2E8F0)',
    padding: '18px 20px',
    marginBottom: '20px',
    boxShadow: 'var(--shadow-sm)',
  },
  planGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginTop: '10px',
  },
  planItem: {
    padding: '10px 14px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-muted, #F8FAFC)',
    border: '1px solid #EEF2F6',
  },
  planLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  planVal: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--color-navy, #0B2A4A)',
    marginTop: '2px',
  },
};