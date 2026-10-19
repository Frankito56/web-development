import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  BookMarked,
  Heart,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  User,
  Sparkles,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useNotification } from '@/context/NotificationContext';
import { LoanService } from '@/services/loanService';
import { Button } from '@/components/ui/Button';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotification();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const activeLoansCount = user ? LoanService.getActiveLoans(user.id).length : 0;

  const navLinks = [
    { to: '/books', label: 'Catalog', icon: <BookOpen size={16} /> },
    {
      to: '/my-loans',
      label: 'My Loans',
      icon: <BookMarked size={16} />,
      badge: activeLoansCount > 0 ? activeLoansCount : undefined,
    },
    { to: '/reading-tracker', label: 'Reading Tracker', icon: <Sparkles size={16} /> },
    { to: '/wishlist', label: 'Wishlist', icon: <Heart size={16} /> },
  ];

  return (
    <header className="unilib-navbar-header">
      <div className="unilib-navbar-container">
        <Link to="/" className="unilib-navbar-brand">
          <div className="unilib-navbar-brand__logo">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="unilib-navbar-brand__title-row">
              <span className="unilib-navbar-brand__name">UniLib</span>
              <span className="unilib-navbar-brand__pill">Academic</span>
            </div>
            <p className="unilib-navbar-brand__subtitle">University Library System</p>
          </div>
        </Link>

        <nav className="unilib-navbar-nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `unilib-nav-link ${isActive ? 'unilib-nav-link--active' : ''}`
              }
            >
              {link.icon}
              <span>{link.label}</span>
              {link.badge !== undefined && (
                <span className="unilib-nav-link__badge">{link.badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="unilib-navbar-actions">
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="unilib-icon-btn"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              aria-label="View notifications"
              aria-expanded={isNotifOpen}
              className="unilib-icon-btn"
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="unilib-unread-dot" />}
            </button>

            {isNotifOpen && (
              <div
                className="unilib-dropdown-menu"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="unilib-dropdown-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="unilib-nav-link__badge" style={{ backgroundColor: 'var(--color-danger)' }}>
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        title="Mark all as read"
                        className="unilib-icon-btn"
                        style={{ padding: '0.25rem' }}
                      >
                        <CheckCheck size={16} />
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        title="Clear all"
                        className="unilib-icon-btn"
                        style={{ padding: '0.25rem' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="unilib-dropdown-list">
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', textAlign: 'center', padding: '1.5rem 0' }}>
                      No notifications yet
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          if (n.link) {
                            navigate(n.link);
                            setIsNotifOpen(false);
                          }
                        }}
                        className={`unilib-notification-item ${!n.read ? 'unilib-notification-item--unread' : ''}`}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{n.title}</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-subtle)' }}>
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {isAuthenticated && user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                aria-expanded={isProfileOpen}
                className="unilib-profile-btn"
              >
                <img
                  src={user.avatarUrl || '/placeholder-avatar.svg'}
                  alt={user.name}
                  className="unilib-profile-avatar"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/placeholder-avatar.svg';
                  }}
                />
                <div style={{ display: 'none' }} className="user-text-md">
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, margin: 0 }}>{user.name}</p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--color-primary-600)', margin: 0 }}>{user.role}</p>
                </div>
              </button>

              {isProfileOpen && (
                <div
                  className="unilib-dropdown-menu"
                  style={{ width: '17rem' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border-subtle)', marginBottom: '0.75rem' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{user.email}</p>
                    <span style={{ display: 'inline-block', marginTop: '0.25rem', fontSize: '0.65rem', fontWeight: 600, padding: '0.15rem 0.4rem', borderRadius: '4px', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }}>
                      ID: {user.studentOrEmployeeId}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.5rem', fontSize: '0.8rem', borderRadius: '6px', color: 'var(--color-text-main)' }}
                    >
                      <User size={16} />
                      <span>Account Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                        navigate('/login');
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.5rem', fontSize: '0.8rem', borderRadius: '6px', color: 'var(--color-danger)', textAlign: 'left' }}
                    >
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Button size="sm" variant="ghost" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button size="sm" variant="primary" onClick={() => navigate('/register')}>
                Register
              </Button>
            </div>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="unilib-icon-btn unilib-mobile-toggle"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="unilib-mobile-drawer">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `unilib-nav-link ${isActive ? 'unilib-nav-link--active' : ''}`
              }
              style={{ justifyContent: 'space-between', padding: '0.65rem 0.75rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {link.icon}
                <span>{link.label}</span>
              </div>
              {link.badge !== undefined && (
                <span className="unilib-nav-link__badge">{link.badge}</span>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
};
