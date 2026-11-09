import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import {
  CreditCard, Plus, Search, Printer, DollarSign,
  Trash2, Edit2, CheckCircle2, AlertCircle, Receipt, X
} from 'lucide-react';
import { Button, Input, Badge, Modal, ConfirmDialog, Toast, DataTable } from '../components/ui';

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showPayment, setShowPayment] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [form, setForm] = useState({
    patientId: '',
    serviceType: '',
    labTestId: '',
    customDescription: '',
    customAmount: '',
  });

  const [selectedItems, setSelectedItems] = useState([]);
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'Cash' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fixedServices = [
    { id: 'consultation', name: 'General Consultation', price: 1500 },
    { id: 'followup', name: 'Follow-up Consultation', price: 1000 },
    { id: 'emergency', name: 'Emergency Consultation', price: 3000 },
    { id: 'ecg', name: 'ECG Diagnostic', price: 1200 },
    { id: 'xray', name: 'X-Ray Imaging', price: 2000 },
  ];

  const fetchData = async () => {
    try {
      const [billRes, patRes, testRes] = await Promise.all([
        api.get('/bills'),
        api.get('/patients'),
        api.get('/lab/tests'),
      ]);
      setBills(billRes.data);
      setPatients(patRes.data);
      setLabTests(testRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load billing records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalAmount = selectedItems.reduce((sum, item) => sum + Number(item.price || 0), 0);

  const getBillLabel = (description) => {
    if (!description) return '-';
    try {
      const parsed = JSON.parse(description);
      if (Array.isArray(parsed)) {
        return parsed.map((i) => i.name).join(', ');
      }
    } catch {}
    return description;
  };

  const parseBillItems = (bill) => {
    try {
      const parsed = JSON.parse(bill.description || '');
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item, idx) => ({
          id: item.id || `item-${idx}`,
          name: item.name,
          price: Number(item.price) || 0,
        }));
      }
    } catch {}

    const names = (bill.description || '')
      .split(' + ')
      .map((s) => s.trim())
      .filter(Boolean);

    if (names.length === 0) {
      return [{ id: `existing-${bill.id}`, name: 'Existing Bill', price: Number(bill.amount) || 0 }];
    }

    return names.map((name, idx) => {
      const fixed = fixedServices.find((s) => s.name === name);
      if (fixed) return { ...fixed };
      const lab = labTests.find((t) => t.name === name);
      if (lab) return { id: lab.id, name: lab.name, price: Number(lab.price) || 0 };
      return { id: `legacy-${bill.id}-${idx}`, name, price: names.length === 1 ? Number(bill.amount) || 0 : 0 };
    });
  };

  const printReceipt = (bill) => {
    const itemsLabel = getBillLabel(bill.description);
    const paid = (bill.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0);
    const balance = Number(bill.amount || 0) - paid;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice Receipt - MediCare HMS</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1F2937; margin: 0; background: #FFF; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1E6FD9; padding-bottom: 20px; margin-bottom: 24px; }
            .brand { font-size: 24px; font-weight: 800; color: #0B2A4A; }
            .meta { text-align: right; font-size: 13px; color: #6B7280; }
            .bill-details { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
            .label { font-size: 11px; text-transform: uppercase; color: #9CA3AF; font-weight: 700; }
            .val { font-size: 14px; font-weight: 600; color: #1F2937; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { background: #F8FAFC; text-align: left; padding: 10px 14px; font-size: 12px; border-bottom: 1px solid #E2E8F0; text-transform: uppercase; color: #4B5563; }
            td { padding: 12px 14px; border-bottom: 1px solid #EEF2F6; font-size: 13px; }
            .summary { margin-left: auto; width: 300px; }
            .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
            .total { font-size: 16px; font-weight: 800; color: #0B2A4A; border-top: 2px solid #1E6FD9; padding-top: 10px; margin-top: 6px; }
            .status { display: inline-block; padding: 4px 10px; border-radius: 999px; font-weight: 700; font-size: 12px; }
            .status-paid { background: #DCFCE7; color: #15803D; }
            .status-pending { background: #FEE2E2; color: #B91C1C; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #E2E8F0; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">MediCare Hospital</div>
              <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">Precision Clinical Services & Patient Billing</div>
            </div>
            <div class="meta">
              <div>Invoice #: <strong>INV-${bill.id.slice(0, 8).toUpperCase()}</strong></div>
              <div>Date: ${new Date(bill.createdAt).toLocaleDateString()}</div>
              <div>Status: <span class="status ${bill.status === 'PAID' ? 'status-paid' : 'status-pending'}">${bill.status}</span></div>
            </div>
          </div>
          <div class="bill-details">
            <div>
              <div class="label">Patient Name</div>
              <div class="val">${bill.patient?.name || 'Walk-in Patient'}</div>
            </div>
            <div>
              <div class="label">Contact Phone</div>
              <div class="val">${bill.patient?.phone || '-'}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr><th>Description / Services</th><th style="text-align: right;">Amount</th></tr>
            </thead>
            <tbody>
              <tr><td>${itemsLabel}</td><td style="text-align: right;">Rs. ${Number(bill.amount || 0).toLocaleString()}</td></tr>
            </tbody>
          </table>
          <div class="summary">
            <div class="row"><span>Subtotal:</span><span>Rs. ${Number(bill.amount || 0).toLocaleString()}</span></div>
            <div class="row"><span>Amount Paid:</span><span>Rs. ${paid.toLocaleString()}</span></div>
            <div class="row total"><span>Remaining Balance:</span><span>Rs. ${balance.toLocaleString()}</span></div>
          </div>
          <div class="footer">Thank you for choosing MediCare Hospital. For inquiries contact billing@hospital.com</div>
          <script>window.print();</script>
        </body>
      </html>
    `;

    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) {
      setError('Please allow popups to print receipt');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  const resetForm = () => {
    setForm({
      patientId: '',
      serviceType: '',
      labTestId: '',
      customDescription: '',
      customAmount: '',
    });
    setSelectedItems([]);
    setEditingId(null);
    setShowForm(false);
  };

  const addFixedService = () => {
    if (!form.serviceType) return;
    const service = fixedServices.find((s) => s.id === form.serviceType);
    if (!service) return;

    if (selectedItems.find((i) => i.id === service.id)) {
      setError('This service is already added');
      return;
    }
    setSelectedItems([...selectedItems, service]);
    setForm({ ...form, serviceType: '' });
    setError('');
  };

  const addLabTest = () => {
    if (!form.labTestId) return;
    const test = labTests.find((t) => t.id === form.labTestId);
    if (!test) return;

    if (selectedItems.find((i) => i.id === test.id)) {
      setError('This lab test is already added');
      return;
    }
    setSelectedItems([...selectedItems, { id: test.id, name: test.name, price: Number(test.price) || 0 }]);
    setForm({ ...form, labTestId: '' });
    setError('');
  };

  const addCustom = () => {
    if (!form.customAmount || parseFloat(form.customAmount) <= 0) {
      setError('Enter a valid custom charge amount');
      return;
    }
    setSelectedItems([
      ...selectedItems,
      {
        id: `custom-${Date.now()}`,
        name: form.customDescription || 'Custom Charge',
        price: parseFloat(form.customAmount),
      },
    ]);
    setForm({ ...form, customDescription: '', customAmount: '' });
    setError('');
  };

  const removeItem = (id) => {
    setSelectedItems(selectedItems.filter((i) => i.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.patientId) {
      setError('Please select a patient');
      return;
    }
    if (selectedItems.length === 0) {
      setError('Please add at least one billable service or lab item');
      return;
    }

    const description = JSON.stringify(
      selectedItems.map((i) => ({
        id: i.id,
        name: i.name,
        price: Number(i.price) || 0,
      }))
    );

    try {
      if (editingId) {
        await api.put(`/bills/${editingId}`, {
          amount: totalAmount,
          description,
        });
        setSuccess('Invoice updated successfully');
      } else {
        await api.post('/bills', {
          patientId: form.patientId,
          amount: totalAmount,
          description,
        });
        setSuccess('Invoice generated successfully');
      }
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save invoice');
    }
  };

  const handleEdit = (bill) => {
    setForm({
      patientId: bill.patientId,
      serviceType: '',
      labTestId: '',
      customDescription: '',
      customAmount: '',
    });
    setSelectedItems(parseBillItems(bill));
    setEditingId(bill.id);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/bills/${deleteId}`);
      setSuccess('Invoice deleted successfully');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete bill');
      setDeleteId(null);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post(`/bills/${showPayment}/payments`, {
        amount: parseFloat(paymentForm.amount),
        method: paymentForm.method,
      });
      setSuccess('Payment recorded successfully');
      setPaymentForm({ amount: '', method: 'Cash' });
      setShowPayment(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const q = search.toLowerCase();
      const label = getBillLabel(b.description).toLowerCase();
      const patientName = b.patient?.name?.toLowerCase() || '';

      const matchesSearch = patientName.includes(q) || label.includes(q) || String(b.amount).includes(q);
      const matchesStatus = !statusFilter || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bills, search, statusFilter]);

  const columns = [
    {
      header: 'Invoice # / Patient',
      key: 'patient',
      render: (b) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-navy, #0B2A4A)' }}>
            INV-{b.id.slice(0, 8).toUpperCase()}
          </div>
          <div style={{ fontSize: '13px', color: '#1F2937', fontWeight: 500 }}>
            {b.patient?.name || 'Walk-in Patient'}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>{b.patient?.phone}</div>
        </div>
      ),
    },
    {
      header: 'Billed Services',
      key: 'description',
      render: (b) => (
        <span style={{ fontSize: '13px', color: '#4B5563', maxWidth: '280px', display: 'block' }}>
          {getBillLabel(b.description)}
        </span>
      ),
    },
    {
      header: 'Total Amount',
      key: 'amount',
      render: (b) => (
        <span style={{ fontWeight: 700, color: 'var(--color-navy, #0B2A4A)' }}>
          Rs. {Number(b.amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Paid / Balance',
      key: 'payments',
      render: (b) => {
        const paid = (b.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0);
        const bal = Number(b.amount || 0) - paid;
        return (
          <div>
            <div style={{ fontSize: '13px', color: '#16A34A', fontWeight: 600 }}>
              Paid: Rs. {paid.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: bal > 0 ? '#DC2626' : '#6B7280' }}>
              Bal: Rs. {bal.toLocaleString()}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Status',
      key: 'status',
      render: (b) => {
        if (b.status === 'PAID') return <Badge variant="success" dot size="sm">Paid</Badge>;
        if (b.status === 'PARTIAL') return <Badge variant="warning" dot size="sm">Partial</Badge>;
        return <Badge variant="danger" dot size="sm">Unpaid</Badge>;
      },
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (b) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          {b.status !== 'PAID' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                const paid = (b.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0);
                const remaining = Number(b.amount || 0) - paid;
                setShowPayment(b.id);
                setPaymentForm({ amount: String(remaining), method: 'Cash' });
              }}
            >
              Pay
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={() => printReceipt(b)} icon={Printer} aria-label="Print" />
          <Button size="sm" variant="secondary" onClick={() => handleEdit(b)} icon={Edit2} aria-label="Edit" />
          <Button size="sm" variant="danger" onClick={() => setDeleteId(b.id)} icon={Trash2} aria-label="Delete" />
        </div>
      ),
    },
  ];

  return (
    <Layout>
      {/* Page Header */}
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Hospital Billing & Invoices</h1>
          <p style={styles.subtitle}>Generate itemized invoices, record patient settlements, and print receipts</p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          Create New Invoice
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
            placeholder="Search patient, invoice ID, or services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.selectFilter}
          aria-label="Filter by invoice status"
        >
          <option value="">All Statuses</option>
          <option value="PAID">Paid</option>
          <option value="PARTIAL">Partial</option>
          <option value="PENDING">Pending / Unpaid</option>
        </select>
      </div>

      {/* Invoices Table */}
      <DataTable
        columns={columns}
        data={filteredBills}
        loading={loading}
        pageSize={10}
        emptyTitle="No Invoices Found"
        emptyDescription="No invoices matching your search parameters."
      />

      {/* Invoice Generator Modal */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingId ? 'Edit Patient Invoice' : 'Generate Patient Invoice'}
        description="Select billable clinical services, diagnostic tests, or manual charges."
        maxWidth="680px"
        footer={
          <>
            <Button variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingId ? 'Update Invoice' : 'Save & Issue Invoice'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={styles.inputLabel}>Patient *</label>
            <select
              name="patientId"
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

          {/* Add Services Section */}
          <div style={styles.serviceAddCard}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-navy, #0B2A4A)', marginBottom: '10px' }}>
              Add Line Items
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Standard Clinical Service</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select
                    value={form.serviceType}
                    onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                    style={styles.modalSelect}
                  >
                    <option value="">-- Select Service --</option>
                    {fixedServices.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} (Rs. {s.price})</option>
                    ))}
                  </select>
                  <Button size="sm" variant="secondary" onClick={addFixedService}>Add</Button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Laboratory Diagnostic</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select
                    value={form.labTestId}
                    onChange={(e) => setForm({ ...form, labTestId: e.target.value })}
                    style={styles.modalSelect}
                  >
                    <option value="">-- Select Lab Test --</option>
                    {labTests.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} (Rs. {t.price})</option>
                    ))}
                  </select>
                  <Button size="sm" variant="secondary" onClick={addLabTest}>Add</Button>
                </div>
              </div>
            </div>

            {/* Custom charge */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Input
                  label="Custom Service / Medication"
                  placeholder="e.g. Ward Admission, Syringe"
                  value={form.customDescription}
                  onChange={(e) => setForm({ ...form, customDescription: e.target.value })}
                />
              </div>
              <div style={{ width: '140px' }}>
                <Input
                  label="Amount (Rs.)"
                  type="number"
                  placeholder="0.00"
                  value={form.customAmount}
                  onChange={(e) => setForm({ ...form, customAmount: e.target.value })}
                />
              </div>
              <Button size="md" variant="secondary" onClick={addCustom} style={{ marginBottom: '2px' }}>
                Add Custom
              </Button>
            </div>
          </div>

          {/* Selected items list */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1F2937' }}>
                Invoice Items ({selectedItems.length})
              </span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-navy, #0B2A4A)' }}>
                Total: Rs. {totalAmount.toLocaleString()}
              </span>
            </div>

            {selectedItems.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '8px', color: '#9CA3AF', fontSize: '13px' }}>
                No line items added yet. Please add at least one item above.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                {selectedItems.map((item) => (
                  <div key={item.id} style={styles.itemRow}>
                    <span style={{ fontWeight: 600, color: '#1F2937', fontSize: '13px' }}>{item.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-navy, #0B2A4A)', fontSize: '13px' }}>
                        Rs. {Number(item.price || 0).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove item"
                        style={{ border: 'none', background: 'transparent', color: '#DC2626', cursor: 'pointer', padding: '2px' }}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={Boolean(showPayment)}
        onClose={() => setShowPayment(null)}
        title="Record Payment Settlement"
        description="Enter payment amount received from the patient."
        maxWidth="440px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowPayment(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handlePayment}>
              Record Payment
            </Button>
          </>
        }
      >
        <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Payment Amount (Rs.) *"
            type="number"
            required
            placeholder="e.g. 1500"
            value={paymentForm.amount}
            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
            autoFocus
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={styles.inputLabel}>Payment Method</label>
            <select
              value={paymentForm.method}
              onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
              style={styles.modalSelect}
            >
              <option value="Cash">Cash</option>
              <option value="Card">Credit / Debit Card</option>
              <option value="Insurance">Insurance Claim</option>
              <option value="Online">Online Transfer</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? Associated payment records will also be removed."
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
  serviceAddCard: {
    backgroundColor: 'var(--bg-muted, #F8FAFC)',
    border: '1px solid var(--border-color, #E2E8F0)',
    borderRadius: '10px',
    padding: '14px',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: 'var(--bg-muted, #F8FAFC)',
    borderRadius: '6px',
    border: '1px solid #EEF2F6',
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