import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { LoanService } from '@/services/loanService';
import { ROLE_LIMITS } from '@/config';
import { ProfileHeroCard } from '../components/ProfileHeroCard';
import { ProfilePrivilegesCard } from '../components/ProfilePrivilegesCard';
import { ProfileStatusCard } from '../components/ProfileStatusCard';
import { EditProfileModal } from '../components/EditProfileModal';
import '../auth.css';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useNotification();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;

  const limits = ROLE_LIMITS[user.role];
  const activeLoans = LoanService.getActiveLoans(user.id);

  const handleSaveProfile = async (data: { name: string; department: string; avatarUrl?: string }) => {
    setIsSaving(true);
    const success = await updateProfile(data);
    setIsSaving(false);

    if (success) {
      showToast('Profile Updated', 'Your profile details have been saved.', 'SUCCESS');
      setIsEditModalOpen(false);
    } else {
      showToast('Update Failed', 'Could not save profile changes.', 'ERROR');
    }
  };

  return (
    <div className="unilib-profile-container">
      <ProfileHeroCard
        user={user}
        roleLabel={limits.label}
        onEdit={() => setIsEditModalOpen(true)}
      />

      <div className="unilib-profile-grid">
        <ProfilePrivilegesCard
          maxLoans={limits.maxLoans}
          activeLoansCount={activeLoans.length}
          maxLoanDays={limits.maxLoanDays}
        />

        <ProfileStatusCard
          role={user.role}
          joinedDate={user.joinedDate}
        />
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        user={user}
        isSaving={isSaving}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProfile}
      />
    </div>
  );
};
