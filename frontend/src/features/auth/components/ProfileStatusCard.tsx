import React from 'react';
import { ShieldCheck, Calendar, BookMarked } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';
import './ProfileStatusCard.css';

interface ProfileStatusCardProps {
  role: string;
  joinedDate: string;
}

export const ProfileStatusCard: React.FC<ProfileStatusCardProps> = ({
  role,
  joinedDate,
}) => {
  return (
    <div className="unilib-profile-card">
      <h3 className="unilib-profile-card-title">
        Account Status & Verification
      </h3>

      <div className="unilib-profile-quota-list">
        <div className="unilib-profile-quota-row">
          <span className="unilib-profile-quota-label">Membership Status:</span>
          <span className="unilib-profile-status-verified">
            <ShieldCheck size={16} />
            Verified Active
          </span>
        </div>

        <div className="unilib-profile-quota-row">
          <span className="unilib-profile-quota-label">Institutional Role:</span>
          <strong className="unilib-profile-quota-value">{role}</strong>
        </div>

        <div className="unilib-profile-quota-row">
          <span className="unilib-profile-quota-label">Member Since:</span>
          <span className="unilib-profile-status-date">
            <Calendar size={14} />
            {formatDate(joinedDate)}
          </span>
        </div>

        <div className="unilib-profile-quota-row">
          <span className="unilib-profile-quota-label">Library Access Tier:</span>
          <span className="unilib-profile-status-tier">
            <BookMarked size={14} />
            Full Circulation & Digital Reserves
          </span>
        </div>
      </div>
    </div>
  );
};
