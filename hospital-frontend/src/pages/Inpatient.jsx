import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import {
  BedDouble, Plus, Search, Building2, User,
  CheckCircle2, Clock, LogOut, Trash2, Edit2, ShieldAlert
} from 'lucide-react';
import { Button, Input, Badge, Modal, ConfirmDialog, Toast, DataTable, Tabs } from '../components/ui';

export default function Inpatient() {
  const [wards, setWards] = useState([]);
  const [beds, setBeds] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('admissions'); // 'admissions' | 'wards' | 'beds'
  const [search, setSearch] = useState('');

  const [showWardModal, setShowWardModal] = useState(false);
  const [showBedModal, setShowBedModal] = useState(false);
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [dischargeModalId, setDischargeModalId] = useState(null);
  const [dischargeNotes, setDischargeNotes] = useState('');
  const [deleteWardId, setDeleteWardId] = useState(null);
  const [deleteBedId, setDeleteBedId] = useState(null);

  const [wardForm, setWardForm] = useState({ name: '', description: '', totalBeds: '' });
  const [bedForm, setBedForm] = useState({ wardId: '', bedNumber: '' });
  const [admitForm, setAdmitForm] = useState({
    patientId: '',
    bedId: '',
    admittedBy: '',
    reason: '',
    notes: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [wardRes, bedRes, admRes, patRes, docRes] = await Promise.all([
        api.get('/inpatient/wards'),
        api.get('/inpatient/beds'),
        api.get('/inpatient/admissions'),
        api.get('/patients'),
        api.get('/doctors'),
      ]);
      setWards(wardRes.data);
      setBeds(bedRes.data);
      setAdmissions(admRes.data);
      setPatients(patRes.data);
      setDoctors(docRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load inpatient data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWardSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/inpatient/wards', {
        ...wardForm,
        totalBeds: parseInt(wardForm.totalBeds, 10) || 0,
      });
      setSuccess('Ward registered successfully');
      setShowWardModal(false);
      setWardForm({ name: '', description: '', totalBeds: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ward');
    }
  };

  const confirmDeleteWard = async () => {
    try {
      await api.delete(`/inpatient/wards/${deleteWardId}`);
      setSuccess('Ward deleted');
      setDeleteWardId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete ward');
      setDeleteWardId(null);
    }
  };

  const handleBedSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/inpatient/beds', bedForm);
      setSuccess('Bed added to ward');
      setShowBedModal(false);
      setBedForm({ wardId: '', bedNumber: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create bed');
    }
  };

  const confirmDeleteBed = async () => {
    try {
      await api.delete(`/inpatient/beds/${deleteBedId}`);
      setSuccess('Bed removed');
      setDeleteBedId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete bed');
      setDeleteBedId(null);
    }
  };

  const handleAdmitSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/inpatient/admit', admitForm);
      setSuccess('Patient admitted to bed successfully');
      setShowAdmitModal(false);
      setAdmitForm({ patientId: '', bedId: '', admittedBy: '', reason: '', notes: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to admit patient');
    }
  };

  const handleDischargeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.put(`/inpatient/admissions/${dischargeModalId}/discharge`, {
        dischargeNotes,
      });
      setSuccess('Patient discharged and bed released');
      setDischargeModalId(null);
      setDischargeNotes('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to discharge patient');
    }
  };

  const availableBeds = beds.filter((b) => b.isOccupied === false);

  const admissionColumns = [
    {
      header: 'Patient / Ref ID',
      key: 'patient',
      render: (a) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-navy, #0B2A4A)' }}>{a.patient?.name}</div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Phone: {a.patient?.phone || '-'}</div>
        </div>
      ),
    },
    {
      header: 'Ward / Bed',
      key: 'bed',
      render: (a) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1F2937' }}>Bed {a.bed?.bedNumber}</div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>{a.bed?.ward?.name || 'General Ward'}</div>
        </div>
      ),
    },
    {
      header: 'Admit Date',
      key: 'admissionDate',
      render: (a) => (
        <span style={{ fontSize: '13px', color: '#1F2937' }}>
          {new Date(a.admissionDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Admission Status',
      key: 'status',
      render: (a) => {
        if (a.status === 'ADMITTED') return <Badge variant="warning" dot size="sm">Admitted</Badge>;
        return <Badge variant="success" dot size="sm">Discharged</Badge>;
      },
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (a) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          {a.status === 'ADMITTED' && (
            <Button
              size="sm"
              variant="secondary"
              icon={LogOut}
              onClick={() => {
                setDischargeModalId(a.id);
                setDischargeNotes('');
              }}
            >
              Discharge
            </Button>
          )}
        </div>
      ),
    },
  ];

  const wardColumns = [
    {
      header: 'Ward Name',
      key: 'name',
      render: (w) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-navy, #0B2A4A)' }}>{w.name}</div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>{w.description || 'Clinical Ward'}</div>
        </div>
      ),
    },
    {
      header: 'Total Capacity',
      key: 'totalBeds',
      render: (w) => <Badge variant="primary" size="sm">{w.totalBeds} Beds</Badge>,
    },
    {
      header: 'Registered Beds',
      key: 'bedsCount',
      render: (w) => (
        <span style={{ fontSize: '13px', color: '#4B5563' }}>
          {w.beds?.length || 0} configured
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (w) => (
        <Button size="sm" variant="danger" onClick={() => setDeleteWardId(w.id)} icon={Trash2} aria-label="Delete" />
      ),
    },
  ];

  const bedColumns = [
    {
      header: 'Bed Number',
      key: 'bedNumber',
      render: (b) => <span style={{ fontWeight: 700, color: 'var(--color-navy, #0B2A4A)' }}>Bed {b.bedNumber}</span>,
    },
    {
      header: 'Assigned Ward',
      key: 'ward',
      render: (b) => <span style={{ fontSize: '13px', color: '#1F2937' }}>{b.ward?.name || '-'}</span>,
    },
    {
      header: 'Occupancy Status',
      key: 'isOccupied',
      render: (b) => {
        if (b.isOccupied) return <Badge variant="danger" dot size="sm">Occupied</Badge>;
        return <Badge variant="success" dot size="sm">Available</Badge>;
      },
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (b) => (
        <Button size="sm" variant="danger" onClick={() => setDeleteBedId(b.id)} icon={Trash2} aria-label="Delete" />
      ),
    },
  ];

  return (
    <Layout>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Inpatient Management</h1>
          <p style={styles.subtitle}>Manage hospital wards, bed allocations, admissions, and discharges</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" icon={Plus} onClick={() => setShowWardModal(true)}>
            Add Ward
          </Button>
          <Button variant="secondary" icon={Plus} onClick={() => setShowBedModal(true)}>
            Add Bed
          </Button>
          <Button variant="primary" icon={BedDouble} onClick={() => setShowAdmitModal(true)}>
            Admit Patient
          </Button>
        </div>
      </div>

      {error && <Toast type="error" message={error} onClose={() => setError('')} style={{ marginBottom: '16px' }} />}
      {success && <Toast type="success" message={success} onClose={() => setSuccess('')} style={{ marginBottom: '16px' }} />}

      <Tabs
        tabs={[
          { id: 'admissions', label: 'Active Admissions', count: admissions.length },
          { id: 'wards', label: 'Hospital Wards', count: wards.length },
          { id: 'beds', label: 'Bed Inventory', count: beds.length },
        ]}
        activeTab={tab}
        onChange={setTab}
        style={{ marginBottom: '16px' }}
      />

      {tab === 'admissions' && (
        <DataTable
          columns={admissionColumns}
          data={admissions}
          loading={loading}
          pageSize={10}
          emptyTitle="No Active Admissions"
          emptyDescription="There are currently no patients admitted to any hospital wards."
        />
      )}

      {tab === 'wards' && (
        <DataTable
          columns={wardColumns}
          data={wards}
          loading={loading}
          pageSize={10}
          emptyTitle="No Wards Configured"
          emptyDescription="Register hospital wards to start allocating beds."
        />
      )}

      {tab === 'beds' && (
        <DataTable
          columns={bedColumns}
          data={beds}
          loading={loading}
          pageSize={10}
          emptyTitle="No Beds Configured"
          emptyDescription="Add bed units assigned to registered wards."
        />
      )}

      {/* Admit Patient Modal */}
      <Modal
        isOpen={showAdmitModal}
        onClose={() => setShowAdmitModal(false)}
        title="Inpatient Admission"
        description="Assign a patient to an available hospital bed."
        maxWidth="540px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAdmitModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAdmitSubmit}>Confirm Admission</Button>
          </>
        }
      >
        <form onSubmit={handleAdmitSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={styles.inputLabel}>Patient *</label>
            <select
              value={admitForm.patientId}
              onChange={(e) => setAdmitForm({ ...admitForm, patientId: e.target.value })}
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
            <label style={styles.inputLabel}>Available Bed *</label>
            <select
              value={admitForm.bedId}
              onChange={(e) => setAdmitForm({ ...admitForm, bedId: e.target.value })}
              required
              style={styles.modalSelect}
            >
              <option value="">-- Select Free Bed ({availableBeds.length} available) --</option>
              {availableBeds.map((b) => (
                <option key={b.id} value={b.id}>
                  Bed {b.bedNumber} ({b.ward?.name || 'General Ward'})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Admitting Physician / Staff Name"
            placeholder="e.g. Dr. Silva"
            value={admitForm.admittedBy}
            onChange={(e) => setAdmitForm({ ...admitForm, admittedBy: e.target.value })}
          />

          <Input
            label="Admission Reason *"
            required
            placeholder="e.g. Post-operative recovery, acute fever"
            value={admitForm.reason}
            onChange={(e) => setAdmitForm({ ...admitForm, reason: e.target.value })}
          />
        </form>
      </Modal>

      {/* Discharge Modal */}
      <Modal
        isOpen={Boolean(dischargeModalId)}
        onClose={() => setDischargeModalId(null)}
        title="Discharge Patient"
        description="Record discharge summary notes and release the bed back to availability."
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDischargeModalId(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleDischargeSubmit}>Confirm Discharge</Button>
          </>
        }
      >
        <form onSubmit={handleDischargeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input
            label="Discharge Summary & Medical Advice"
            placeholder="e.g. Stable condition, prescribed medications dispensed"
            value={dischargeNotes}
            onChange={(e) => setDischargeNotes(e.target.value)}
          />
        </form>
      </Modal>

      {/* Add Ward Modal */}
      <Modal
        isOpen={showWardModal}
        onClose={() => setShowWardModal(false)}
        title="Register Hospital Ward"
        description="Define ward title, description, and total bed capacity."
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowWardModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleWardSubmit}>Save Ward</Button>
          </>
        }
      >
        <form onSubmit={handleWardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Ward Name *"
            required
            placeholder="e.g. Pediatric Ward B"
            value={wardForm.name}
            onChange={(e) => setWardForm({ ...wardForm, name: e.target.value })}
          />
          <Input
            label="Total Beds *"
            type="number"
            required
            placeholder="e.g. 20"
            value={wardForm.totalBeds}
            onChange={(e) => setWardForm({ ...wardForm, totalBeds: e.target.value })}
          />
          <Input
            label="Description"
            placeholder="e.g. Second floor east wing"
            value={wardForm.description}
            onChange={(e) => setWardForm({ ...wardForm, description: e.target.value })}
          />
        </form>
      </Modal>

      {/* Add Bed Modal */}
      <Modal
        isOpen={showBedModal}
        onClose={() => setShowBedModal(false)}
        title="Add Bed Unit"
        description="Assign a bed number to a registered ward."
        maxWidth="440px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowBedModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleBedSubmit}>Add Bed</Button>
          </>
        }
      >
        <form onSubmit={handleBedSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={styles.inputLabel}>Ward *</label>
            <select
              value={bedForm.wardId}
              onChange={(e) => setBedForm({ ...bedForm, wardId: e.target.value })}
              required
              style={styles.modalSelect}
            >
              <option value="">-- Select Ward --</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <Input
            label="Bed Number *"
            required
            placeholder="e.g. B-101"
            value={bedForm.bedNumber}
            onChange={(e) => setBedForm({ ...bedForm, bedNumber: e.target.value })}
          />
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteWardId)}
        onClose={() => setDeleteWardId(null)}
        onConfirm={confirmDeleteWard}
        title="Delete Ward"
        message="Are you sure you want to remove this ward and all associated bed configurations?"
      />

      <ConfirmDialog
        isOpen={Boolean(deleteBedId)}
        onClose={() => setDeleteBedId(null)}
        onConfirm={confirmDeleteBed}
        title="Delete Bed"
        message="Are you sure you want to remove this bed unit?"
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