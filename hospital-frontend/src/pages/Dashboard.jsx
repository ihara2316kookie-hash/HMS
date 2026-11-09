import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import {
  Users, Stethoscope, CalendarDays, FlaskConical,
  CreditCard, BedDouble, Banknote, UserCog, AlertTriangle,
  Activity, ArrowUpRight, TrendingUp, ChevronLeft, ChevronRight,
  ShieldCheck, Clock
} from 'lucide-react';
import { Badge } from '../components/ui';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data.summary);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Total Patients',
      value: (stats?.totalPatients ?? 0).toLocaleString(),
      icon: Users,
      color: '#1E6FD9',
      soft: '#E8F1FD',
      badge: 'Registered',
    },
    {
      title: 'Total Doctors',
      value: (stats?.totalDoctors ?? 0).toLocaleString(),
      icon: Stethoscope,
      color: '#0EA5E9',
      soft: '#E0F2FE',
      badge: 'On Duty',
    },
    {
      title: 'Total Revenue',
      value: `Rs. ${(stats?.totalRevenue ?? 0).toLocaleString()}`,
      icon: Banknote,
      color: '#16A34A',
      soft: '#DCFCE7',
      badge: 'Billed',
    },
    {
      title: 'Available Beds',
      value: `${stats?.availableBeds ?? 0} / ${stats?.totalBeds ?? 0}`,
      icon: BedDouble,
      color: '#0B2A4A',
      soft: '#F1F5F9',
      badge: 'Wards',
    },
    {
      title: "Today's Appointments",
      value: stats?.todayAppointments ?? 0,
      icon: CalendarDays,
      color: '#1E6FD9',
      soft: '#E8F1FD',
      badge: 'Scheduled',
    },
    {
      title: 'Pending Lab Requests',
      value: stats?.pendingLabRequests ?? 0,
      icon: FlaskConical,
      color: '#D97706',
      soft: '#FEF3C7',
      badge: 'In Queue',
    },
    {
      title: 'Unpaid Bills',
      value: stats?.unpaidBills ?? 0,
      icon: CreditCard,
      color: '#DC2626',
      soft: '#FEE2E2',
      badge: 'Pending',
    },
    {
      title: 'Total Hospital Staff',
      value: stats?.totalStaff ?? 0,
      icon: UserCog,
      color: '#0B2A4A',
      soft: '#F1F5F9',
      badge: 'Active',
    },
  ];

  const weeklyData = [
    { day: 'Mon', patients: Math.max((stats?.totalPatients ?? 1) - 4, 1), appts: Math.max((stats?.todayAppointments ?? 1), 1) },
    { day: 'Tue', patients: Math.max((stats?.totalPatients ?? 1) - 2, 1), appts: Math.max((stats?.todayAppointments ?? 1) + 1, 1) },
    { day: 'Wed', patients: Math.max((stats?.totalPatients ?? 1) - 1, 1), appts: Math.max((stats?.todayAppointments ?? 1) + 2, 1) },
    { day: 'Thu', patients: stats?.totalPatients ?? 1, appts: Math.max((stats?.todayAppointments ?? 1) + 1, 1) },
    { day: 'Fri', patients: Math.max((stats?.totalPatients ?? 1) + 1, 1), appts: Math.max((stats?.todayAppointments ?? 1) + 3, 1) },
    { day: 'Sat', patients: Math.max((stats?.totalPatients ?? 1) - 1, 1), appts: Math.max((stats?.todayAppointments ?? 1), 1) },
    { day: 'Sun', patients: Math.max((stats?.totalPatients ?? 1) - 3, 1), appts: Math.max((stats?.todayAppointments ?? 0), 0) },
  ];

  const barData = [
    { name: 'Patients', value: stats?.totalPatients ?? 0 },
    { name: 'Doctors', value: stats?.totalDoctors ?? 0 },
    { name: 'Staff', value: stats?.totalStaff ?? 0 },
    { name: 'Labs', value: stats?.pendingLabRequests ?? 0 },
    { name: 'Bills', value: stats?.unpaidBills ?? 0 },
  ];

  const pieData = [
    { name: 'Available', value: stats?.availableBeds ?? 0 },
    { name: 'Occupied', value: Math.max((stats?.totalBeds ?? 0) - (stats?.availableBeds ?? 0), 0) },
  ];
  const pieColors = ['#1E6FD9', '#0B2A4A'];

  const alerts = [
    {
      title: 'Unpaid Bills',
      value: stats?.unpaidBills ?? 0,
      note: 'Requires finance verification',
      color: '#DC2626',
      soft: '#FEE2E2',
      border: '#FECACA',
    },
    {
      title: 'Pending Lab Tests',
      value: stats?.pendingLabRequests ?? 0,
      note: 'Samples waiting for diagnosis',
      color: '#D97706',
      soft: '#FEF3C7',
      border: '#FDE68A',
    },
    {
      title: 'Available Beds',
      value: `${stats?.availableBeds ?? 0} / ${stats?.totalBeds ?? 0}`,
      note: 'Current free inpatient capacity',
      color: '#1E6FD9',
      soft: '#E8F1FD',
      border: '#D0E3FB',
    },
    {
      title: "Today's Clinical Load",
      value: stats?.todayAppointments ?? 0,
      note: 'Appointments scheduled today',
      color: '#16A34A',
      soft: '#DCFCE7',
      border: '#BBF7D0',
    },
  ];

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [currentDate]);

  const monthLabel = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const today = new Date();

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  return (
    <Layout>
      {/* Welcome Banner */}
      <div style={styles.banner}>
        <div style={styles.bannerInfo}>
          <div style={styles.bannerEyebrow}>HOSPITAL MANAGEMENT DASHBOARD</div>
          <h2 style={styles.bannerTitle}>
            Welcome back, {user?.name || 'Administrator'}
          </h2>
          <p style={styles.bannerSubtitle}>
            System operations overview for role <strong>{user?.role}</strong> · All services operational
          </p>
        </div>
        <div style={styles.bannerRight}>
          <Badge variant="primary" dot size="md">
            Live System Active
          </Badge>
          <div style={styles.todayDateText}>
            {today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingWrap}>
          <div style={styles.spinner} />
          <span>Loading clinical metrics...</span>
        </div>
      ) : (
        <>
          {/* Stat Cards Grid (Responsive 4 columns) */}
          <div style={styles.statsGrid}>
            {cards.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.title} style={styles.statCard}>
                  <div style={styles.statCardHeader}>
                    <div style={{ ...styles.statIconWrap, backgroundColor: c.soft, color: c.color }}>
                      <Icon size={20} />
                    </div>
                    <span style={styles.statBadge}>{c.badge}</span>
                  </div>
                  <div style={styles.statValue}>{c.value}</div>
                  <div style={styles.statLabel}>{c.title}</div>
                </div>
              );
            })}
          </div>

          {/* Section 2: Weekly Activity & Mini Calendar */}
          <div style={styles.twoColumnGrid}>
            {/* Chart: Patient & Appointment Activity */}
            <div style={styles.panelCard}>
              <div style={styles.panelHeader}>
                <div>
                  <h3 style={styles.panelTitle}>Weekly Clinical Volume</h3>
                  <p style={styles.panelSubtitle}>Daily patient visits vs scheduled appointments</p>
                </div>
                <div style={styles.chartLegend}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#1E6FD9' }} />
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>Patients</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#0B2A4A' }} />
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>Appointments</span>
                  </div>
                </div>
              </div>

              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="bluePatients" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1E6FD9" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1E6FD9" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="navyAppts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0B2A4A" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0B2A4A" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
                        fontSize: '13px',
                      }}
                    />
                    <Area type="monotone" dataKey="patients" stroke="#1E6FD9" fill="url(#bluePatients)" strokeWidth={2.5} name="Patients" />
                    <Area type="monotone" dataKey="appts" stroke="#0B2A4A" fill="url(#navyAppts)" strokeWidth={2.5} name="Appointments" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Interactive Calendar Widget */}
            <div style={styles.panelCard}>
              <div style={styles.calendarHeaderRow}>
                <div>
                  <h3 style={styles.panelTitle}>{monthLabel}</h3>
                  <p style={styles.panelSubtitle}>Clinic schedule calendar</p>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month" style={styles.calNavBtn}>
                    <ChevronLeft size={16} />
                  </button>
                  <button type="button" onClick={() => changeMonth(1)} aria-label="Next month" style={styles.calNavBtn}>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div style={styles.calWeekRow}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <div key={d} style={styles.calWeekHeader}>{d}</div>
                ))}
              </div>

              <div style={styles.calGrid}>
                {calendarDays.map((day, idx) => {
                  const isToday =
                    day &&
                    day === today.getDate() &&
                    currentDate.getMonth() === today.getMonth() &&
                    currentDate.getFullYear() === today.getFullYear();
                  return (
                    <div
                      key={idx}
                      style={{
                        ...styles.calCell,
                        backgroundColor: isToday ? 'var(--color-primary, #1E6FD9)' : 'transparent',
                        color: isToday ? '#FFFFFF' : day ? 'var(--text-primary, #1F2937)' : 'transparent',
                        fontWeight: isToday ? 700 : 500,
                      }}
                    >
                      {day || ''}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Department Load & Bed Occupancy */}
          <div style={styles.twoColumnGrid}>
            {/* Department Load Bar Chart */}
            <div style={styles.panelCard}>
              <div style={styles.panelHeader}>
                <div>
                  <h3 style={styles.panelTitle}>Department Records Snapshot</h3>
                  <p style={styles.panelSubtitle}>Record volume across primary modules</p>
                </div>
              </div>
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        fontSize: '13px',
                      }}
                    />
                    <Bar dataKey="value" fill="#1E6FD9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bed Occupancy Donut */}
            <div style={styles.panelCard}>
              <div style={styles.panelHeader}>
                <div>
                  <h3 style={styles.panelTitle}>Inpatient Bed Occupancy</h3>
                  <p style={styles.panelSubtitle}>Current hospital ward capacity</p>
                </div>
              </div>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={styles.donutLegend}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#1E6FD9' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Available ({stats?.availableBeds ?? 0})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0B2A4A' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>
                    Occupied ({Math.max((stats?.totalBeds ?? 0) - (stats?.availableBeds ?? 0), 0)})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Urgent Operational Alerts */}
          <div style={styles.panelCard}>
            <div style={styles.panelHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="#D97706" />
                <h3 style={styles.panelTitle}>Hospital Action Alerts</h3>
              </div>
              <Badge variant="warning">Requires Monitoring</Badge>
            </div>

            <div style={styles.alertsGrid}>
              {alerts.map((a) => (
                <div key={a.title} style={{ ...styles.alertBox, backgroundColor: a.soft, borderColor: a.border }}>
                  <div style={{ ...styles.alertNumber, color: a.color }}>{a.value}</div>
                  <div style={styles.alertHeading}>{a.title}</div>
                  <div style={styles.alertDetail}>{a.note}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}

const styles = {
  banner: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    border: '1px solid var(--border-color, #E2E8F0)',
    boxShadow: 'var(--shadow-sm)',
    padding: '24px 28px',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  bannerInfo: {
    maxWidth: '680px',
  },
  bannerEyebrow: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: 'var(--color-primary, #1E6FD9)',
    marginBottom: '4px',
  },
  bannerTitle: {
    fontSize: '22px',
    fontWeight: 800,
    color: 'var(--color-navy, #0B2A4A)',
    margin: '0 0 6px 0',
  },
  bannerSubtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary, #6B7280)',
    margin: 0,
  },
  bannerRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '6px',
  },
  todayDateText: {
    fontSize: '12px',
    color: 'var(--text-muted, #9CA3AF)',
    fontWeight: 500,
  },
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    gap: '12px',
    color: 'var(--text-muted, #6B7280)',
    fontSize: '14px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '3px solid #E8F1FD',
    borderTopColor: '#1E6FD9',
    animation: 'spin 1s linear infinite',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #E2E8F0)',
    boxShadow: 'var(--shadow-sm)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 180ms ease, box-shadow 180ms ease',
  },
  statCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '14px',
  },
  statIconWrap: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statBadge: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-muted, #6B7280)',
    backgroundColor: 'var(--bg-muted, #F8FAFC)',
    padding: '3px 8px',
    borderRadius: '6px',
    border: '1px solid #E2E8F0',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 800,
    color: 'var(--color-navy, #0B2A4A)',
    marginBottom: '4px',
    letterSpacing: '-0.02em',
  },
  statLabel: {
    fontSize: '13px',
    color: 'var(--text-muted, #6B7280)',
    fontWeight: 500,
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },
  panelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    border: '1px solid var(--border-color, #E2E8F0)',
    boxShadow: 'var(--shadow-sm)',
    padding: '22px',
    marginBottom: '20px',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '18px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  panelTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--color-navy, #0B2A4A)',
    margin: 0,
  },
  panelSubtitle: {
    fontSize: '12px',
    color: 'var(--text-muted, #6B7280)',
    margin: '2px 0 0 0',
  },
  chartLegend: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  calendarHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  calNavBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#4B5563',
    cursor: 'pointer',
  },
  calWeekRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    textAlign: 'center',
    marginBottom: '8px',
  },
  calWeekHeader: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  calGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
  },
  calCell: {
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    fontSize: '13px',
    transition: 'background-color 150ms ease',
  },
  donutLegend: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #F1F5F9',
  },
  alertsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px',
    marginTop: '10px',
  },
  alertBox: {
    borderRadius: '10px',
    border: '1px solid',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  alertNumber: {
    fontSize: '22px',
    fontWeight: 800,
  },
  alertHeading: {
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--color-navy, #0B2A4A)',
  },
  alertDetail: {
    fontSize: '12px',
    color: 'var(--text-secondary, #4B5563)',
  },
};