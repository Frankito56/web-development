import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { LoanService } from '@/services/loanService';
import { ROLE_LIMITS } from '@/config';
import { formatDate } from '@/utils/dateUtils';
import { Building, ShieldCheck, Calendar, BookMarked, Edit3 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import '../auth.css';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useNotification();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;

  const limits = ROLE_LIMITS[user.role];
  const activeLoans = LoanService.getActiveLoans(user.id);

  const handleOpenEdit = () => {
    setEditName(user.name);
    setEditDepartment(user.department);
    setEditAvatarUrl(user.avatarUrl && user.avatarUrl !== '/placeholder-avatar.svg' ? user.avatarUrl : '');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast('Validation Error', 'Name cannot be empty', 'ERROR');
      return;
    }
    setIsSaving(true);
    const success = await updateProfile({
      name: editName.trim(),
      department: editDepartment.trim(),
      avatarUrl: editAvatarUrl.trim() || undefined,
    });
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
              <h1 className="unilib-profile-name">
                {user.name}
              </h1>
              <p className="unilib-profile-email">{user.email}</p>
            </div>

            <div className="unilib-profile-header-actions">
              <span className="unilib-profile-role-pill">
                {limits.label}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenEdit}
                className="unilib-profile-edit-btn"
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
              <span className="unilib-profile-status-verified">
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
              <span className="unilib-profile-status-date">
                <Calendar size={14} />
                {formatDate(user.joinedDate)}
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
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit University Profile"
        maxWidth="md"
      >
        <form onSubmit={handleSaveProfile} className="unilib-auth-form">
          <Input
            label="Full Name"
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />

          <Input
            label="Academic Department"
            type="text"
            value={editDepartment}
            onChange={(e) => setEditDepartment(e.target.value)}
            required
          />

          <Input
            label="Profile Picture URL"
            type="url"
            value={editAvatarUrl}
            onChange={(e) => setEditAvatarUrl(e.target.value)}
            placeholder="https://... (leave empty to use default placeholder)"
            helperText="Provide a direct image URL or leave empty to use the system placeholder (/placeholder-avatar.svg)."
          />

          {}
          <div className="unilib-avatar-preview-box">
            <img
              src={editAvatarUrl.trim() || '/placeholder-avatar.svg'}
              alt="Avatar Preview"
              className="unilib-avatar-preview-img"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/placeholder-avatar.svg';
              }}
            />
            <div>
              <p className="unilib-avatar-preview-title">Avatar Preview</p>
              <p className="unilib-avatar-preview-desc">
                {editAvatarUrl.trim() ? 'Using custom image URL' : 'Using default placeholder'}
              </p>
            </div>
          </div>

          <div className="unilib-modal-form-actions">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
