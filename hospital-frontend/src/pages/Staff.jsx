import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import {
  UserCog, Plus, Search, Mail, Phone,
  Building, Calendar, Edit2, Trash2, Shield
} from 'lucide-react';
import { Button, Input, Badge, Modal, ConfirmDialog, Toast, DataTable } from '../components/ui';

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: 'Password@123',
    role: 'NURSE',
    employeeId: '',
    phone: '',
    department: '',
    designation: '',
    joiningDate: '',
    address: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchStaff = async () => {
    try {
      const res = await api.get('/staff');
      setStaffList(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load staff records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      password: 'Password@123',
      role: 'NURSE',
      employeeId: '',
      phone: '',
      department: '',
      designation: '',
      joiningDate: '',
      address: '',
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (staff) => {
    setForm({
      name: staff.user?.name || '',
      email: staff.user?.email || '',
      password: '',
      role: staff.user?.role || 'NURSE',
      employeeId: staff.employeeId || '',
      phone: staff.phone || '',
      department: staff.department || '',
      designation: staff.designation || '',
      joiningDate: staff.joiningDate ? staff.joiningDate.split('T')[0] : '',
      address: staff.address || '',
    });
    setEditingId(staff.id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/staff/${deleteId}`);
      setSuccess('Staff record removed');
      setDeleteId(null);
      fetchStaff();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete staff member');
      setDeleteId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await api.put(`/staff/${editingId}`, form);
        setSuccess('Staff profile updated');
      } else {
        await api.post('/staff', form);
        setSuccess('New staff member registered');
      }
      resetForm();
      fetchStaff();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save staff member');
    }
  };

  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const q = search.toLowerCase();
      const name = s.user?.name?.toLowerCase() || '';
      const email = s.user?.email?.toLowerCase() || '';
      const dept = s.department?.toLowerCase() || '';
      const empId = s.employeeId?.toLowerCase() || '';

      const matchesSearch = name.includes(q) || email.includes(q) || dept.includes(q) || empId.includes(q);
      const matchesRole = !roleFilter || s.user?.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [staffList, search, roleFilter]);

  const columns = [
    {
      header: 'Employee / Name',
      key: 'name',
      render: (s) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#E8F1FD', color: '#1E6FD9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
            {s.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-navy, #0B2A4A)' }}>{s.user?.name}</div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              {s.employeeId ? `ID: ${s.employeeId}` : s.user?.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      key: 'role',
      render: (s) => <Badge variant="primary" size="sm">{s.user?.role || 'STAFF'}</Badge>,
    },
    {
      header: 'Department / Title',
      key: 'department',
      render: (s) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1F2937', fontSize: '13px' }}>{s.designation || 'Staff Member'}</div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>{s.department || 'General'}</div>
        </div>
      ),
    },
    {
      header: 'Contact',
      key: 'phone',
      render: (s) => (
        <div>
          <div style={{ fontSize: '13px', color: '#1F2937' }}>{s.phone || '-'}</div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>{s.user?.email}</div>
        </div>
      ),
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
          <h1 style={styles.title}>Hospital Staff Directory</h1>
          <p style={styles.subtitle}>Manage hospital employees, nurse assignments, and department roles</p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          Add Staff Member
        </Button>
      </div>

      {error && <Toast type="error" message={error} onClose={() => setError('')} style={{ marginBottom: '16px' }} />}
      {success && <Toast type="success" message={success} onClose={() => setSuccess('')} style={{ marginBottom: '16px' }} />}

      <div style={styles.filterBar}>
        <div style={styles.searchWrap}>
          <Search size={16} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by employee name, ID, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={styles.selectFilter}
          aria-label="Filter by role"
        >
          <option value="">All Roles</option>
          <option value="NURSE">Nurse</option>
          <option value="RECEPTIONIST">Receptionist</option>
          <option value="LAB_TECHNICIAN">Lab Technician</option>
          <option value="PHARMACIST">Pharmacist</option>
          <option value="ACCOUNTANT">Accountant</option>
          <option value="ADMIN">Administrator</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filteredStaff}
        loading={loading}
        pageSize={10}
        emptyTitle="No Staff Members Found"
        emptyDescription="No employees matching your search query."
      />

      {/* Add / Edit Staff Modal */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingId ? 'Edit Employee Record' : 'Register Hospital Employee'}
        description="Fill in employee role, department assignment, and contact details."
        maxWidth="600px"
        footer={
          <>
            <Button variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingId ? 'Save Changes' : 'Register Staff'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={styles.modalGrid}>
          <Input
            label="Full Name *"
            name="name"
            required
            placeholder="e.g. Mary Jane"
            value={form.name}
            onChange={handleChange}
            containerStyle={{ gridColumn: 'span 2' }}
          />

          <Input
            label="Email Address *"
            name="email"
            type="email"
            required
            placeholder="e.g. mary@hospital.com"
            value={form.email}
            onChange={handleChange}
          />

          <div>
            <label style={styles.inputLabel}>Role Designation *</label>
            <select name="role" value={form.role} onChange={handleChange} required style={styles.modalSelect}>
              <option value="NURSE">Nurse</option>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="LAB_TECHNICIAN">Lab Technician</option>
              <option value="PHARMACIST">Pharmacist</option>
              <option value="ACCOUNTANT">Accountant</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          <Input
            label={editingId ? 'New Password (Optional)' : 'Default Password *'}
            name="password"
            type="password"
            required={!editingId}
            value={form.password}
            onChange={handleChange}
          />

          <Input
            label="Employee ID"
            name="employeeId"
            placeholder="e.g. EMP-102"
            value={form.employeeId}
            onChange={handleChange}
          />

          <Input
            label="Department"
            name="department"
            placeholder="e.g. Intensive Care Unit"
            value={form.department}
            onChange={handleChange}
          />

          <Input
            label="Job Designation"
            name="designation"
            placeholder="e.g. Senior Staff Nurse"
            value={form.designation}
            onChange={handleChange}
          />

          <Input
            label="Contact Phone"
            name="phone"
            placeholder="e.g. +1 555-0188"
            value={form.phone}
            onChange={handleChange}
          />

          <Input
            label="Joining Date"
            name="joiningDate"
            type="date"
            value={form.joiningDate}
            onChange={handleChange}
          />

          <Input
            label="Home Address"
            name="address"
            placeholder="Residential address"
            value={form.address}
            onChange={handleChange}
            containerStyle={{ gridColumn: 'span 2' }}
          />
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Remove Staff Member"
        message="Are you sure you want to delete this employee record from the system?"
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