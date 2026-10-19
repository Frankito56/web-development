import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BookOpen, UserPlus, AlertCircle } from 'lucide-react';
import { UserRole } from '@/types';
import '../auth.css';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentOrEmployeeId, setStudentOrEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
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
    <div className="unilib-auth-container" style={{ maxWidth: '32rem' }}>
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--color-danger, #ef4444)',
              fontSize: '0.825rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
              Institutional Role
            </label>
            <div className="unilib-role-selector-grid">
              {(['STUDENT', 'PROFESSOR', 'LIBRARIAN'] as UserRole[]).map((r) => (
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

          <Button
            type="submit"
            variant="primary"
            size="md"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={isSubmitting}
          >
            <UserPlus size={16} />
            <span>{isSubmitting ? 'Registering...' : 'Complete Registration'}</span>
          </Button>

          <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary-600)', fontWeight: 600, textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
