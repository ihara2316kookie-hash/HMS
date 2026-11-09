import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import {
  Users, UserPlus, Search, Edit2, Trash2, Eye,
  Phone, Mail, Calendar, Droplet, MapPin, FileText
} from 'lucide-react';
import { Button, Input, Badge, Modal, ConfirmDialog, Toast, DataTable, Tabs } from '../components/ui';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [bloodFilter, setBloodFilter] = useState('');

  // Patient Profile Modal State
  const [viewPatient, setViewPatient] = useState(null);
  const [profileTab, setProfileTab] = useState('overview');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    bloodGroup: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load patient records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      gender: '',
      dateOfBirth: '',
      address: '',
      bloodGroup: '',
    });
    setEditingId(null);
    setShowFormModal(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (patient) => {
    setForm({
      name: patient.name || '',
      email: patient.email || '',
      phone: patient.phone || '',
      gender: patient.gender || '',
      dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '',
      address: patient.address || '',
      bloodGroup: patient.bloodGroup || '',
    });
    setEditingId(patient.id);
    setShowFormModal(true);
    setError('');
    setSuccess('');
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/patients/${deleteId}`);
      setSuccess('Patient record deleted successfully');
      setDeleteId(null);
      fetchPatients();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete patient');
      setDeleteId(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaveLoading(true);

    try {
      if (editingId) {
        await api.put(`/patients/${editingId}`, form);
        setSuccess('Patient record updated successfully');
      } else {
        await api.post('/patients', form);
        setSuccess('New patient registered successfully');
      }
      resetForm();
      fetchPatients();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save patient');
    } finally {
      setSaveLoading(false);
    }
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        p.name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.phone?.toLowerCase().includes(q) ||
        p.bloodGroup?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q);

      const matchesBlood = !bloodFilter || p.bloodGroup === bloodFilter;
      return matchesSearch && matchesBlood;
    });
  }, [patients, search, bloodFilter]);

  const columns = [
    {
      header: 'Patient Info',
      key: 'name',
      render: (p) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-light, #E8F1FD)',
              color: 'var(--color-primary, #1E6FD9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '14px',
              flexShrink: 0,
            }}
          >
            {p.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--color-navy, #0B2A4A)' }}>{p.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted, #6B7280)' }}>
              {p.gender || 'Not specified'} · {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : 'DOB N/A'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact',
      key: 'phone',
      render: (p) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#1F2937' }}>
            <Phone size={13} color="#6B7280" />
            <span>{p.phone}</span>
          </div>
          {p.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
              <Mail size={13} color="#9CA3AF" />
              <span>{p.email}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Blood Group',
      key: 'bloodGroup',
      render: (p) => (
        p.bloodGroup ? (
          <Badge variant="danger" size="sm">
            <Droplet size={11} />
            {p.bloodGroup}
          </Badge>
        ) : (
          <span style={{ color: '#9CA3AF' }}>-</span>
        )
      ),
    },
    {
      header: 'Address',
      key: 'address',
      render: (p) => (
        <span style={{ fontSize: '13px', color: '#4B5563', maxWidth: '180px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {p.address || '-'}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (p) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setViewPatient(p)}
            aria-label={`View ${p.name}`}
            icon={Eye}
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleEdit(p)}
            aria-label={`Edit ${p.name}`}
            icon={Edit2}
          />
          <Button
            size="sm"
            variant="danger"
            onClick={() => setDeleteId(p.id)}
            aria-label={`Delete ${p.name}`}
            icon={Trash2}
          />
        </div>
      ),
    },
  ];

  return (
    <Layout>
      {/* Page Header */}
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Patient Directory</h1>
          <p style={styles.subtitle}>Manage hospital patient registrations, records, and clinical files</p>
        </div>
        <Button
          variant="primary"
          icon={UserPlus}
          onClick={() => {
            resetForm();
            setShowFormModal(true);
          }}
        >
          Register New Patient
        </Button>
      </div>

      {/* Alerts */}
      {error && <Toast type="error" message={error} onClose={() => setError('')} style={{ marginBottom: '16px' }} />}
      {success && <Toast type="success" message={success} onClose={() => setSuccess('')} style={{ marginBottom: '16px' }} />}

      {/* Filter Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <Search size={16} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, phone, email, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
            aria-label="Filter patients"
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={bloodFilter}
            onChange={(e) => setBloodFilter(e.target.value)}
            style={styles.selectInput}
            aria-label="Filter by Blood Group"
          >
            <option value="">All Blood Groups</option>
            {bloodGroups.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
          <span style={{ fontSize: '13px', color: '#6B7280', whiteSpace: 'nowrap' }}>
            Total: <strong>{filteredPatients.length}</strong>
          </span>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredPatients}
        loading={loading}
        pageSize={10}
        emptyTitle="No Patients Found"
        emptyDescription="No patients match your search or filter criteria."
      />

      {/* Add / Edit Patient Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={resetForm}
        title={editingId ? 'Edit Patient Information' : 'Register New Patient'}
        description="Fill in the essential patient contact and biological data."
        maxWidth="620px"
        footer={
          <>
            <Button variant="secondary" onClick={resetForm} disabled={saveLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={saveLoading}>
              {editingId ? 'Save Changes' : 'Register Patient'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={styles.modalFormGrid}>
          <Input
            label="Full Name"
            name="name"
            required
            placeholder="e.g. John Doe"
            value={form.name}
            onChange={handleChange}
            containerStyle={{ gridColumn: 'span 2' }}
          />

          <Input
            label="Phone Number"
            name="phone"
            required
            placeholder="e.g. +1 555-0199"
            value={form.phone}
            onChange={handleChange}
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="e.g. john@example.com"
            value={form.email}
            onChange={handleChange}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={styles.inputLabel}>Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} style={styles.modalSelect}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <Input
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={handleChange}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={styles.inputLabel}>Blood Group</label>
            <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} style={styles.modalSelect}>
              <option value="">Select Blood Group</option>
              {bloodGroups.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <Input
            label="Home / Residential Address"
            name="address"
            placeholder="Street name, City, Zip"
            value={form.address}
            onChange={handleChange}
            containerStyle={{ gridColumn: 'span 2' }}
          />
        </form>
      </Modal>

      {/* Patient Profile Tabs Modal */}
      <Modal
        isOpen={Boolean(viewPatient)}
        onClose={() => setViewPatient(null)}
        title={viewPatient?.name || 'Patient Profile'}
        description={`Record ID: ${viewPatient?.id || ''}`}
        maxWidth="680px"
        footer={
          <Button variant="secondary" onClick={() => setViewPatient(null)}>
            Close Profile
          </Button>
        }
      >
        {viewPatient && (
          <div>
            <Tabs
              tabs={[
                { id: 'overview', label: 'Overview' },
                { id: 'history', label: 'Medical History' },
                { id: 'prescriptions', label: 'Prescriptions' },
                { id: 'labs', label: 'Lab Reports' },
                { id: 'billing', label: 'Billing' },
              ]}
              activeTab={profileTab}
              onChange={setProfileTab}
              style={{ marginBottom: '20px' }}
            />

            {profileTab === 'overview' && (
              <div style={styles.profileGrid}>
                <div style={styles.profileCard}>
                  <div style={styles.profileLabel}>Gender</div>
                  <div style={styles.profileVal}>{viewPatient.gender || 'Not specified'}</div>
                </div>
                <div style={styles.profileCard}>
                  <div style={styles.profileLabel}>Blood Group</div>
                  <div style={styles.profileVal}>
                    {viewPatient.bloodGroup ? <Badge variant="danger">{viewPatient.bloodGroup}</Badge> : 'N/A'}
                  </div>
                </div>
                <div style={styles.profileCard}>
                  <div style={styles.profileLabel}>Phone</div>
                  <div style={styles.profileVal}>{viewPatient.phone || '-'}</div>
                </div>
                <div style={styles.profileCard}>
                  <div style={styles.profileLabel}>Email</div>
                  <div style={styles.profileVal}>{viewPatient.email || '-'}</div>
                </div>
                <div style={{ ...styles.profileCard, gridColumn: 'span 2' }}>
                  <div style={styles.profileLabel}>Address</div>
                  <div style={styles.profileVal}>{viewPatient.address || 'No residential address on file'}</div>
                </div>
              </div>
            )}

            {profileTab !== 'overview' && (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: '#6B7280' }}>
                <FileText size={28} style={{ color: '#9CA3AF', marginBottom: '8px' }} />
                <div style={{ fontWeight: 600, color: '#1F2937' }}>Connected Clinical Records</div>
                <p style={{ fontSize: '13px', margin: '4px 0 0 0' }}>
                  View full history for this patient in the specialized <strong>{profileTab.toUpperCase()}</strong> module.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Patient Record"
        message="Are you sure you want to delete this patient? This will remove all associated profile data."
        confirmText="Yes, Delete Record"
        loading={deleteLoading}
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
  toolbar: {
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
    height: '40px',
    paddingLeft: '38px',
    paddingRight: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #E2E8F0)',
    fontSize: '13px',
    color: '#1F2937',
    outline: 'none',
  },
  selectInput: {
    height: '40px',
    padding: '0 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #E2E8F0)',
    backgroundColor: '#FFFFFF',
    fontSize: '13px',
    color: '#1F2937',
    outline: 'none',
  },
  modalFormGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  inputLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1F2937',
  },
  modalSelect: {
    height: '42px',
    padding: '0 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #E2E8F0)',
    backgroundColor: '#FFFFFF',
    fontSize: '14px',
    color: '#1F2937',
    outline: 'none',
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  profileCard: {
    padding: '12px 14px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-muted, #F8FAFC)',
    border: '1px solid var(--border-color, #E2E8F0)',
  },
  profileLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: '4px',
  },
  profileVal: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1F2937',
  },
};