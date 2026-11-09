import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import {
  FlaskConical, Plus, Search, Printer, CheckCircle2,
  Clock, AlertCircle, FileText, Edit2, Trash2, TestTube2
} from 'lucide-react';
import { Button, Input, Badge, Modal, ConfirmDialog, Toast, DataTable, Tabs } from '../components/ui';

export default function Laboratory() {
  const [tests, setTests] = useState([]);
  const [requests, setRequests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('requests'); // 'requests' | 'tests'
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(null);
  const [search, setSearch] = useState('');
  const [editingTestId, setEditingTestId] = useState(null);
  const [deleteTestId, setDeleteTestId] = useState(null);

  const [requestForm, setRequestForm] = useState({
    patientId: '',
    doctorId: '',
    testId: '',
    notes: '',
  });

  const [testForm, setTestForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });

  const [resultForm, setResultForm] = useState({
    result: '',
    remarks: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [testRes, reqRes, patRes, docRes] = await Promise.all([
        api.get('/lab/tests'),
        api.get('/lab/requests'),
        api.get('/patients'),
        api.get('/doctors'),
      ]);
      setTests(testRes.data);
      setRequests(reqRes.data);
      setPatients(patRes.data);
      setDoctors(docRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load laboratory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/lab/requests', requestForm);
      setSuccess('Lab test requested successfully');
      setShowRequestModal(false);
      setRequestForm({ patientId: '', doctorId: '', testId: '', notes: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request lab test');
    }
  };

  const handleSampleCollected = async (id) => {
    try {
      await api.put(`/lab/requests/${id}`, { status: 'SAMPLE_COLLECTED' });
      setSuccess('Sample marked as collected');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update sample status');
    }
  };

  const handleResultSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.put(`/lab/requests/${showResultModal}`, {
        status: 'COMPLETED',
        result: resultForm.result,
        remarks: resultForm.remarks,
      });
      setSuccess('Lab test results recorded successfully');
      setShowResultModal(null);
      setResultForm({ result: '', remarks: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save test results');
    }
  };

  const handleTestSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingTestId) {
        await api.put(`/lab/tests/${editingTestId}`, {
          ...testForm,
          price: parseFloat(testForm.price),
        });
        setSuccess('Test catalog item updated');
      } else {
        await api.post('/lab/tests', {
          ...testForm,
          price: parseFloat(testForm.price),
        });
        setSuccess('New test added to catalog');
      }
      setShowTestModal(false);
      setEditingTestId(null);
      setTestForm({ name: '', description: '', price: '', category: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save test catalog item');
    }
  };

  const handleEditTest = (test) => {
    setTestForm({
      name: test.name,
      description: test.description || '',
      price: String(test.price),
      category: test.category || '',
    });
    setEditingTestId(test.id);
    setShowTestModal(true);
  };

  const confirmDeleteTest = async () => {
    try {
      await api.delete(`/lab/tests/${deleteTestId}`);
      setSuccess('Test catalog item deleted');
      setDeleteTestId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete test');
      setDeleteTestId(null);
    }
  };

  const printReport = (req) => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laboratory Diagnostic Report - MediCare</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1F2937; margin: 0; }
            .header { border-bottom: 2px solid #1E6FD9; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; }
            .brand { font-size: 24px; font-weight: 800; color: #0B2A4A; }
            .meta { text-align: right; font-size: 13px; color: #6B7280; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
            .label { font-size: 11px; text-transform: uppercase; color: #9CA3AF; font-weight: 700; }
            .val { font-size: 14px; font-weight: 600; color: #1F2937; margin-top: 2px; }
            .report-box { border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px; background: #F8FAFC; margin-bottom: 24px; }
            .report-title { font-size: 15px; font-weight: 700; color: #0B2A4A; margin-bottom: 12px; }
            .footer { margin-top: 40px; font-size: 12px; color: #9CA3AF; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">MediCare Hospital Diagnostics</div>
              <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">Laboratory Investigation Report</div>
            </div>
            <div class="meta">
              <div>Report ID: <strong>LAB-${req.id.slice(0, 8).toUpperCase()}</strong></div>
              <div>Date: ${new Date().toLocaleDateString()}</div>
            </div>
          </div>
          <div class="grid">
            <div><div class="label">Patient Name</div><div class="val">${req.patient?.name || '-'}</div></div>
            <div><div class="label">Referred By</div><div class="val">${req.doctor?.user?.name || '-'}</div></div>
            <div><div class="label">Test Performed</div><div class="val">${req.test?.name || '-'}</div></div>
            <div><div class="label">Status</div><div class="val">${req.status}</div></div>
          </div>
          <div class="report-box">
            <div class="report-title">Findings & Observations</div>
            <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${req.result || 'No results entered'}</div>
          </div>
          ${req.remarks ? `<div class="report-box"><div class="report-title">Pathologist Remarks</div><div>${req.remarks}</div></div>` : ''}
          <div class="footer">Electronic signature verified. Clinical laboratory certified.</div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) {
      setError('Please allow popups to print report');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  const requestColumns = [
    {
      header: 'Patient / Ref Doctor',
      key: 'patient',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-navy, #0B2A4A)' }}>{r.patient?.name}</div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Ref: {r.doctor?.user?.name || 'Assigned Doctor'}</div>
        </div>
      ),
    },
    {
      header: 'Test Requested',
      key: 'test',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1F2937' }}>{r.test?.name}</div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Rs. {r.test?.price}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (r) => {
        if (r.status === 'COMPLETED') return <Badge variant="success" dot size="sm">Completed</Badge>;
        if (r.status === 'SAMPLE_COLLECTED') return <Badge variant="warning" dot size="sm">Sample Collected</Badge>;
        return <Badge variant="info" dot size="sm">Pending Sample</Badge>;
      },
    },
    {
      header: 'Requested Date',
      key: 'createdAt',
      render: (r) => (
        <span style={{ fontSize: '13px', color: '#4B5563' }}>
          {new Date(r.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          {r.status === 'PENDING' && (
            <Button size="sm" variant="secondary" onClick={() => handleSampleCollected(r.id)}>
              Collect Sample
            </Button>
          )}
          {r.status === 'SAMPLE_COLLECTED' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setShowResultModal(r.id);
                setResultForm({ result: r.result || '', remarks: r.remarks || '' });
              }}
            >
              Enter Result
            </Button>
          )}
          {r.status === 'COMPLETED' && (
            <Button size="sm" variant="secondary" icon={Printer} onClick={() => printReport(r)}>
              Print
            </Button>
          )}
        </div>
      ),
    },
  ];

  const testCatalogColumns = [
    {
      header: 'Test Name',
      key: 'name',
      render: (t) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-navy, #0B2A4A)' }}>{t.name}</div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>{t.description || 'Standard Test'}</div>
        </div>
      ),
    },
    {
      header: 'Category',
      key: 'category',
      render: (t) => <Badge variant="neutral" size="sm">{t.category || 'General'}</Badge>,
    },
    {
      header: 'Price (Rs.)',
      key: 'price',
      render: (t) => (
        <span style={{ fontWeight: 700, color: 'var(--color-navy, #0B2A4A)' }}>
          Rs. {Number(t.price || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (t) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <Button size="sm" variant="secondary" onClick={() => handleEditTest(t)} icon={Edit2} aria-label="Edit" />
          <Button size="sm" variant="danger" onClick={() => setDeleteTestId(t.id)} icon={Trash2} aria-label="Delete" />
        </div>
      ),
    },
  ];

  return (
    <Layout>
      {/* Header */}
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Laboratory Diagnostics</h1>
          <p style={styles.subtitle}>Manage clinical investigations, sample workflows, and pathology reports</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {tab === 'requests' ? (
            <Button variant="primary" icon={Plus} onClick={() => setShowRequestModal(true)}>
              New Test Request
            </Button>
          ) : (
            <Button variant="primary" icon={Plus} onClick={() => {
              setEditingTestId(null);
              setTestForm({ name: '', description: '', price: '', category: '' });
              setShowTestModal(true);
            }}>
              Add Test to Catalog
            </Button>
          )}
        </div>
      </div>

      {error && <Toast type="error" message={error} onClose={() => setError('')} style={{ marginBottom: '16px' }} />}
      {success && <Toast type="success" message={success} onClose={() => setSuccess('')} style={{ marginBottom: '16px' }} />}

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'requests', label: 'Test Requests Queue', count: requests.length },
          { id: 'tests', label: 'Investigation Catalog', count: tests.length },
        ]}
        activeTab={tab}
        onChange={setTab}
        style={{ marginBottom: '16px' }}
      />

      {tab === 'requests' ? (
        <DataTable
          columns={requestColumns}
          data={requests}
          loading={loading}
          pageSize={10}
          emptyTitle="No Lab Requests"
          emptyDescription="There are no active laboratory test requests in the queue."
        />
      ) : (
        <DataTable
          columns={testCatalogColumns}
          data={tests}
          loading={loading}
          pageSize={10}
          emptyTitle="Catalog Empty"
          emptyDescription="No diagnostic tests registered in the hospital catalog."
        />
      )}

      {/* Request Lab Test Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Request Diagnostic Investigation"
        description="Select patient, requesting physician, and test from catalog."
        maxWidth="540px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowRequestModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleRequestSubmit}>Submit Request</Button>
          </>
        }
      >
        <form onSubmit={handleRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={styles.inputLabel}>Patient *</label>
            <select
              value={requestForm.patientId}
              onChange={(e) => setRequestForm({ ...requestForm, patientId: e.target.value })}
              required
              style={styles.modalSelect}
            >
              <option value="">-- Select Patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.inputLabel}>Referring Doctor</label>
            <select
              value={requestForm.doctorId}
              onChange={(e) => setRequestForm({ ...requestForm, doctorId: e.target.value })}
              style={styles.modalSelect}
            >
              <option value="">-- Select Doctor (Optional) --</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.user?.name} ({d.specialization})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.inputLabel}>Laboratory Test *</label>
            <select
              value={requestForm.testId}
              onChange={(e) => setRequestForm({ ...requestForm, testId: e.target.value })}
              required
              style={styles.modalSelect}
            >
              <option value="">-- Select Test --</option>
              {tests.map((t) => (
                <option key={t.id} value={t.id}>{t.name} (Rs. {t.price})</option>
              ))}
            </select>
          </div>

          <Input
            label="Clinical Indication / Notes"
            placeholder="e.g. Fasting blood sugar, routine screen"
            value={requestForm.notes}
            onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
          />
        </form>
      </Modal>

      {/* Enter Test Result Modal */}
      <Modal
        isOpen={Boolean(showResultModal)}
        onClose={() => setShowResultModal(null)}
        title="Enter Laboratory Findings"
        description="Record findings, test values, and clinical pathologist remarks."
        maxWidth="540px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowResultModal(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleResultSubmit}>Save & Complete Report</Button>
          </>
        }
      >
        <form onSubmit={handleResultSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={styles.inputLabel}>Diagnostic Findings & Values *</label>
            <textarea
              rows={4}
              required
              placeholder="e.g. Hemoglobin: 14.2 g/dL, WBC: 6,800/mcL"
              value={resultForm.result}
              onChange={(e) => setResultForm({ ...resultForm, result: e.target.value })}
              style={styles.modalTextarea}
            />
          </div>

          <Input
            label="Pathologist Remarks"
            placeholder="e.g. Values within normal biological reference range"
            value={resultForm.remarks}
            onChange={(e) => setResultForm({ ...resultForm, remarks: e.target.value })}
          />
        </form>
      </Modal>

      {/* Add / Edit Test in Catalog Modal */}
      <Modal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        title={editingTestId ? 'Edit Test Catalog' : 'Add Diagnostic Test'}
        description="Define test name, category, and standard pricing."
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowTestModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleTestSubmit}>Save Test</Button>
          </>
        }
      >
        <form onSubmit={handleTestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Test Name *"
            required
            placeholder="e.g. Complete Blood Count (CBC)"
            value={testForm.name}
            onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
          />
          <Input
            label="Category"
            placeholder="e.g. Hematology, Biochemistry, Radiology"
            value={testForm.category}
            onChange={(e) => setTestForm({ ...testForm, category: e.target.value })}
          />
          <Input
            label="Price (Rs.) *"
            type="number"
            required
            placeholder="e.g. 1500"
            value={testForm.price}
            onChange={(e) => setTestForm({ ...testForm, price: e.target.value })}
          />
          <Input
            label="Description"
            placeholder="Brief description or requirements"
            value={testForm.description}
            onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTestId)}
        onClose={() => setDeleteTestId(null)}
        onConfirm={confirmDeleteTest}
        title="Delete Diagnostic Test"
        message="Are you sure you want to remove this test from the laboratory catalog?"
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