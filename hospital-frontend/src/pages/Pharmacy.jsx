import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import {
  Pill, Plus, Search, AlertTriangle, AlertCircle,
  CheckCircle2, Clock, Edit2, Trash2, Send
} from 'lucide-react';
import { Button, Input, Badge, Modal, ConfirmDialog, Toast, DataTable, Tabs } from '../components/ui';

export default function Pharmacy() {
  const [medicines, setMedicines] = useState([]);
  const [dispenses, setDispenses] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('medicines'); // 'medicines' | 'dispenses'
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  const [medicineForm, setMedicineForm] = useState({
    name: '',
    genericName: '',
    category: '',
    unit: 'Tablet',
    price: '',
    stockQuantity: '',
    expiryDate: '',
    manufacturer: '',
  });

  const [dispenseForm, setDispenseForm] = useState({
    medicineId: '',
    patientId: '',
    quantity: '',
    prescribedBy: '',
    notes: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [medRes, disRes, patRes, docRes] = await Promise.all([
        api.get('/pharmacy/medicines'),
        api.get('/pharmacy/dispenses'),
        api.get('/patients'),
        api.get('/doctors'),
      ]);
      setMedicines(medRes.data);
      setDispenses(disRes.data);
      setPatients(patRes.data);
      setDoctors(docRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load pharmacy data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetMedicineForm = () => {
    setMedicineForm({
      name: '',
      genericName: '',
      category: '',
      unit: 'Tablet',
      price: '',
      stockQuantity: '',
      expiryDate: '',
      manufacturer: '',
    });
    setEditingId(null);
    setShowMedicineModal(false);
  };

  const handleMedicineSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      ...medicineForm,
      price: parseFloat(medicineForm.price),
      stockQuantity: parseInt(medicineForm.stockQuantity, 10),
    };

    try {
      if (editingId) {
        await api.put(`/pharmacy/medicines/${editingId}`, payload);
        setSuccess('Medicine details updated successfully');
      } else {
        await api.post('/pharmacy/medicines', payload);
        setSuccess('New medication added to inventory');
      }
      resetMedicineForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save medication');
    }
  };

  const handleEditMedicine = (med) => {
    setMedicineForm({
      name: med.name,
      genericName: med.genericName || '',
      category: med.category || '',
      unit: med.unit || 'Tablet',
      price: String(med.price),
      stockQuantity: String(med.stockQuantity),
      expiryDate: med.expiryDate ? med.expiryDate.split('T')[0] : '',
      manufacturer: med.manufacturer || '',
    });
    setEditingId(med.id);
    setShowMedicineModal(true);
  };

  const confirmDeleteMedicine = async () => {
    try {
      await api.delete(`/pharmacy/medicines/${deleteId}`);
      setSuccess('Medication removed from inventory');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete medication');
      setDeleteId(null);
    }
  };

  const handleDispenseSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/pharmacy/dispense', {
        ...dispenseForm,
        quantity: parseInt(dispenseForm.quantity, 10),
      });
      setSuccess('Prescription medication dispensed and stock updated');
      setShowDispenseModal(false);
      setDispenseForm({ medicineId: '', patientId: '', quantity: '', prescribedBy: '', notes: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispense medication');
    }
  };

  const getStockStatus = (stock) => {
    if (stock <= 0) return { label: 'Out of Stock', variant: 'danger' };
    if (stock < 20) return { label: `Low: ${stock}`, variant: 'warning' };
    return { label: `In Stock: ${stock}`, variant: 'success' };
  };

  const getExpiryStatus = (dateStr) => {
    if (!dateStr) return null;
    const expiry = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return <Badge variant="danger" size="sm">Expired</Badge>;
    if (diffDays <= 30) return <Badge variant="warning" size="sm">Expires soon</Badge>;
    return <span style={{ fontSize: '13px', color: '#4B5563' }}>{expiry.toLocaleDateString()}</span>;
  };

  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const q = search.toLowerCase();
      const matchesSearch =
        m.name?.toLowerCase().includes(q) ||
        m.genericName?.toLowerCase().includes(q) ||
        m.category?.toLowerCase().includes(q);

      if (stockFilter === 'low') return matchesSearch && m.stockQuantity < 20 && m.stockQuantity > 0;
      if (stockFilter === 'out') return matchesSearch && m.stockQuantity <= 0;
      return matchesSearch;
    });
  }, [medicines, search, stockFilter]);

  const medicineColumns = [
    {
      header: 'Medication Name',
      key: 'name',
      render: (m) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-navy, #0B2A4A)' }}>{m.name}</div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>
            {m.genericName ? `Generic: ${m.genericName}` : m.category || 'General'}
          </div>
        </div>
      ),
    },
    {
      header: 'Category / Unit',
      key: 'category',
      render: (m) => (
        <span style={{ fontSize: '13px', color: '#1F2937' }}>
          {m.category || 'General'} · <Badge variant="neutral" size="sm">{m.unit || 'Unit'}</Badge>
        </span>
      ),
    },
    {
      header: 'Unit Price',
      key: 'price',
      render: (m) => (
        <span style={{ fontWeight: 700, color: 'var(--color-navy, #0B2A4A)' }}>
          Rs. {Number(m.price || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Stock Level',
      key: 'stockQuantity',
      render: (m) => {
        const s = getStockStatus(m.stockQuantity);
        return <Badge variant={s.variant} dot size="sm">{s.label}</Badge>;
      },
    },
    {
      header: 'Expiry Date',
      key: 'expiryDate',
      render: (m) => getExpiryStatus(m.expiryDate),
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (m) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setDispenseForm({ ...dispenseForm, medicineId: m.id });
              setShowDispenseModal(true);
            }}
          >
            Dispense
          </Button>
          <Button size="sm" variant="secondary" onClick={() => handleEditMedicine(m)} icon={Edit2} aria-label="Edit" />
          <Button size="sm" variant="danger" onClick={() => setDeleteId(m.id)} icon={Trash2} aria-label="Delete" />
        </div>
      ),
    },
  ];

  const dispenseColumns = [
    {
      header: 'Dispensed Drug',
      key: 'medicine',
      render: (d) => (
        <div style={{ fontWeight: 600, color: 'var(--color-navy, #0B2A4A)' }}>
          {d.medicine?.name || 'Medication'}
        </div>
      ),
    },
    {
      header: 'Patient',
      key: 'patient',
      render: (d) => <span style={{ fontSize: '13px', color: '#1F2937' }}>{d.patient?.name || 'Walk-in'}</span>,
    },
    {
      header: 'Qty Dispensed',
      key: 'quantity',
      render: (d) => <Badge variant="primary" size="sm">{d.quantity} Units</Badge>,
    },
    {
      header: 'Prescribing Physician',
      key: 'prescribedBy',
      render: (d) => <span style={{ fontSize: '13px', color: '#4B5563' }}>{d.prescribedBy || '-'}</span>,
    },
    {
      header: 'Dispense Date',
      key: 'createdAt',
      render: (d) => (
        <span style={{ fontSize: '13px', color: '#6B7280' }}>
          {new Date(d.createdAt).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <Layout>
      {/* Header */}
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Pharmacy & Drug Inventory</h1>
          <p style={styles.subtitle}>Track medicine inventory, monitor expiry alerts, and dispense clinical prescriptions</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" icon={Send} onClick={() => setShowDispenseModal(true)}>
            Dispense Prescription
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => {
            resetMedicineForm();
            setShowMedicineModal(true);
          }}>
            Add Medication
          </Button>
        </div>
      </div>

      {error && <Toast type="error" message={error} onClose={() => setError('')} style={{ marginBottom: '16px' }} />}
      {success && <Toast type="success" message={success} onClose={() => setSuccess('')} style={{ marginBottom: '16px' }} />}

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'medicines', label: 'Medicine Inventory', count: medicines.length },
          { id: 'dispenses', label: 'Dispense History', count: dispenses.length },
        ]}
        activeTab={tab}
        onChange={setTab}
        style={{ marginBottom: '16px' }}
      />

      {tab === 'medicines' && (
        <>
          {/* Filter Bar */}
          <div style={styles.filterBar}>
            <div style={styles.searchWrap}>
              <Search size={16} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by drug name, generic name, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              style={styles.selectFilter}
              aria-label="Filter by stock alert"
            >
              <option value="">All Stock Levels</option>
              <option value="low">Low Stock (&lt; 20)</option>
              <option value="out">Out of Stock (0)</option>
            </select>
          </div>

          <DataTable
            columns={medicineColumns}
            data={filteredMedicines}
            loading={loading}
            pageSize={10}
            emptyTitle="No Medications in Inventory"
            emptyDescription="No drugs match your search or inventory filter."
          />
        </>
      )}

      {tab === 'dispenses' && (
        <DataTable
          columns={dispenseColumns}
          data={dispenses}
          loading={loading}
          pageSize={10}
          emptyTitle="No Dispense History"
          emptyDescription="There are no prescription dispensing logs recorded yet."
        />
      )}

      {/* Add / Edit Medicine Modal */}
      <Modal
        isOpen={showMedicineModal}
        onClose={resetMedicineForm}
        title={editingId ? 'Edit Medication' : 'Add Medication to Inventory'}
        description="Enter drug details, pricing, dosage unit, and stock."
        maxWidth="600px"
        footer={
          <>
            <Button variant="secondary" onClick={resetMedicineForm}>Cancel</Button>
            <Button variant="primary" onClick={handleMedicineSubmit}>
              {editingId ? 'Save Changes' : 'Add Medication'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleMedicineSubmit} style={styles.modalGrid}>
          <Input
            label="Medication Name *"
            required
            placeholder="e.g. Amoxicillin 500mg"
            value={medicineForm.name}
            onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })}
            containerStyle={{ gridColumn: 'span 2' }}
          />

          <Input
            label="Generic Name"
            placeholder="e.g. Amoxicillin"
            value={medicineForm.genericName}
            onChange={(e) => setMedicineForm({ ...medicineForm, genericName: e.target.value })}
          />

          <Input
            label="Category"
            placeholder="e.g. Antibiotics, Analgesics"
            value={medicineForm.category}
            onChange={(e) => setMedicineForm({ ...medicineForm, category: e.target.value })}
          />

          <div>
            <label style={styles.inputLabel}>Unit Form</label>
            <select
              value={medicineForm.unit}
              onChange={(e) => setMedicineForm({ ...medicineForm, unit: e.target.value })}
              style={styles.modalSelect}
            >
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Syrup">Syrup</option>
              <option value="Injection">Injection</option>
              <option value="Ointment">Ointment</option>
              <option value="Drops">Drops</option>
            </select>
          </div>

          <Input
            label="Price per Unit (Rs.) *"
            type="number"
            step="0.01"
            required
            placeholder="e.g. 25.00"
            value={medicineForm.price}
            onChange={(e) => setMedicineForm({ ...medicineForm, price: e.target.value })}
          />

          <Input
            label="Initial Stock Quantity *"
            type="number"
            required
            placeholder="e.g. 100"
            value={medicineForm.stockQuantity}
            onChange={(e) => setMedicineForm({ ...medicineForm, stockQuantity: e.target.value })}
          />

          <Input
            label="Expiry Date"
            type="date"
            value={medicineForm.expiryDate}
            onChange={(e) => setMedicineForm({ ...medicineForm, expiryDate: e.target.value })}
          />

          <Input
            label="Manufacturer / Supplier"
            placeholder="e.g. Pfizer, Novartis"
            value={medicineForm.manufacturer}
            onChange={(e) => setMedicineForm({ ...medicineForm, manufacturer: e.target.value })}
            containerStyle={{ gridColumn: 'span 2' }}
          />
        </form>
      </Modal>

      {/* Dispense Medication Modal */}
      <Modal
        isOpen={showDispenseModal}
        onClose={() => setShowDispenseModal(false)}
        title="Dispense Prescription"
        description="Select drug, recipient patient, and quantity to deduct from pharmacy stock."
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDispenseModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleDispenseSubmit}>Confirm & Dispense</Button>
          </>
        }
      >
        <form onSubmit={handleDispenseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={styles.inputLabel}>Select Drug *</label>
            <select
              value={dispenseForm.medicineId}
              onChange={(e) => setDispenseForm({ ...dispenseForm, medicineId: e.target.value })}
              required
              style={styles.modalSelect}
            >
              <option value="">-- Choose Medication --</option>
              {medicines.map((m) => (
                <option key={m.id} value={m.id} disabled={m.stockQuantity <= 0}>
                  {m.name} (Stock: {m.stockQuantity}) - Rs. {m.price}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.inputLabel}>Patient (Optional)</label>
            <select
              value={dispenseForm.patientId}
              onChange={(e) => setDispenseForm({ ...dispenseForm, patientId: e.target.value })}
              style={styles.modalSelect}
            >
              <option value="">-- Walk-in / Direct Sale --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
              ))}
            </select>
          </div>

          <Input
            label="Quantity to Dispense *"
            type="number"
            min="1"
            required
            placeholder="e.g. 10"
            value={dispenseForm.quantity}
            onChange={(e) => setDispenseForm({ ...dispenseForm, quantity: e.target.value })}
          />

          <Input
            label="Prescribed By (Doctor Name)"
            placeholder="e.g. Dr. Silva"
            value={dispenseForm.prescribedBy}
            onChange={(e) => setDispenseForm({ ...dispenseForm, prescribedBy: e.target.value })}
          />

          <Input
            label="Dosage Instructions / Notes"
            placeholder="e.g. 1 tablet after meals twice daily"
            value={dispenseForm.notes}
            onChange={(e) => setDispenseForm({ ...dispenseForm, notes: e.target.value })}
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDeleteMedicine}
        title="Remove Medication"
        message="Are you sure you want to delete this drug from inventory?"
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