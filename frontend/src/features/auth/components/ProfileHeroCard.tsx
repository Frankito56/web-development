import React from 'react';
import { Building, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { User } from '@/types';
import './ProfileHeroCard.css';

interface ProfileHeroCardProps {
  user: User;
  roleLabel: string;
  onEdit: () => void;
}

export const ProfileHeroCard: React.FC<ProfileHeroCardProps> = ({
  user,
  roleLabel,
  onEdit,
}) => {
  return (
    <div className="unilib-profile-hero-card">
      <img
        src={user.avatarUrl || '/placeholder-avatar.svg'}
        alt={user.name}
        className="unilib-profile-hero-avatar"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/placeholder-avatar.svg';
        }}
      />

      <div className="unilib-profile-details">
        <div className="unilib-profile-header-row">
          <div>
            <h1 className="unilib-profile-name">{user.name}</h1>
            <p className="unilib-profile-email">{user.email}</p>
          </div>

          <div className="unilib-profile-header-actions">
            <span className="unilib-profile-role-pill">{roleLabel}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
            >
              <Edit3 size={14} />
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="unilib-profile-meta-row">
          <div className="unilib-profile-meta-item">
            <Building size={16} />
            <span>{user.department}</span>
          </div>
          <div className="unilib-profile-meta-item unilib-profile-id-mono">
            <span>ID: {user.studentOrEmployeeId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
