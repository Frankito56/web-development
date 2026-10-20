import React from 'react';
import './ProfilePrivilegesCard.css';

interface ProfilePrivilegesCardProps {
  maxLoans: number;
  activeLoansCount: number;
  maxLoanDays: number;
}

export const ProfilePrivilegesCard: React.FC<ProfilePrivilegesCardProps> = ({
  maxLoans,
  activeLoansCount,
  maxLoanDays,
}) => {
  return (
    <div className="unilib-profile-card">
      <h3 className="unilib-profile-card-title">
        Borrowing Privileges & Quota
      </h3>

      <div className="unilib-profile-quota-list">
        <div className="unilib-profile-quota-row">
          <span className="unilib-profile-quota-label">Max Simultaneous Loans:</span>
          <strong className="unilib-profile-quota-value">{maxLoans} books</strong>
        </div>

        <div className="unilib-profile-quota-row">
          <span className="unilib-profile-quota-label">Current Active Loans:</span>
          <strong className="unilib-profile-quota-value unilib-profile-quota-value--highlight">
            {activeLoansCount} books
          </strong>
        </div>

        <div className="unilib-profile-quota-row">
          <span className="unilib-profile-quota-label">Standard Loan Duration:</span>
          <strong className="unilib-profile-quota-value">{maxLoanDays} Calendar Days</strong>
        </div>

        <div className="unilib-profile-quota-row">
          <span className="unilib-profile-quota-label">Max Online Renewals:</span>
          <strong className="unilib-profile-quota-value">2 Extensions per title</strong>
        </div>
      </div>
    </div>
  );
};
