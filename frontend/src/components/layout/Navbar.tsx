import React, { useState, useEffect } from 'react';
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
  ClipboardList,
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.unilib-dropdown-menu') && !target.closest('.unilib-icon-btn') && !target.closest('.unilib-profile-btn')) {
        setIsNotifOpen(false);
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const activeLoansCount = user ? LoanService.getActiveLoans(user.id).length : 0;

  const isLibrarian = user?.role === 'LIBRARIAN';

  const navLinks = isLibrarian
    ? [
        { to: '/books', label: 'Catalog', icon: <BookOpen size={16} /> },
        { to: '/circulation', label: 'Circulation Desk', icon: <ClipboardList size={16} /> },
      ]
    : [
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

          <div className="unilib-dropdown-anchor">
            <button
              onClick={() => {
                setIsNotifOpen((prev) => !prev);
                setIsProfileOpen(false);
                setIsMobileMenuOpen(false);
              }}
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
                  <div className="unilib-notif-title-row">
                    <span className="unilib-notif-title">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="unilib-nav-link__badge unilib-nav-link__badge--danger">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="unilib-notif-actions">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        title="Mark all as read"
                        className="unilib-icon-btn unilib-icon-btn--sm"
                      >
                        <CheckCheck size={16} />
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        title="Clear all"
                        className="unilib-icon-btn unilib-icon-btn--sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="unilib-dropdown-list">
                  {notifications.length === 0 ? (
                    <p className="unilib-notif-empty">
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
                        <div className="unilib-notif-item-header">
                          <span className="unilib-notif-item-title">{n.title}</span>
                          <span className="unilib-notif-item-time">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="unilib-notif-item-msg">
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
            <div className="unilib-dropdown-anchor">
              <button
                onClick={() => {
                  setIsProfileOpen((prev) => !prev);
                  setIsNotifOpen(false);
                  setIsMobileMenuOpen(false);
                }}
                aria-expanded={isProfileOpen}
                className="unilib-profile-btn"
              >
                <img
                  src={user.avatarUrl || '/placeholder-avatar.svg'}
                  alt={user.name}
                  className="unilib-navbar-avatar"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/placeholder-avatar.svg';
                  }}
                />
                <div className="unilib-profile-btn__info">
                  <p className="unilib-profile-btn__name">{user.name}</p>
                  <p className="unilib-profile-btn__role">{user.role}</p>
                </div>
              </button>

              {isProfileOpen && (
                <div
                  className="unilib-dropdown-menu unilib-dropdown-menu--profile"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="unilib-profile-user-summary">
                    <p className="unilib-profile-user-name">{user.name}</p>
                    <p className="unilib-profile-user-email">{user.email}</p>
                    <span className="unilib-profile-user-badge">
                      ID: {user.studentOrEmployeeId}
                    </span>
                  </div>

                  <div className="unilib-profile-actions">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="unilib-profile-link"
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
                      className="unilib-profile-logout-btn"
                    >
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="unilib-auth-buttons">
              <Button size="sm" variant="ghost" onClick={() => navigate('/login')} className="unilib-auth-btn--login">
                Sign In
              </Button>
              <Button size="sm" variant="primary" onClick={() => navigate('/register')} className="unilib-auth-btn--register">
                Register
              </Button>
            </div>
          )}

          <button
            onClick={() => {
              setIsMobileMenuOpen((prev) => !prev);
              setIsNotifOpen(false);
              setIsProfileOpen(false);
            }}
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
                `unilib-nav-link unilib-mobile-drawer__item ${isActive ? 'unilib-nav-link--active' : ''}`
              }
            >
              <div className="unilib-mobile-drawer__link-content">
                {link.icon}
                <span>{link.label}</span>
              </div>
              {link.badge !== undefined && (
                <span className="unilib-nav-link__badge">{link.badge}</span>
              )}
            </NavLink>
          ))}

          <div className="unilib-mobile-drawer__footer">
            {!isAuthenticated ? (
              <div className="unilib-mobile-drawer__auth">
                <Button size="sm" variant="outline" onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}>
                  Sign In
                </Button>
                <Button size="sm" variant="primary" onClick={() => { setIsMobileMenuOpen(false); navigate('/register'); }}>
                  Register
                </Button>
              </div>
            ) : (
              <div className="unilib-mobile-drawer__profile">
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="unilib-mobile-drawer__profile-link"
                >
                  <User size={16} />
                  <span>Account ({user?.name})</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="unilib-profile-logout-btn unilib-mobile-drawer__logout"
                >
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
