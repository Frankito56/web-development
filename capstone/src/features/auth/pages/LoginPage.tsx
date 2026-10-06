/**
 * UniLib - LoginPage Component
 * Role-based authentication simulation with one-click test logins.
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BookOpen, GraduationCap, Briefcase, Shield, ArrowRight } from 'lucide-react';
import { UserRole } from '@/types';

export const LoginPage: React.FC = () => {
  const { login, allDemoUsers } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [error, setError] = useState('');

  const from = (location.state as any)?.from?.pathname || '/books';

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your university email address.');
      return;
    }

    const success = login(email, selectedRole);
    if (success) {
      showToast('Welcome to UniLib', `Signed in as ${email}`, 'SUCCESS');
      navigate(from, { replace: true });
    } else {
      setError('Unable to authenticate with this email.');
    }
  };

  const handleQuickLogin = (demoUserEmail: string) => {
    const success = login(demoUserEmail);
    if (success) {
      showToast('Authentication Successful', `Switched account to ${demoUserEmail}`, 'SUCCESS');
      navigate(from, { replace: true });
    }
  };

  const roleIcons = {
    STUDENT: <GraduationCap className="w-5 h-5 text-indigo-500" />,
    PROFESSOR: <Briefcase className="w-5 h-5 text-amber-500" />,
    LIBRARIAN: <Shield className="w-5 h-5 text-emerald-500" />,
  };

  return (
    <div className="max-w-md mx-auto my-6 sm:my-10 space-y-8 animate-fade-in">
      {/* Branding */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-primary-500/25">
          <BookOpen className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          Campus Portal Sign In
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Access the university library network and manage your academic checkouts.
        </p>
      </div>

      {/* One-Click Demo Role Accounts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
          Quick Demo Login (Select Role)
        </span>

        <div className="space-y-2.5">
          {allDemoUsers.map((demo) => (
            <button
              key={demo.id}
              onClick={() => handleQuickLogin(demo.email)}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50/40 dark:hover:bg-primary-950/20 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <img
                  src={demo.avatarUrl}
                  alt={demo.name}
                  className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 transition-colors">
                    {demo.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {demo.department}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {demo.role}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Login Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
          Or Enter University Credentials
        </span>

        <form onSubmit={handleCustomLogin} className="space-y-4">
          <Input
            label="Institutional Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="student@unilib.edu"
            error={error}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['STUDENT', 'PROFESSOR', 'LIBRARIAN'] as const).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all ${
                    selectedRole === r
                      ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full mt-2">
            Authenticate Session
          </Button>
        </form>
      </div>
    </div>
  );
};
