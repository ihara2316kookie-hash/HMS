import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import {
  CalendarDays, Plus, List, Calendar as CalendarIcon,
  Search, CheckCircle2, Clock, XCircle, AlertCircle,
  User, Stethoscope, ChevronLeft, ChevronRight, Edit2, Trash2
} from 'lucide-react';
import { Button, Input, Badge, Modal, ConfirmDialog, Toast, DataTable } from '../components/ui';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Filters & Views
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
  const [search, setSearch] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const [form, setForm] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    reason: '',
    notes: '',
    status: 'SCHEDULED',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [appRes, patRes, docRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/patients'),
        api.get('/doctors'),
      ]);
      setAppointments(appRes.data);
      setPatients(patRes.data);
      setDoctors(docRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load appointments data');
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
      doctorId: '',
      date: '',
      time: '',
      reason: '',
      notes: '',
      status: 'SCHEDULED',
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (appointment) => {
    setForm({
      patientId: appointment.patientId || '',
      doctorId: appointment.doctorId || '',
      date: appointment.date ? appointment.date.split('T')[0] : '',
      time: appointment.time || '',
      reason: appointment.reason || '',
      notes: appointment.notes || '',
      status: appointment.status || 'SCHEDULED',
    });
    setEditingId(appointment.id);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaveLoading(true);

    try {
      if (editingId) {
        await api.put(`/appointments/${editingId}`, form);
        setSuccess('Appointment updated successfully');
      } else {
        await api.post('/appointments', form);
        setSuccess('Appointment scheduled successfully');
      }
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save appointment');
    } finally {
      setSaveLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      setSuccess(`Appointment status marked as ${status}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment status');
    }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/appointments/${deleteId}`);
      setSuccess('Appointment deleted successfully');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete appointment');
      setDeleteId(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success" dot size="sm">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger" dot size="sm">Cancelled</Badge>;
      case 'RESCHEDULED':
        return <Badge variant="warning" dot size="sm">Rescheduled</Badge>;
      case 'SCHEDULED':
      default:
        return <Badge variant="info" dot size="sm">Scheduled</Badge>;
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const q = search.toLowerCase();
      const patientName = a.patient?.name?.toLowerCase() || '';
      const doctorName = a.doctor?.user?.name?.toLowerCase() || '';
      const reason = a.reason?.toLowerCase() || '';

      const matchesSearch = patientName.includes(q) || doctorName.includes(q) || reason.includes(q);
      const matchesDoc = !doctorFilter || a.doctorId === doctorFilter;
      const matchesStatus = !statusFilter || a.status === statusFilter;

      return matchesSearch && matchesDoc && matchesStatus;
    });
  }, [appointments, search, doctorFilter, statusFilter]);

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [firstDay, daysInMonth]);

  const monthLabel = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const today = new Date();

  const toDateKey = (day) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const dayAppointments = useMemo(() => {
    if (!selectedDay) return [];
    const dateKey = toDateKey(selectedDay);
    return filteredAppointments.filter((a) => {
      const appDate = a.date ? a.date.split('T')[0] : '';
      return appDate === dateKey;
    });
  }, [selectedDay, filteredAppointments, year, month]);

  const columns = [
    {
      header: 'Patient',
      key: 'patient',
      render: (a) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#E8F1FD', color: '#1E6FD9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
            {a.patient?.name?.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontWeight: 600, color: 'var(--color-navy, #0B2A4A)' }}>{a.patient?.name || 'Unknown Patient'}</span>
        </div>
      ),
    },
    {
      header: 'Attending Doctor',
      key: 'doctor',
      render: (a) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1F2937' }}>{a.doctor?.user?.name || 'Dr. Assigned'}</div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>{a.doctor?.specialization || 'General Practice'}</div>
        </div>
      ),
    },
    {
      header: 'Date & Time',
      key: 'date',
      render: (a) => (
        <div>
          <div style={{ fontWeight: 500, color: '#1F2937' }}>
            {a.date ? new Date(a.date).toLocaleDateString() : '-'}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>{a.time || 'TBD'}</div>
        </div>
      ),
    },
    {
      header: 'Reason',
      key: 'reason',
      render: (a) => <span style={{ fontSize: '13px', color: '#4B5563' }}>{a.reason || 'General Consultation'}</span>,
    },
    {
      header: 'Status',
      key: 'status',
      render: (a) => statusBadge(a.status),
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (a) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          {a.status === 'SCHEDULED' && (
            <Button size="sm" variant="success" onClick={() => updateStatus(a.id, 'COMPLETED')}>
              Complete
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={() => handleEdit(a)} icon={Edit2} aria-label="Edit" />
          <Button size="sm" variant="danger" onClick={() => setDeleteId(a.id)} icon={Trash2} aria-label="Delete" />
        </div>
      ),
    },
  ];

  return (
    <Layout>
      {/* Page Header */}
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Clinical Appointments</h1>
          <p style={styles.subtitle}>Schedule, manage, and monitor doctor-patient appointments</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* View Mode Toggle */}
          <div style={styles.viewToggleGroup}>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              style={{
                ...styles.viewBtn,
                backgroundColor: viewMode === 'calendar' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'calendar' ? 'var(--color-primary, #1E6FD9)' : '#6B7280',
                boxShadow: viewMode === 'calendar' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <CalendarIcon size={16} />
              <span>Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                ...styles.viewBtn,
                backgroundColor: viewMode === 'list' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'list' ? 'var(--color-primary, #1E6FD9)' : '#6B7280',
                boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <List size={16} />
              <span>List</span>
            </button>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            Book Appointment
          </Button>
        </div>
      </div>

      {error && <Toast type="error" message={error} onClose={() => setError('')} style={{ marginBottom: '16px' }} />}
      {success && <Toast type="success" message={success} onClose={() => setSuccess('')} style={{ marginBottom: '16px' }} />}

      {/* Filter Bar */}
      <div style={styles.filterBar}>
        <div style={styles.searchWrap}>
          <Search size={16} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search patient, doctor, reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <select
          value={doctorFilter}
          onChange={(e) => setDoctorFilter(e.target.value)}
          style={styles.selectFilter}
          aria-label="Filter by doctor"
        >
          <option value="">All Doctors</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.user?.name || 'Doctor'} ({d.specialization || 'General'})
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.selectFilter}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="RESCHEDULED">Rescheduled</option>
        </select>
      </div>

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' ? (
        <div style={styles.calendarContainer}>
          <div style={styles.calTop}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={styles.monthHeading}>{monthLabel}</h2>
              <Badge variant="primary">{filteredAppointments.length} Total Appointments</Badge>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                style={styles.navBtn}
                aria-label="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentDate(new Date())}
                style={styles.todayBtn}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                style={styles.navBtn}
                aria-label="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div style={styles.calDayNames}>
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
              <div key={d} style={styles.calDayNameItem}>{d}</div>
            ))}
          </div>

          <div style={styles.calendarGrid}>
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={idx} style={styles.emptyDayCell} />;

              const dateKey = toDateKey(day);
              const dayAppts = filteredAppointments.filter((a) => a.date?.split('T')[0] === dateKey);
              const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();
              const isSelected = selectedDay === day;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    ...styles.dayCell,
                    borderColor: isSelected ? 'var(--color-primary, #1E6FD9)' : '#E2E8F0',
                    backgroundColor: isSelected ? '#F0F7FF' : '#FFFFFF',
                  }}
                >
                  <div style={styles.dayCellHeader}>
                    <span
                      style={{
                        ...styles.dayNum,
                        backgroundColor: isToday ? 'var(--color-primary, #1E6FD9)' : 'transparent',
                        color: isToday ? '#FFFFFF' : '#1F2937',
                      }}
                    >
                      {day}
                    </span>
                    {dayAppts.length > 0 && (
                      <span style={styles.apptCountBadge}>{dayAppts.length}</span>
                    )}
                  </div>

                  <div style={styles.dayApptsList}>
                    {dayAppts.slice(0, 2).map((a) => (
                      <div
                        key={a.id}
                        style={{
                          ...styles.miniApptPill,
                          backgroundColor: a.status === 'COMPLETED' ? '#DCFCE7' : '#E8F1FD',
                          color: a.status === 'COMPLETED' ? '#15803D' : '#1E6FD9',
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{a.time}</span> · {a.patient?.name}
                      </div>
                    ))}
                    {dayAppts.length > 2 && (
                      <div style={styles.moreApptsText}>+{dayAppts.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Day Drawer / Summary */}
          {selectedDay && (
            <div style={styles.selectedDayPanel}>
              <div style={styles.selectedDayHead}>
                <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--color-navy, #0B2A4A)' }}>
                  Appointments on {new Date(year, month, selectedDay).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                <Button size="sm" variant="ghost" onClick={() => setSelectedDay(null)}>
                  Close
                </Button>
              </div>

              {dayAppointments.length === 0 ? (
                <p style={{ color: '#6B7280', fontSize: '13px', margin: '8px 0 0 0' }}>
                  No appointments scheduled on this day.
                </p>
              ) : (
                <div style={styles.dayAppointmentsList}>
                  {dayAppointments.map((a) => (
                    <div key={a.id} style={styles.dayApptCard}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--color-navy, #0B2A4A)' }}>
                          {a.time || 'Time TBD'} · {a.patient?.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>
                          Doctor: <strong>{a.doctor?.user?.name}</strong> ({a.doctor?.specialization})
                        </div>
                        <div style={{ fontSize: '12px', color: '#4B5563', marginTop: '2px' }}>
                          Reason: {a.reason || 'General'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {statusBadge(a.status)}
                        <Button size="sm" variant="secondary" onClick={() => handleEdit(a)} icon={Edit2} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* LIST / TABLE VIEW */
        <DataTable
          columns={columns}
          data={filteredAppointments}
          loading={loading}
          pageSize={10}
          emptyTitle="No Appointments Scheduled"
          emptyDescription="There are no appointments matching your selected filters."
        />
      )}

      {/* Booking / Editing Modal */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingId ? 'Edit Appointment' : 'Book New Clinical Appointment'}
        description="Select patient, doctor, and designated consultation time slot."
        maxWidth="580px"
        footer={
          <>
            <Button variant="secondary" onClick={resetForm} disabled={saveLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={saveLoading}>
              {editingId ? 'Update Appointment' : 'Confirm Booking'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={styles.modalForm}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={styles.inputLabel}>Select Patient *</label>
            <select name="patientId" value={form.patientId} onChange={handleChange} required style={styles.modalSelect}>
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={styles.inputLabel}>Select Doctor *</label>
            <select name="doctorId" value={form.doctorId} onChange={handleChange} required style={styles.modalSelect}>
              <option value="">-- Choose Doctor --</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.user?.name || 'Doctor'} - {d.specialization}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Date"
              name="date"
              type="date"
              required
              value={form.date}
              onChange={handleChange}
            />
            <Input
              label="Time"
              name="time"
              type="time"
              required
              value={form.time}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Reason for Visit"
            name="reason"
            placeholder="e.g. Follow-up, Chest pain, Consultation"
            value={form.reason}
            onChange={handleChange}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={styles.inputLabel}>Status</label>
            <select name="status" value={form.status} onChange={handleChange} style={styles.modalSelect}>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="RESCHEDULED">Rescheduled</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={styles.inputLabel}>Clinical Notes</label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Additional medical notes..."
              value={form.notes}
              onChange={handleChange}
              style={styles.modalTextarea}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Cancel & Delete Appointment"
        message="Are you sure you want to cancel and remove this appointment from the doctor's calendar?"
        confirmText="Yes, Delete"
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
  viewToggleGroup: {
    display: 'flex',
    backgroundColor: 'var(--bg-muted, #F8FAFC)',
    padding: '3px',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #E2E8F0)',
  },
  viewBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 150ms ease',
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
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    border: '1px solid var(--border-color, #E2E8F0)',
    boxShadow: 'var(--shadow-sm)',
    overflow: 'hidden',
    padding: '20px',
  },
  calTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '18px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  monthHeading: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--color-navy, #0B2A4A)',
    margin: 0,
  },
  navBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#4B5563',
  },
  todayBtn: {
    padding: '0 12px',
    height: '32px',
    borderRadius: '6px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#FFFFFF',
    fontSize: '12px',
    fontWeight: 600,
    color: '#1F2937',
    cursor: 'pointer',
  },
  calDayNames: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    textAlign: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #E2E8F0',
    marginBottom: '4px',
  },
  calDayNameItem: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
  },
  emptyDayCell: {
    minHeight: '90px',
    backgroundColor: 'var(--bg-muted, #F8FAFC)',
    borderRadius: '8px',
    opacity: 0.5,
  },
  dayCell: {
    minHeight: '90px',
    borderRadius: '8px',
    border: '1px solid',
    padding: '6px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  },
  dayCellHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayNum: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 600,
  },
  apptCountBadge: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#1E6FD9',
    backgroundColor: '#E8F1FD',
    borderRadius: '9999px',
    padding: '1px 6px',
  },
  dayApptsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    marginTop: '2px',
  },
  miniApptPill: {
    fontSize: '11px',
    padding: '2px 5px',
    borderRadius: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  moreApptsText: {
    fontSize: '10px',
    color: '#6B7280',
    fontWeight: 600,
  },
  selectedDayPanel: {
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid #E2E8F0',
  },
  selectedDayHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  dayAppointmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px',
  },
  dayApptCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-muted, #F8FAFC)',
    border: '1px solid #E2E8F0',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
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
  modalTextarea: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #E2E8F0)',
    fontSize: '14px',
    fontFamily: 'inherit',
    color: '#1F2937',
    outline: 'none',
  },
};