import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LoanService } from '@/services/loanService';
import { ROLE_LIMITS } from '@/config';
import { Building, ShieldCheck, Calendar, BookMarked } from 'lucide-react';
import '../auth.css';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const limits = ROLE_LIMITS[user.role];
  const activeLoans = LoanService.getActiveLoans(user.id);

  return (
    <div className="unilib-profile-container">
      <div className="unilib-profile-hero-card">
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="unilib-profile-avatar"
        />

        <div className="unilib-profile-details">
          <div className="unilib-profile-header-row">
            <div>
              <h1 className="unilib-profile-name">
                {user.name}
              </h1>
              <p className="unilib-profile-email">{user.email}</p>
            </div>

            <span className="unilib-profile-role-pill">
              {limits.label}
            </span>
          </div>

          <div className="unilib-profile-meta-row">
            <div className="unilib-profile-meta-item">
              <Building size={16} />
              <span>{user.department}</span>
            </div>
            <div className="unilib-profile-meta-item" style={{ fontFamily: 'var(--font-mono)' }}>
              <span>ID: {user.studentOrEmployeeId}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="unilib-profile-grid">
        <div className="unilib-profile-card">
          <h3 className="unilib-profile-card-title">
            Borrowing Privileges & Quota
          </h3>

          <div className="unilib-profile-quota-list">
            <div className="unilib-profile-quota-row">
              <span className="unilib-profile-quota-label">Max Simultaneous Loans:</span>
              <strong className="unilib-profile-quota-value">
                {limits.maxLoans} books
              </strong>
            </div>

            <div className="unilib-profile-quota-row">
              <span className="unilib-profile-quota-label">Current Active Loans:</span>
              <strong className="unilib-profile-quota-value unilib-profile-quota-value--highlight">
                {activeLoans.length} books
              </strong>
            </div>

            <div className="unilib-profile-quota-row">
              <span className="unilib-profile-quota-label">Standard Loan Duration:</span>
              <strong className="unilib-profile-quota-value">
                {limits.maxLoanDays} Calendar Days
              </strong>
            </div>

            <div className="unilib-profile-quota-row">
              <span className="unilib-profile-quota-label">Max Online Renewals:</span>
              <strong className="unilib-profile-quota-value">2 Extensions per title</strong>
            </div>
          </div>
        </div>

        <div className="unilib-profile-card">
          <h3 className="unilib-profile-card-title">
            Account Status & Verification
          </h3>

          <div className="unilib-profile-quota-list">
            <div className="unilib-profile-quota-row">
              <span className="unilib-profile-quota-label">Membership Status:</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-success)', fontWeight: 600 }}>
                <ShieldCheck size={16} />
                Verified Active
              </span>
            </div>

            <div className="unilib-profile-quota-row">
              <span className="unilib-profile-quota-label">Institutional Role:</span>
              <strong className="unilib-profile-quota-value">
                {user.role}
              </strong>
            </div>

            <div className="unilib-profile-quota-row">
              <span className="unilib-profile-quota-label">Member Since:</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-main)' }}>
                <Calendar size={14} />
                {user.joinedDate || '2024-01-01'}
              </span>
            </div>

            <div className="unilib-profile-quota-row">
              <span className="unilib-profile-quota-label">Library Access Tier:</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-primary-600)' }}>
                <BookMarked size={14} />
                Full Circulation & Digital Reserves
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
