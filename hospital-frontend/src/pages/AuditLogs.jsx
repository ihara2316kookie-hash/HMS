import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { ShieldCheck, Search, Clock, User, Activity } from 'lucide-react';
import { Badge, DataTable } from '../components/ui';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/audit');
        setLogs(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const q = search.toLowerCase();
      const action = l.action?.toLowerCase() || '';
      const module = l.module?.toLowerCase() || '';
      const details = l.details?.toLowerCase() || '';
      const name = l.user?.name?.toLowerCase() || '';
      const email = l.user?.email?.toLowerCase() || '';
      return action.includes(q) || module.includes(q) || details.includes(q) || name.includes(q) || email.includes(q);
    });
  }, [logs, search]);

  const columns = [
    {
      header: 'User Account',
      key: 'user',
      render: (l) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-navy, #0B2A4A)' }}>
            {l.user?.name || 'System / Auto'}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>{l.user?.email}</div>
        </div>
      ),
    },
    {
      header: 'Role',
      key: 'role',
      render: (l) => <Badge variant="neutral" size="sm">{l.user?.role || 'SYSTEM'}</Badge>,
    },
    {
      header: 'Action Taken',
      key: 'action',
      render: (l) => {
        let variant = 'info';
        if (l.action?.includes('DELETE')) variant = 'danger';
        else if (l.action?.includes('CREATE') || l.action?.includes('REGISTER') || l.action?.includes('LOGIN')) variant = 'success';
        else if (l.action?.includes('UPDATE') || l.action?.includes('PASSWORD')) variant = 'warning';
        return <Badge variant={variant} size="sm">{l.action}</Badge>;
      },
    },
    {
      header: 'Module',
      key: 'module',
      render: (l) => (
        <span style={{ fontWeight: 600, color: '#4B5563', fontSize: '13px' }}>
          {l.module}
        </span>
      ),
    },
    {
      header: 'Event Details',
      key: 'details',
      render: (l) => (
        <span style={{ fontSize: '13px', color: '#1F2937', maxWidth: '320px', display: 'block' }}>
          {l.details || '-'}
        </span>
      ),
    },
    {
      header: 'Timestamp',
      key: 'createdAt',
      render: (l) => (
        <span style={{ fontSize: '12px', color: '#6B7280' }}>
          {new Date(l.createdAt).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <Layout>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>System Audit & Compliance Logs</h1>
          <p style={styles.subtitle}>Trace administrative actions, user logins, clinical updates, and security events</p>
        </div>
      </div>

      <div style={styles.filterBar}>
        <div style={styles.searchWrap}>
          <Search size={16} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search audit trail by user, action, module, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <span style={{ fontSize: '13px', color: '#6B7280' }}>
          Total Audit Events: <strong>{filtered.length}</strong>
        </span>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        pageSize={12}
        emptyTitle="No Audit Logs"
        emptyDescription="There are no audit events matching your search."
      />
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
  filterBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #E2E8F0)',
    padding: '12px 16px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  searchWrap: {
    position: 'relative',
    flex: 1,
    minWidth: '240px',
    maxWidth: '480px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9CA3AF',
  },
  searchInput: {
    width: '100%',
    height: '38px',
    paddingLeft: '38px',
    paddingRight: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #E2E8F0)',
    fontSize: '13px',
    outline: 'none',
  },
};