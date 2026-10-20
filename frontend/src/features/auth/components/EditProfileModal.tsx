import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { User } from '@/types';
import './EditProfileModal.css';

interface EditProfileModalProps {
  isOpen: boolean;
  user: User;
  isSaving: boolean;
  onClose: () => void;
  onSave: (data: { name: string; department: string; avatarUrl?: string }) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  user,
  isSaving,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(user.name);
  const [department, setDepartment] = useState(user.department);
  const [avatarUrl, setAvatarUrl] = useState(
    user.avatarUrl && user.avatarUrl !== '/placeholder-avatar.svg' ? user.avatarUrl : ''
  );

  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setDepartment(user.department);
      setAvatarUrl(user.avatarUrl && user.avatarUrl !== '/placeholder-avatar.svg' ? user.avatarUrl : '');
    }
  }, [isOpen, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      department: department.trim(),
      avatarUrl: avatarUrl.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit University Profile"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="unilib-auth-form">
        <Input
          label="Full Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Academic Department"
          type="text"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          required
        />

        <Input
          label="Profile Picture URL"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://... (leave empty to use default placeholder)"
          helperText="Provide a direct image URL or leave empty to use the system placeholder (/placeholder-avatar.svg)."
        />

        <div className="unilib-avatar-preview-box">
          <img
            src={avatarUrl.trim() || '/placeholder-avatar.svg'}
            alt="Avatar Preview"
            className="unilib-avatar-preview-img"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/placeholder-avatar.svg';
            }}
          />
          <div>
            <p className="unilib-avatar-preview-title">Avatar Preview</p>
            <p className="unilib-avatar-preview-desc">
              {avatarUrl.trim() ? 'Using custom image URL' : 'Using default placeholder'}
            </p>
          </div>
        </div>

        <div className="unilib-modal-form-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
