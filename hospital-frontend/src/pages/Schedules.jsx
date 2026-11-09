import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import {
  CalendarDays, Plus, Search, Clock, CheckCircle2,
  XCircle, Edit2, Trash2, Stethoscope
} from 'lucide-react';
import { Button, Input, Badge, Modal, ConfirmDialog, Toast, DataTable } from '../components/ui';

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    doctorId: '',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true,
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const fetchData = async () => {
    try {
      const docRes = await api.get('/doctors');
      setDoctors(docRes.data || []);
    } catch (err) {
      console.error('Doctors load failed', err);
    }

    try {
      const schRes = await api.get('/schedules');
      setSchedules(schRes.data || []);
    } catch (err) {
      console.error('Schedules load failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm({
      doctorId: '',
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true,
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await api.put(`/schedules/${editingId}`, form);
        setSuccess('Schedule updated successfully');
      } else {
        await api.post('/schedules', form);
        setSuccess('Schedule created successfully');
      }
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save schedule');
    }
  };

  const handleEdit = (s) => {
    setForm({
      doctorId: s.doctorId,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      isAvailable: s.isAvailable,
    });
    setEditingId(s.id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/schedules/${deleteId}`);
      setSuccess('Schedule entry removed');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete schedule');
      setDeleteId(null);
    }
  };

  const filtered = useMemo(() => {
    return schedules.filter((s) => {
      const q = search.toLowerCase();
      const docName = s.doctor?.user?.name?.toLowerCase() || '';
      const day = s.dayOfWeek?.toLowerCase() || '';
      return docName.includes(q) || day.includes(q) || s.startTime?.includes(q) || s.endTime?.includes(q);
    });
  }, [schedules, search]);

  const columns = [
    {
      header: 'Physician / Doctor',
      key: 'doctor',
      render: (s) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#E8F1FD', color: '#1E6FD9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
            {s.doctor?.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-navy, #0B2A4A)' }}>{s.doctor?.user?.name}</div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>{s.doctor?.specialization || 'Physician'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Day of Week',
      key: 'dayOfWeek',
      render: (s) => <Badge variant="primary" size="sm">{s.dayOfWeek}</Badge>,
    },
    {
      header: 'Clinical Shift Hours',
      key: 'shift',
      render: (s) => (
        <span style={{ fontSize: '13px', color: '#1F2937' }}>
          {s.startTime} - {s.endTime}
        </span>
      ),
    },
    {
      header: 'Availability',
      key: 'isAvailable',
      render: (s) => {
        if (s.isAvailable) return <Badge variant="success" dot size="sm">Available</Badge>;
        return <Badge variant="danger" dot size="sm">Off Duty</Badge>;
      },
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (s) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <Button size="sm" variant="secondary" onClick={() => handleEdit(s)} icon={Edit2} aria-label="Edit" />
          <Button size="sm" variant="danger" onClick={() => setDeleteId(s.id)} icon={Trash2} aria-label="Delete" />
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Doctor Duty Schedules</h1>
          <p style={styles.subtitle}>Manage physician weekly consulting schedules and hospital availability</p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          Add Shift Schedule
        </Button>
      </div>

      {error && <Toast type="error" message={error} onClose={() => setError('')} style={{ marginBottom: '16px' }} />}
      {success && <Toast type="success" message={success} onClose={() => setSuccess('')} style={{ marginBottom: '16px' }} />}

      <div style={styles.filterBar}>
        <div style={styles.searchWrap}>
          <Search size={16} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by doctor name, day, or hours..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <span style={{ fontSize: '13px', color: '#6B7280' }}>
          Total Schedules: <strong>{filtered.length}</strong>
        </span>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        pageSize={10}
        emptyTitle="No Schedules Found"
        emptyDescription="There are no doctor duty hours scheduled."
      />

      {/* Add / Edit Schedule Modal */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingId ? 'Edit Shift Schedule' : 'Schedule Doctor Hours'}
        description="Select physician, weekday, and clinical consulting hours."
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit}>Save Schedule</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={styles.inputLabel}>Doctor *</label>
            <select
              value={form.doctorId}
              onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
              required
              style={styles.modalSelect}
            >
              <option value="">-- Choose Doctor --</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.user?.name} ({d.specialization})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.inputLabel}>Day of Week</label>
            <select
              value={form.dayOfWeek}
              onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
              style={styles.modalSelect}
            >
              {days.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Shift Start *"
              type="time"
              required
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
            <Input
              label="Shift End *"
              type="time"
              required
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <input
              type="checkbox"
              id="isAvailable"
              checked={form.isAvailable}
              onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
              style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary, #1E6FD9)' }}
            />
            <label htmlFor="isAvailable" style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937' }}>
              Doctor is available for patient bookings during this shift
            </label>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Remove Duty Schedule"
        message="Are you sure you want to delete this doctor's scheduled shift?"
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
};