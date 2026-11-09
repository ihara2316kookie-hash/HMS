import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import {
  Clock, Plus, Search, CheckCircle2, XCircle,
  Calendar, Check, X, Edit2, Trash2, UserCheck
} from 'lucide-react';
import { Button, Input, Badge, Modal, ConfirmDialog, Toast, DataTable, Tabs } from '../components/ui';

export default function HR() {
  const [tab, setTab] = useState('attendance'); // 'attendance' | 'leave'
  const [staffList, setStaffList] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [editingAttendanceId, setEditingAttendanceId] = useState(null);
  const [deleteAttendanceId, setDeleteAttendanceId] = useState(null);
  const [deleteLeaveId, setDeleteLeaveId] = useState(null);

  const [attendanceForm, setAttendanceForm] = useState({
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'PRESENT',
    notes: '',
  });

  const [leaveForm, setLeaveForm] = useState({
    staffId: '',
    leaveType: 'Annual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const fetchData = async () => {
    try {
      const [staffRes, attRes, leaveRes] = await Promise.all([
        api.get('/staff'),
        api.get('/hr/attendance'),
        api.get('/hr/leave'),
      ]);
      setStaffList(staffRes.data);
      setAttendance(attRes.data);
      setLeaves(leaveRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load HR records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingAttendanceId) {
        await api.put(`/hr/attendance/${editingAttendanceId}`, attendanceForm);
        setSuccess('Attendance record updated');
      } else {
        await api.post('/hr/attendance', attendanceForm);
        setSuccess('Attendance logged successfully');
      }
      setShowAttendanceModal(false);
      setEditingAttendanceId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save attendance');
    }
  };

  const confirmDeleteAttendance = async () => {
    try {
      await api.delete(`/hr/attendance/${deleteAttendanceId}`);
      setSuccess('Attendance record deleted');
      setDeleteAttendanceId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete attendance');
      setDeleteAttendanceId(null);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/hr/leave', leaveForm);
      setSuccess('Leave request submitted successfully');
      setShowLeaveModal(false);
      setLeaveForm({ staffId: '', leaveType: 'Annual', startDate: '', endDate: '', reason: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
    }
  };

  const updateLeaveStatus = async (id, status) => {
    try {
      await api.put(`/hr/leave/${id}`, { status });
      setSuccess(`Leave request marked as ${status.toLowerCase()}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update leave status');
    }
  };

  const confirmDeleteLeave = async () => {
    try {
      await api.delete(`/hr/leave/${deleteLeaveId}`);
      setSuccess('Leave request removed');
      setDeleteLeaveId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete leave request');
      setDeleteLeaveId(null);
    }
  };

  const attendanceColumns = [
    {
      header: 'Staff Member',
      key: 'staff',
      render: (a) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-navy, #0B2A4A)' }}>
            {a.staff?.user?.name || 'Staff Member'}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>
            {a.staff?.designation || a.staff?.department || 'Staff'}
          </div>
        </div>
      ),
    },
    {
      header: 'Date',
      key: 'date',
      render: (a) => <span style={{ fontSize: '13px', color: '#1F2937' }}>{new Date(a.date).toLocaleDateString()}</span>,
    },
    {
      header: 'Check In / Out',
      key: 'checkIn',
      render: (a) => (
        <span style={{ fontSize: '13px', color: '#4B5563' }}>
          {a.checkIn || '--:--'} - {a.checkOut || '--:--'}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (a) => {
        if (a.status === 'PRESENT') return <Badge variant="success" dot size="sm">Present</Badge>;
        if (a.status === 'LATE') return <Badge variant="warning" dot size="sm">Late</Badge>;
        if (a.status === 'HALF_DAY') return <Badge variant="info" dot size="sm">Half Day</Badge>;
        return <Badge variant="danger" dot size="sm">Absent</Badge>;
      },
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (a) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setAttendanceForm({
                staffId: a.staffId,
                date: a.date ? a.date.split('T')[0] : '',
                checkIn: a.checkIn || '',
                checkOut: a.checkOut || '',
                status: a.status || 'PRESENT',
                notes: a.notes || '',
              });
              setEditingAttendanceId(a.id);
              setShowAttendanceModal(true);
            }}
            icon={Edit2}
            aria-label="Edit"
          />
          <Button size="sm" variant="danger" onClick={() => setDeleteAttendanceId(a.id)} icon={Trash2} aria-label="Delete" />
        </div>
      ),
    },
  ];

  const leaveColumns = [
    {
      header: 'Staff Member',
      key: 'staff',
      render: (l) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-navy, #0B2A4A)' }}>
            {l.staff?.user?.name || 'Staff Member'}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>{l.leaveType} Leave</div>
        </div>
      ),
    },
    {
      header: 'Leave Duration',
      key: 'duration',
      render: (l) => (
        <span style={{ fontSize: '13px', color: '#1F2937' }}>
          {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Reason',
      key: 'reason',
      render: (l) => <span style={{ fontSize: '13px', color: '#4B5563' }}>{l.reason || '-'}</span>,
    },
    {
      header: 'Status',
      key: 'status',
      render: (l) => {
        if (l.status === 'APPROVED') return <Badge variant="success" dot size="sm">Approved</Badge>;
        if (l.status === 'REJECTED') return <Badge variant="danger" dot size="sm">Rejected</Badge>;
        return <Badge variant="warning" dot size="sm">Pending</Badge>;
      },
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (l) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          {l.status === 'PENDING' && (
            <>
              <Button size="sm" variant="success" onClick={() => updateLeaveStatus(l.id, 'APPROVED')} icon={Check}>
                Approve
              </Button>
              <Button size="sm" variant="danger" onClick={() => updateLeaveStatus(l.id, 'REJECTED')} icon={X}>
                Reject
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" onClick={() => setDeleteLeaveId(l.id)} icon={Trash2} aria-label="Delete" />
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Human Resources & Attendance</h1>
          <p style={styles.subtitle}>Track employee shift attendance, leave applications, and approvals</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {tab === 'attendance' ? (
            <Button variant="primary" icon={Plus} onClick={() => {
              setEditingAttendanceId(null);
              setShowAttendanceModal(true);
            }}>
              Log Attendance
            </Button>
          ) : (
            <Button variant="primary" icon={Plus} onClick={() => setShowLeaveModal(true)}>
              Apply for Leave
            </Button>
          )}
        </div>
      </div>

      {error && <Toast type="error" message={error} onClose={() => setError('')} style={{ marginBottom: '16px' }} />}
      {success && <Toast type="success" message={success} onClose={() => setSuccess('')} style={{ marginBottom: '16px' }} />}

      <Tabs
        tabs={[
          { id: 'attendance', label: 'Daily Attendance Log', count: attendance.length },
          { id: 'leave', label: 'Leave Requests', count: leaves.length },
        ]}
        activeTab={tab}
        onChange={setTab}
        style={{ marginBottom: '16px' }}
      />

      {tab === 'attendance' ? (
        <DataTable
          columns={attendanceColumns}
          data={attendance}
          loading={loading}
          pageSize={10}
          emptyTitle="No Attendance Records"
          emptyDescription="There are no attendance records registered for this period."
        />
      ) : (
        <DataTable
          columns={leaveColumns}
          data={leaves}
          loading={loading}
          pageSize={10}
          emptyTitle="No Leave Requests"
          emptyDescription="There are no pending or historic staff leave applications."
        />
      )}

      {/* Attendance Modal */}
      <Modal
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        title={editingAttendanceId ? 'Edit Attendance Record' : 'Record Staff Attendance'}
        description="Select staff member, shift time stamps, and present/absent status."
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAttendanceModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAttendanceSubmit}>Save Record</Button>
          </>
        }
      >
        <form onSubmit={handleAttendanceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={styles.inputLabel}>Staff Member *</label>
            <select
              value={attendanceForm.staffId}
              onChange={(e) => setAttendanceForm({ ...attendanceForm, staffId: e.target.value })}
              required
              style={styles.modalSelect}
            >
              <option value="">-- Choose Staff Member --</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>{s.user?.name} ({s.department})</option>
              ))}
            </select>
          </div>

          <Input
            label="Date *"
            type="date"
            required
            value={attendanceForm.date}
            onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Check In Time"
              type="time"
              value={attendanceForm.checkIn}
              onChange={(e) => setAttendanceForm({ ...attendanceForm, checkIn: e.target.value })}
            />
            <Input
              label="Check Out Time"
              type="time"
              value={attendanceForm.checkOut}
              onChange={(e) => setAttendanceForm({ ...attendanceForm, checkOut: e.target.value })}
            />
          </div>

          <div>
            <label style={styles.inputLabel}>Status</label>
            <select
              value={attendanceForm.status}
              onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
              style={styles.modalSelect}
            >
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="ABSENT">Absent</option>
            </select>
          </div>

          <Input
            label="Notes"
            placeholder="e.g. Approved shift swap, overtime"
            value={attendanceForm.notes}
            onChange={(e) => setAttendanceForm({ ...attendanceForm, notes: e.target.value })}
          />
        </form>
      </Modal>

      {/* Leave Request Modal */}
      <Modal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        title="Submit Leave Request"
        description="Specify leave type, starting date, and reason for absence."
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowLeaveModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleLeaveSubmit}>Submit Application</Button>
          </>
        }
      >
        <form onSubmit={handleLeaveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={styles.inputLabel}>Staff Member *</label>
            <select
              value={leaveForm.staffId}
              onChange={(e) => setLeaveForm({ ...leaveForm, staffId: e.target.value })}
              required
              style={styles.modalSelect}
            >
              <option value="">-- Choose Staff Member --</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>{s.user?.name} ({s.department})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.inputLabel}>Leave Type</label>
            <select
              value={leaveForm.leaveType}
              onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
              style={styles.modalSelect}
            >
              <option value="Annual">Annual Paid Leave</option>
              <option value="Sick">Sick / Medical Leave</option>
              <option value="Casual">Casual Leave</option>
              <option value="Maternity">Maternity / Paternity Leave</option>
              <option value="Unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Start Date *"
              type="date"
              required
              value={leaveForm.startDate}
              onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
            />
            <Input
              label="End Date *"
              type="date"
              required
              value={leaveForm.endDate}
              onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
            />
          </div>

          <Input
            label="Reason for Absence"
            placeholder="Provide context for clinical coverage..."
            value={leaveForm.reason}
            onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
          />
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteAttendanceId)}
        onClose={() => setDeleteAttendanceId(null)}
        onConfirm={confirmDeleteAttendance}
        title="Delete Attendance Entry"
        message="Are you sure you want to delete this attendance log?"
      />

      <ConfirmDialog
        isOpen={Boolean(deleteLeaveId)}
        onClose={() => setDeleteLeaveId(null)}
        onConfirm={confirmDeleteLeave}
        title="Delete Leave Application"
        message="Are you sure you want to remove this leave application?"
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