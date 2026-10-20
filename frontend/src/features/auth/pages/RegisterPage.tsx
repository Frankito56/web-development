import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BookOpen, UserPlus, AlertCircle } from 'lucide-react';
import { UserRole } from '@/types';
import '../auth.css';

export const RegisterPage: React.FC = () => {
  const { register, isAuthenticated } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/books', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentOrEmployeeId, setStudentOrEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Institutional email is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!studentOrEmployeeId.trim()) {
      setError('Student or Employee ID is required.');
      return;
    }
    if (!department.trim()) {
      setError('Academic department is required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const res = await register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      studentOrEmployeeId: studentOrEmployeeId.trim(),
      department: department.trim(),
      avatarUrl: avatarUrl.trim() || undefined,
    });

    setIsSubmitting(false);

    if (res.success) {
      showToast('Registration Successful', `Account created for ${email}`, 'SUCCESS');
      navigate('/books', { replace: true });
    } else {
      setError(res.error || 'Failed to create account. Please check your data.');
    }
  };

  return (
    <div className="unilib-auth-container unilib-auth-container--wide">
      <div className="unilib-auth-branding">
        <div className="unilib-auth-logo-badge">
          <BookOpen size={24} />
        </div>
        <h1 className="unilib-auth-title">
          Create University Account
        </h1>
        <p className="unilib-auth-subtitle">
          Join UniLib to check out academic titles, reserve books, and manage reading lists.
        </p>
      </div>

      <div className="unilib-auth-card">
        <span className="unilib-auth-section-title">
          Institutional Registration
        </span>

        {error && (
          <div className="unilib-auth-error-alert">
            <AlertCircle size={16} className="unilib-auth-error-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="unilib-auth-form">
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="e.g. Maria Fernandez"
            required
          />

          <Input
            label="Institutional Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="username@unilib.edu"
            required
          />

          <Input
            label="Password (min. 6 characters)"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="Choose a secure password"
            required
          />

          <div className="unilib-auth-row-2col">
            <Input
              label="Campus ID"
              type="text"
              value={studentOrEmployeeId}
              onChange={(e) => {
                setStudentOrEmployeeId(e.target.value);
                setError('');
              }}
              placeholder="e.g. EST-2024"
              required
            />

            <Input
              label="Department"
              type="text"
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setError('');
              }}
              placeholder="e.g. Computer Science"
              required
            />
          </div>

          <div className="unilib-auth-role-group">
            <label className="unilib-auth-role-label">
              Institutional Role
            </label>
            <div className="unilib-role-selector-grid">
              {(['STUDENT', 'PROFESSOR'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`unilib-role-select-btn ${role === r ? 'unilib-role-select-btn--active' : ''}`}
                >
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Profile Image URL (Optional)"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://... (leave empty for placeholder)"
            helperText="If omitted, your default placeholder image will be used."
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="unilib-auth-btn-full"
            disabled={isSubmitting}
          >
            <UserPlus size={16} />
            <span>{isSubmitting ? 'Registering...' : 'Complete Registration'}</span>
          </Button>

          <div className="unilib-auth-switch-link">
            Already have an account?{' '}
            <Link to="/login" className="unilib-auth-link-highlight">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
