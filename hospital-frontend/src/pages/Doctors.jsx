import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import {
  Stethoscope, Plus, Search, Phone, Mail,
  Building2, Edit2, Trash2, Award, UserCheck
} from 'lucide-react';
import { Button, Input, Badge, Modal, ConfirmDialog, Toast, DataTable } from '../components/ui';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    phone: '',
    department: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const specializations = [
    'Cardiology', 'Dermatology', 'ENT', 'General Medicine', 'Gynecology',
    'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Psychiatry',
    'Radiology', 'Surgery', 'Urology', 'Other',
  ];

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors');
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      password: '',
      specialization: '',
      phone: '',
      department: '',
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (doctor) => {
    setForm({
      name: doctor.user?.name || '',
      email: doctor.user?.email || '',
      password: '',
      specialization: doctor.specialization || '',
      phone: doctor.phone || '',
      department: doctor.department || '',
    });
    setEditingId(doctor.id);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/doctors/${deleteId}`);
      setSuccess('Doctor profile removed successfully');
      setDeleteId(null);
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete doctor');
      setDeleteId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await api.put(`/doctors/${editingId}`, form);
        setSuccess('Doctor profile updated successfully');
      } else {
        await api.post('/doctors', form);
        setSuccess('Doctor added to clinical staff');
      }
      resetForm();
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save doctor');
    }
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter((d) => {
      const q = search.toLowerCase();
      const name = d.user?.name?.toLowerCase() || '';
      const spec = d.specialization?.toLowerCase() || '';
      const dept = d.department?.toLowerCase() || '';

      const matchesSearch = name.includes(q) || spec.includes(q) || dept.includes(q) || (d.phone && d.phone.includes(q));
      const matchesSpec = !specFilter || d.specialization === specFilter;
      return matchesSearch && matchesSpec;
    });
  }, [doctors, search, specFilter]);

  const columns = [
    {
      header: 'Doctor Name',
      key: 'name',
      render: (d) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#E8F1FD', color: '#1E6FD9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
            {d.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-navy, #0B2A4A)' }}>{d.user?.name}</div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>{d.user?.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Specialization',
      key: 'specialization',
      render: (d) => <Badge variant="primary" size="sm">{d.specialization}</Badge>,
    },
    {
      header: 'Department',
      key: 'department',
      render: (d) => <span style={{ fontSize: '13px', color: '#4B5563' }}>{d.department || 'General'}</span>,
    },
    {
      header: 'Phone Contact',
      key: 'phone',
      render: (d) => (
        <span style={{ fontSize: '13px', color: '#1F2937', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Phone size={12} color="#6B7280" />
          {d.phone || '-'}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (d) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <Button size="sm" variant="secondary" onClick={() => handleEdit(d)} icon={Edit2} aria-label="Edit" />
          <Button size="sm" variant="danger" onClick={() => setDeleteId(d.id)} icon={Trash2} aria-label="Delete" />
        </div>
      ),
    },
  ];

  return (
    <Layout>
      {/* Header */}
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Physicians & Specialists</h1>
          <p style={styles.subtitle}>Manage medical staff, clinical specializations, and doctor departments</p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          Add Doctor
        </Button>
      </div>

      {error && <Toast type="error" message={error} onClose={() => setError('')} style={{ marginBottom: '16px' }} />}
      {success && <Toast type="success" message={success} onClose={() => setSuccess('')} style={{ marginBottom: '16px' }} />}

      {/* Filter Bar */}
      <div style={styles.filterBar}>
        <div style={styles.searchWrap}>
          <Search size={16} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search doctor by name, specialty, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <select
          value={specFilter}
          onChange={(e) => setSpecFilter(e.target.value)}
          style={styles.selectFilter}
          aria-label="Filter by specialization"
        >
          <option value="">All Specializations</option>
          {specializations.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Doctors Table */}
      <DataTable
        columns={columns}
        data={filteredDoctors}
        loading={loading}
        pageSize={10}
        emptyTitle="No Doctors Found"
        emptyDescription="No physicians matching your filter criteria."
      />

      {/* Add / Edit Doctor Modal */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingId ? 'Edit Doctor Information' : 'Register Doctor Profile'}
        description="Fill in doctor credentials, specialization, and department."
        maxWidth="560px"
        footer={
          <>
            <Button variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingId ? 'Save Changes' : 'Register Doctor'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={styles.modalGrid}>
          <Input
            label="Full Doctor Name *"
            name="name"
            required
            placeholder="e.g. Dr. Emily Watson"
            value={form.name}
            onChange={handleChange}
            containerStyle={{ gridColumn: 'span 2' }}
          />

          <Input
            label="Professional Email *"
            name="email"
            type="email"
            required
            placeholder="e.g. emily@hospital.com"
            value={form.email}
            onChange={handleChange}
          />

          <Input
            label={editingId ? 'New Password (Optional)' : 'Account Password *'}
            name="password"
            type="password"
            required={!editingId}
            placeholder={editingId ? 'Leave blank to keep' : 'Minimum 6 chars'}
            value={form.password}
            onChange={handleChange}
          />

          <div>
            <label style={styles.inputLabel}>Specialization *</label>
            <select
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              required
              style={styles.modalSelect}
            >
              <option value="">-- Choose Specialization --</option>
              {specializations.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <Input
            label="Department"
            name="department"
            placeholder="e.g. Outpatient Cardiology"
            value={form.department}
            onChange={handleChange}
          />

          <Input
            label="Contact Phone"
            name="phone"
            placeholder="e.g. +1 555-0144"
            value={form.phone}
            onChange={handleChange}
            containerStyle={{ gridColumn: 'span 2' }}
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Remove Doctor Profile"
        message="Are you sure you want to remove this doctor from the hospital registry?"
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
    gap: '12px',
    flexWrap: 'wrap',
  },
  searchWrap: {
    position: 'relative',
    flex: 1,
    minWidth: '220px',
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
  selectFilter: {
    height: '38px',
    padding: '0 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #E2E8F0)',
    backgroundColor: '#FFFFFF',
    fontSize: '13px',
    color: '#1F2937',
    outline: 'none',
  },
  modalGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
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