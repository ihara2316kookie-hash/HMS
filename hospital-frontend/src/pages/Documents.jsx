import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import {
  FileText, UploadCloud, Search, Download, Trash2,
  ExternalLink, User, Plus, File
} from 'lucide-react';
import { Button, Input, Badge, Modal, ConfirmDialog, Toast, DataTable } from '../components/ui';

export default function Documents() {
  const [patients, setPatients] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    patientId: '',
    title: '',
    file: null,
  });

  const fetchData = async () => {
    try {
      const [patRes, docRes] = await Promise.all([
        api.get('/patients'),
        api.get('/documents'),
      ]);
      setPatients(patRes.data || []);
      setDocuments(docRes.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load patient documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.patientId || !form.title || !form.file) {
      setError('Patient, document title, and file are required');
      return;
    }

    try {
      const data = new FormData();
      data.append('patientId', form.patientId);
      data.append('title', form.title);
      data.append('file', form.file);

      await api.post('/documents', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Document uploaded successfully');
      setForm({ patientId: '', title: '', file: null });
      setShowUploadModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/documents/${deleteId}`);
      setSuccess('Document record deleted');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
      setDeleteId(null);
    }
  };

  const fileUrl = (url) => {
    const base = api.defaults.baseURL?.replace('/api', '') || 'http://localhost:5000';
    return `${base}${url}`;
  };

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      const q = search.toLowerCase();
      const title = d.title?.toLowerCase() || '';
      const fname = d.fileName?.toLowerCase() || '';
      const pname = d.patient?.name?.toLowerCase() || '';
      return title.includes(q) || fname.includes(q) || pname.includes(q);
    });
  }, [documents, search]);

  const columns = [
    {
      header: 'Document Title',
      key: 'title',
      render: (d) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#E8F1FD', color: '#1E6FD9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-navy, #0B2A4A)' }}>{d.title}</div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>{d.fileName}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Patient',
      key: 'patient',
      render: (d) => <span style={{ fontWeight: 600, color: '#1F2937' }}>{d.patient?.name || 'Unknown'}</span>,
    },
    {
      header: 'Uploaded Date',
      key: 'createdAt',
      render: (d) => (
        <span style={{ fontSize: '13px', color: '#4B5563' }}>
          {new Date(d.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (d) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          {d.fileUrl && (
            <a
              href={fileUrl(d.fileUrl)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Button size="sm" variant="secondary" icon={ExternalLink}>
                View
              </Button>
            </a>
          )}
          <Button size="sm" variant="danger" onClick={() => setDeleteId(d.id)} icon={Trash2} aria-label="Delete" />
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Patient Medical Documents</h1>
          <p style={styles.subtitle}>Upload diagnostic scans, lab slips, consent forms, and clinical history files</p>
        </div>
        <Button variant="primary" icon={UploadCloud} onClick={() => setShowUploadModal(true)}>
          Upload Document
        </Button>
      </div>

      {error && <Toast type="error" message={error} onClose={() => setError('')} style={{ marginBottom: '16px' }} />}
      {success && <Toast type="success" message={success} onClose={() => setSuccess('')} style={{ marginBottom: '16px' }} />}

      <div style={styles.filterBar}>
        <div style={styles.searchWrap}>
          <Search size={16} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by title, file name, patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <span style={{ fontSize: '13px', color: '#6B7280' }}>
          Total Files: <strong>{filtered.length}</strong>
        </span>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        pageSize={10}
        emptyTitle="No Documents Uploaded"
        emptyDescription="There are no patient clinical documents stored in this directory."
      />

      {/* Upload Document Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Clinical Document"
        description="Attach medical reports, lab slips, or consent forms to a patient record."
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowUploadModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleUpload}>Upload Document</Button>
          </>
        }
      >
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={styles.inputLabel}>Patient *</label>
            <select
              value={form.patientId}
              onChange={(e) => setForm({ ...form, patientId: e.target.value })}
              required
              style={styles.modalSelect}
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
              ))}
            </select>
          </div>

          <Input
            label="Document Title *"
            required
            placeholder="e.g. Chest CT Scan, Consent Form"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <div>
            <label style={styles.inputLabel}>Select File (PDF, PNG, JPG) *</label>
            <input
              type="file"
              required
              onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
              style={styles.modalFileInput}
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Patient Document"
        message="Are you sure you want to permanently delete this uploaded file?"
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
  inputLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1F2937',
    display: 'block',
    marginBottom: '4px',
  },
  modalSelect: {
    width: '100%',
    height: '42px',
    padding: '0 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #E2E8F0)',
    backgroundColor: '#FFFFFF',
    fontSize: '14px',
    color: '#1F2937',
    outline: 'none',
  },
  modalFileInput: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px dashed var(--border-color, #E2E8F0)',
    backgroundColor: 'var(--bg-muted, #F8FAFC)',
    fontSize: '13px',
    color: '#4B5563',
    boxSizing: 'border-box',
  },
};