import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import {
  ClipboardList, Plus, Search, FileText,
  User, Calendar, Edit2, Trash2, Pill, Activity
} from 'lucide-react';
import { Button, Input, Badge, Modal, ConfirmDialog, Toast, DataTable } from '../components/ui';

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    patientId: '',
    appointmentId: '',
    diagnosis: '',
    prescription: '',
    notes: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [recRes, patRes, appRes] = await Promise.all([
        api.get('/medical-records'),
        api.get('/patients'),
        api.get('/appointments'),
      ]);
      setRecords(recRes.data);
      setPatients(patRes.data);
      setAppointments(appRes.data.filter((a) => a.status !== 'CANCELLED'));
    } catch (err) {
      console.error(err);
      setError('Failed to load electronic medical records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm({
      patientId: '',
      appointmentId: '',
      diagnosis: '',
      prescription: '',
      notes: '',
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (record) => {
    setForm({
      patientId: record.patientId || '',
      appointmentId: record.appointmentId || '',
      diagnosis: record.diagnosis || '',
      prescription: record.prescription || '',
      notes: record.notes || '',
    });
    setEditingId(record.id);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/medical-records/${deleteId}`);
      setSuccess('Medical record deleted');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete medical record');
      setDeleteId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await api.put(`/medical-records/${editingId}`, form);
        setSuccess('Medical record updated');
      } else {
        await api.post('/medical-records', form);
        setSuccess('Medical record saved');
      }
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save record');
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const q = search.toLowerCase();
      const name = r.patient?.name?.toLowerCase() || '';
      const diag = r.diagnosis?.toLowerCase() || '';
      const presc = r.prescription?.toLowerCase() || '';
      return name.includes(q) || diag.includes(q) || presc.includes(q);
    });
  }, [records, search]);

  const columns = [
    {
      header: 'Patient Name',
      key: 'patient',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-navy, #0B2A4A)' }}>
            {r.patient?.name || 'Unknown Patient'}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>
            Recorded on {new Date(r.createdAt).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      header: 'Primary Diagnosis',
      key: 'diagnosis',
      render: (r) => (
        <span style={{ fontWeight: 600, color: '#1F2937', fontSize: '13px' }}>
          {r.diagnosis}
        </span>
      ),
    },
    {
      header: 'Prescription & Dosage',
      key: 'prescription',
      render: (r) => (
        <span style={{ fontSize: '13px', color: '#4B5563', maxWidth: '240px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {r.prescription || 'No medications prescribed'}
        </span>
      ),
    },
    {
      header: 'Clinical Notes',
      key: 'notes',
      render: (r) => (
        <span style={{ fontSize: '12px', color: '#6B7280', maxWidth: '200px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {r.notes || '-'}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <Button size="sm" variant="secondary" onClick={() => handleEdit(r)} icon={Edit2} aria-label="Edit" />
          <Button size="sm" variant="danger" onClick={() => setDeleteId(r.id)} icon={Trash2} aria-label="Delete" />
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Electronic Medical Records (EMR)</h1>
          <p style={styles.subtitle}>Document clinical patient diagnoses, treatment plans, and prescriptions</p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          Add Medical Record
        </Button>
      </div>

      {error && <Toast type="error" message={error} onClose={() => setError('')} style={{ marginBottom: '16px' }} />}
      {success && <Toast type="success" message={success} onClose={() => setSuccess('')} style={{ marginBottom: '16px' }} />}

      <div style={styles.filterBar}>
        <div style={styles.searchWrap}>
          <Search size={16} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by patient name, diagnosis, prescription..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <span style={{ fontSize: '13px', color: '#6B7280' }}>
          Total Records: <strong>{filteredRecords.length}</strong>
        </span>
      </div>

      <DataTable
        columns={columns}
        data={filteredRecords}
        loading={loading}
        pageSize={10}
        emptyTitle="No Medical Records"
        emptyDescription="No clinical medical files match your search criteria."
      />

      {/* Add / Edit EMR Modal */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingId ? 'Edit Medical Record' : 'Create Clinical Medical Record'}
        description="Document clinical diagnosis, prescriptions, and physician notes."
        maxWidth="600px"
        footer={
          <>
            <Button variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingId ? 'Update Record' : 'Save Medical Record'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={styles.inputLabel}>Patient *</label>
            <select
              name="patientId"
              value={form.patientId}
              onChange={handleChange}
              required
              style={styles.modalSelect}
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.inputLabel}>Associated Appointment (Optional)</label>
            <select
              name="appointmentId"
              value={form.appointmentId}
              onChange={handleChange}
              style={styles.modalSelect}
            >
              <option value="">-- Standalone Record / No Appointment --</option>
              {appointments
                .filter((a) => !form.patientId || a.patientId === form.patientId)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {new Date(a.date).toLocaleDateString()} - {a.reason || 'Consultation'} (Dr. {a.doctor?.user?.name})
                  </option>
                ))}
            </select>
          </div>

          <Input
            label="Clinical Diagnosis *"
            name="diagnosis"
            required
            placeholder="e.g. Type 2 Diabetes Mellitus, Acute Bronchitis"
            value={form.diagnosis}
            onChange={handleChange}
          />

          <div>
            <label style={styles.inputLabel}>Prescriptions & Treatment Regimen</label>
            <textarea
              name="prescription"
              rows={3}
              placeholder="e.g. Metformin 500mg BID with meals, Hydration"
              value={form.prescription}
              onChange={handleChange}
              style={styles.modalTextarea}
            />
          </div>

          <div>
            <label style={styles.inputLabel}>Confidential Physician Notes</label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Follow-up advice, patient history, lifestyle notes..."
              value={form.notes}
              onChange={handleChange}
              style={styles.modalTextarea}
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Medical Record"
        message="Are you sure you want to permanently delete this clinical record?"
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
  modalTextarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #E2E8F0)',
    fontSize: '14px',
    fontFamily: 'inherit',
    color: '#1F2937',
    outline: 'none',
    boxSizing: 'border-box',
  },
};