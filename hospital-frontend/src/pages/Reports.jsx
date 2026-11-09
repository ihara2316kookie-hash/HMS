import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import {
  FileText, Printer, Download, Calendar,
  TrendingUp, Users, DollarSign, Pill, FlaskConical, UserCog
} from 'lucide-react';
import { Button, Badge, Tabs, Toast } from '../components/ui';

export default function Reports() {
  const [type, setType] = useState('patients');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadReport = async (reportType = type) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/reports/${reportType}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load report data');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport('patients');
  }, []);

  const handleTypeChange = (value) => {
    setType(value);
    loadReport(value);
  };

  const handleExportCSV = () => {
    if (!data) return;
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonStr);
    downloadAnchor.setAttribute('download', `medicare-${type}-report-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const reportTabs = [
    { id: 'patients', label: 'Patient Demographics', icon: Users },
    { id: 'appointments', label: 'Clinical Appointments', icon: Calendar },
    { id: 'revenue', label: 'Hospital Revenue', icon: DollarSign },
    { id: 'pharmacy', label: 'Pharmacy Stock & Dispense', icon: Pill },
    { id: 'laboratory', label: 'Laboratory Diagnostics', icon: FlaskConical },
    { id: 'staff', label: 'Hospital Personnel', icon: UserCog },
  ];

  return (
    <Layout>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Hospital Reports & Analytics</h1>
          <p style={styles.subtitle}>Audit clinical operational trends, financial performance, and patient statistics</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export Data
          </Button>
          <Button variant="primary" icon={Printer} onClick={() => window.print()}>
            Print Report
          </Button>
        </div>
      </div>

      {error && <Toast type="error" message={error} onClose={() => setError('')} style={{ marginBottom: '16px' }} />}

      <Tabs
        tabs={reportTabs}
        activeTab={type}
        onChange={handleTypeChange}
        style={{ marginBottom: '20px' }}
      />

      {loading ? (
        <div style={styles.loadingWrap}>
          <div style={styles.spinner} />
          <span>Generating analytical report...</span>
        </div>
      ) : (
        <div style={styles.reportCard}>
          <div style={styles.reportMeta}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary, #1E6FD9)', textTransform: 'uppercase' }}>
                Official Hospital Audit
              </span>
              <h2 style={{ margin: '2px 0 0 0', fontSize: '18px', color: 'var(--color-navy, #0B2A4A)' }}>
                {reportTabs.find((t) => t.id === type)?.label} Report
              </h2>
            </div>
            <Badge variant="primary" size="md">Generated: {new Date().toLocaleDateString()}</Badge>
          </div>

          {/* Render formatted report metrics */}
          {data ? (
            <div style={styles.dataContent}>
              <div style={styles.summaryGrid}>
                {Object.entries(data).map(([k, v]) => {
                  if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
                    return null;
                  }
                  if (Array.isArray(v)) {
                    return (
                      <div key={k} style={{ ...styles.metricBox, gridColumn: '1 / -1' }}>
                        <div style={styles.metricLabel}>{k.replace(/([A-Z])/g, ' $1').toUpperCase()}</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937', marginTop: '6px' }}>
                          {v.length} recorded items
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={k} style={styles.metricBox}>
                      <div style={styles.metricLabel}>{k.replace(/([A-Z])/g, ' $1').toUpperCase()}</div>
                      <div style={styles.metricVal}>
                        {typeof v === 'number' && k.toLowerCase().includes('revenue')
                          ? `Rs. ${v.toLocaleString()}`
                          : String(v)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* JSON Data Viewer */}
              <div style={styles.rawJsonBox}>
                <div style={{ fontWeight: 700, fontSize: '12px', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Raw Dataset Preview
                </div>
                <pre style={{ margin: 0, fontSize: '12px', color: '#334155', maxHeight: '360px', overflowY: 'auto' }}>
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
              No data available for this report type.
            </div>
          )}
        </div>
      )}
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
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    gap: '10px',
    color: '#6B7280',
    fontSize: '14px',
  },
  spinner: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    border: '3px solid #E8F1FD',
    borderTopColor: '#1E6FD9',
    animation: 'spin 1s linear infinite',
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    border: '1px solid var(--border-color, #E2E8F0)',
    boxShadow: 'var(--shadow-sm)',
    padding: '24px',
  },
  reportMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '16px',
    borderBottom: '1px solid #EEF2F6',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  dataContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '14px',
  },
  metricBox: {
    padding: '16px',
    borderRadius: '10px',
    backgroundColor: 'var(--bg-muted, #F8FAFC)',
    border: '1px solid var(--border-color, #E2E8F0)',
  },
  metricLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#6B7280',
    letterSpacing: '0.04em',
    marginBottom: '6px',
  },
  metricVal: {
    fontSize: '20px',
    fontWeight: 800,
    color: 'var(--color-navy, #0B2A4A)',
  },
  rawJsonBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    padding: '16px',
  },
};