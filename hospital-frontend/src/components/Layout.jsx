import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Stethoscope, CalendarDays, ClipboardList,
  CreditCard, FlaskConical, Pill, BedDouble, UserCog, LogOut, FileText,
  Menu, X, Search, Bell, KeyRound, ChevronRight, Activity, Clock
} from 'lucide-react';
import { Badge, Toast, Button } from './ui';

export default function Layout({ children }) {
  const { user, logout, sessionWarning, extendSession } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close menus on path change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Handle escape key to close menus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setProfileOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/patients?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Exact role access mapping from original code
  const roleAccess = {
    ADMIN: ['/dashboard', '/patients', '/doctors', '/appointments', '/medical-records', '/bills', '/lab', '/pharmacy', '/inpatient', '/staff', '/reports', '/hr', '/documents', '/change-password', '/audit', '/schedules', '/backups'],
    DOCTOR: ['/dashboard', '/patients', '/appointments', '/medical-records', '/lab', '/inpatient', '/documents', '/change-password', '/schedules'],
    RECEPTIONIST: ['/dashboard', '/patients', '/appointments', '/bills', '/inpatient', '/documents', '/change-password', '/schedules'],
    NURSE: ['/dashboard', '/patients', '/appointments', '/medical-records', '/inpatient', '/documents', '/change-password'],
    LAB_TECHNICIAN: ['/dashboard', '/lab', '/change-password'],
    PHARMACIST: ['/dashboard', '/pharmacy', '/change-password'],
    ACCOUNTANT: ['/dashboard', '/bills', '/reports', '/change-password'],
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/patients', label: 'Patients', icon: Users },
    { path: '/doctors', label: 'Doctors', icon: Stethoscope },
    { path: '/appointments', label: 'Appointments', icon: CalendarDays },
    { path: '/medical-records', label: 'Medical Records', icon: ClipboardList },
    { path: '/bills', label: 'Billing', icon: CreditCard },
    { path: '/lab', label: 'Laboratory', icon: FlaskConical },
    { path: '/pharmacy', label: 'Pharmacy', icon: Pill },
    { path: '/inpatient', label: 'Inpatient', icon: BedDouble },
    { path: '/staff', label: 'Staff Directory', icon: UserCog },
    { path: '/hr', label: 'HR & Attendance', icon: UserCog },
    { path: '/schedules', label: 'Schedules', icon: CalendarDays },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/documents', label: 'Documents', icon: FileText },
    { path: '/audit', label: 'Audit Logs', icon: FileText },
    { path: '/backups', label: 'Backups', icon: FileText },
    { path: '/change-password', label: 'Password', icon: KeyRound },
  ];

  const allowedPaths = roleAccess[user?.role] || ['/dashboard'];
  const visibleMenu = menuItems.filter((item) => allowedPaths.includes(item.path));

  // Determine current page title and breadcrumb
  const currentItem = menuItems.find((m) => m.path === location.pathname);
  const pageTitle = currentItem ? currentItem.label : 'Hospital Management';

  return (
    <div style={styles.appWrapper}>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          style={styles.mobileBackdrop}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar (Dark Navy #0B2A4A) */}
      <aside
        className="no-print"
        style={{
          ...styles.sidebar,
          transform: mobileOpen ? 'translateX(0)' : undefined,
        }}
        id="main-sidebar"
      >
        {/* Brand Header */}
        <div style={styles.brandContainer}>
          <div style={styles.brandLogoWrap}>
            <div style={styles.brandEmblem}>
              <Activity size={18} color="#FFFFFF" />
            </div>
            <div>
              <div style={styles.brandTitle}>MediCare</div>
              <div style={styles.brandSubtitle}>Hospital System</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            style={styles.mobileCloseBtn}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation List */}
        <nav style={styles.nav} aria-label="Main Navigation">
          <div style={styles.navSectionLabel}>MAIN MENU</div>
          {visibleMenu.map((item) => {
            const active = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...styles.navItem,
                  backgroundColor: active ? 'var(--color-navy-hover, #163A63)' : 'transparent',
                  color: active ? '#FFFFFF' : 'var(--color-navy-text-muted, #8FA3BE)',
                  borderLeft: active ? '3px solid var(--color-primary, #1E6FD9)' : '3px solid transparent',
                  fontWeight: active ? 600 : 500,
                }}
              >
                <Icon size={18} style={{ color: active ? 'var(--color-primary, #1E6FD9)' : '#8FA3BE' }} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Card */}
        <div style={styles.sidebarFooter}>
          <div style={styles.userCard}>
            <div style={styles.avatar}>
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div style={styles.userInfo}>
              <div style={styles.userName}>{user?.name || 'User'}</div>
              <div style={styles.userRoleTag}>{user?.role || 'Staff'}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            style={styles.sidebarLogoutBtn}
            aria-label="Log out of application"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div style={styles.mainWrapper}>
        {/* Top Bar */}
        <header className="no-print" style={styles.topbar}>
          {/* Left section: Hamburger & Breadcrumbs */}
          <div style={styles.topbarLeft}>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              style={styles.hamburgerBtn}
            >
              <Menu size={20} />
            </button>

            <div>
              <div style={styles.breadcrumbs}>
                <span style={styles.breadcrumbItem}>MediCare</span>
                <ChevronRight size={12} color="#9CA3AF" />
                <span style={{ ...styles.breadcrumbItem, color: 'var(--color-primary, #1E6FD9)', fontWeight: 600 }}>
                  {pageTitle}
                </span>
              </div>
              <h1 style={styles.topbarTitle}>{pageTitle}</h1>
            </div>
          </div>

          {/* Right section: Search, System Status, Notifications & Profile */}
          <div style={styles.topbarRight}>
            {/* Global Search Bar */}
            <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
              <Search size={16} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search patient, doctor, record..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
                aria-label="Global search input"
              />
            </form>

            {/* System Live Pill */}
            <div style={styles.systemStatusPill}>
              <span style={styles.onlineDot} />
              <span style={styles.onlineText}>Online</span>
            </div>

            {/* Notifications Dropdown */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="System notifications"
                style={styles.iconBtn}
              >
                <Bell size={18} />
                <span style={styles.notifBadge} />
              </button>

              {notifOpen && (
                <div style={styles.dropdownMenu}>
                  <div style={styles.dropdownHeader}>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-navy, #0B2A4A)' }}>
                      System Notifications
                    </span>
                    <Badge variant="primary" size="sm">Active</Badge>
                  </div>
                  <div style={styles.dropdownList}>
                    <div style={styles.dropdownItem}>
                      <Clock size={16} color="#1E6FD9" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: '#1F2937' }}>System Health Normal</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>All modules and API services responding</div>
                      </div>
                    </div>
                    <div style={styles.dropdownItem}>
                      <Activity size={16} color="#16A34A" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: '#1F2937' }}>Session Active</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>Automatic timeout in 30 minutes</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div style={{ position: 'relative' }} ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label="User account menu"
                style={styles.userProfileBtn}
              >
                <div style={styles.topbarAvatar}>
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div style={styles.topbarUserName}>
                  <span>{user?.name || 'My Account'}</span>
                  <span style={styles.topbarUserRole}>{user?.role}</span>
                </div>
              </button>

              {profileOpen && (
                <div style={{ ...styles.dropdownMenu, width: '220px', right: 0 }}>
                  <div style={styles.dropdownHeader}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#1F2937' }}>{user?.name}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>{user?.email}</div>
                    </div>
                  </div>
                  <div style={{ padding: '6px' }}>
                    <Link
                      to="/change-password"
                      style={styles.menuLink}
                      onClick={() => setProfileOpen(false)}
                    >
                      <KeyRound size={16} />
                      <span>Change Password</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{ ...styles.menuLink, width: '100%', color: 'var(--status-danger, #DC2626)', border: 'none', background: 'transparent' }}
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Session Warning Toast */}
        {sessionWarning && (
          <div style={styles.warningToastWrapper}>
            <Toast
              type="warning"
              duration={0}
              message="Your session will expire in 2 minutes due to inactivity."
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>Your session will expire in 2 minutes due to inactivity.</span>
                <Button size="sm" variant="secondary" onClick={extendSession}>
                  Keep Signed In
                </Button>
              </div>
            </Toast>
          </div>
        )}

        {/* Page Main Content Area */}
        <main className="print-area" style={styles.mainContent}>
          <div style={styles.mainInner}>{children}</div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  appWrapper: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-canvas, #F5F8FC)',
  },
  sidebar: {
    width: '260px',
    backgroundColor: 'var(--color-navy, #0B2A4A)',
    color: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    borderRight: '1px solid var(--color-navy-border, #1B3C61)',
    transition: 'transform 200ms ease',
  },
  brandContainer: {
    padding: '20px 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--color-navy-border, #1B3C61)',
  },
  brandLogoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  brandEmblem: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: 'var(--color-primary, #1E6FD9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(30, 111, 217, 0.4)',
  },
  brandTitle: {
    fontSize: '18px',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: '#FFFFFF',
  },
  brandSubtitle: {
    fontSize: '11px',
    color: 'var(--color-navy-text-muted, #8FA3BE)',
    fontWeight: 500,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  mobileCloseBtn: {
    display: 'none',
    background: 'transparent',
    border: 'none',
    color: '#8FA3BE',
    cursor: 'pointer',
    padding: '4px',
  },
  nav: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navSectionLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#6B82A0',
    letterSpacing: '0.06em',
    padding: '6px 10px',
    marginBottom: '4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'all 150ms ease',
  },
  sidebarFooter: {
    padding: '14px 16px',
    borderTop: '1px solid var(--color-navy-border, #1B3C61)',
    backgroundColor: '#08213B',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary, #1E6FD9)',
    color: '#FFFFFF',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    flexShrink: 0,
  },
  userInfo: {
    overflow: 'hidden',
  },
  userName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#FFFFFF',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRoleTag: {
    fontSize: '11px',
    color: '#8FA3BE',
    fontWeight: 500,
  },
  sidebarLogoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #1C446F',
    backgroundColor: 'transparent',
    color: '#CBD5E1',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 150ms ease',
  },
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  topbar: {
    height: '68px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid var(--border-color, #E2E8F0)',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 90,
  },
  topbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  hamburgerBtn: {
    display: 'none',
    background: 'transparent',
    border: '1px solid var(--border-color, #E2E8F0)',
    borderRadius: '8px',
    padding: '6px',
    color: 'var(--text-primary, #1F2937)',
    cursor: 'pointer',
  },
  breadcrumbs: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: 'var(--text-muted, #6B7280)',
    marginBottom: '2px',
  },
  breadcrumbItem: {
    lineHeight: 1,
  },
  topbarTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--color-navy, #0B2A4A)',
    margin: 0,
    lineHeight: 1.2,
  },
  topbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  searchForm: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: '#9CA3AF',
    pointerEvents: 'none',
  },
  searchInput: {
    height: '38px',
    width: '260px',
    paddingLeft: '36px',
    paddingRight: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #E2E8F0)',
    backgroundColor: 'var(--bg-canvas, #F5F8FC)',
    fontSize: '13px',
    color: 'var(--text-primary, #1F2937)',
    outline: 'none',
    transition: 'all 180ms ease',
  },
  systemStatusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    borderRadius: '9999px',
    backgroundColor: 'var(--status-success-bg, #DCFCE7)',
    border: '1px solid var(--status-success-border, #BBF7D0)',
  },
  onlineDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--status-success, #16A34A)',
  },
  onlineText: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--status-success-text, #15803D)',
  },
  iconBtn: {
    position: 'relative',
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #E2E8F0)',
    backgroundColor: '#FFFFFF',
    color: 'var(--text-secondary, #4B5563)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  },
  notifBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary, #1E6FD9)',
    border: '2px solid #FFFFFF',
  },
  userProfileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '4px 10px 4px 4px',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #E2E8F0)',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
  },
  topbarAvatar: {
    width: '30px',
    height: '30px',
    borderRadius: '6px',
    backgroundColor: 'var(--color-primary-light, #E8F1FD)',
    color: 'var(--color-primary, #1E6FD9)',
    fontWeight: 700,
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topbarUserName: {
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-primary, #1F2937)',
    lineHeight: 1.2,
  },
  topbarUserRole: {
    fontSize: '11px',
    fontWeight: 500,
    color: 'var(--text-muted, #6B7280)',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '48px',
    right: 0,
    width: '280px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #E2E8F0)',
    boxShadow: 'var(--shadow-lg, 0 10px 15px -3px rgba(15,23,42,0.1))',
    zIndex: 110,
    overflow: 'hidden',
    animation: 'slideDown 150ms ease-out',
  },
  dropdownHeader: {
    padding: '12px 14px',
    borderBottom: '1px solid var(--border-color, #E2E8F0)',
    backgroundColor: 'var(--bg-muted, #F8FAFC)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownList: {
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-canvas, #F5F8FC)',
  },
  menuLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-primary, #1F2937)',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'background-color 150ms ease',
  },
  warningToastWrapper: {
    padding: '12px 24px 0',
  },
  mainContent: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
  },
  mainInner: {
    maxWidth: '1440px',
    margin: '0 auto',
    width: '100%',
  },
  mobileBackdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(11, 42, 74, 0.5)',
    zIndex: 95,
  },
};