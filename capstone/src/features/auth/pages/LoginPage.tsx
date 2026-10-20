import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BookOpen } from 'lucide-react';
import '../auth.css';

interface LocationState {
  from?: {
    pathname?: string;
  };
}

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const locationState = location.state as LocationState | null;
  const from = locationState?.from?.pathname || '/books';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both institutional email and password.');
      return;
    }

    setIsSubmitting(true);
    const success = await login(email, password);
    setIsSubmitting(false);

    if (success) {
      showToast('Welcome to UniLib', `Signed in as ${email}`, 'SUCCESS');
      navigate(from, { replace: true });
    } else {
      setError('Invalid credentials. Check your email and password.');
    }
  };

  return (
    <div className="unilib-auth-container">
      <div className="unilib-auth-branding">
        <div className="unilib-auth-logo-badge">
          <BookOpen size={24} />
        </div>
        <h1 className="unilib-auth-title">
          Campus Portal Sign In
        </h1>
        <p className="unilib-auth-subtitle">
          Access the university library network and manage your academic checkouts.
        </p>
      </div>

      <div className="unilib-auth-card">
        <span className="unilib-auth-section-title">
          Enter University Credentials
        </span>

        <form onSubmit={handleLogin} className="unilib-auth-form">
          <Input
            label="Institutional Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="user@unilib.edu"
            error={error}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="Enter your password"
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="unilib-auth-btn-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </Button>

          <div className="unilib-auth-switch-link">
            Don't have an account?{' '}
            <Link to="/register" className="unilib-auth-link-highlight">
              Create an Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
