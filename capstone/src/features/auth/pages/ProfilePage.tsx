/**
 * UniLib - ProfilePage Component
 * Displays user identity, borrowing quotas, role capabilities, and database reset tool.
 */

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { StorageService } from '@/services/storageService';
import { LoanService } from '@/services/loanService';
import { ROLE_LIMITS } from '@/config';
import { Button } from '@/components/ui/Button';
import {
  User as UserIcon,
  ShieldCheck,
  BookMarked,
  Calendar,
  Building,
  GraduationCap,
  RotateCcw,
} from 'lucide-react';
import { UserRole } from '@/types';

export const ProfilePage: React.FC = () => {
  const { user, switchRole } = useAuth();
  const { showToast } = useNotification();

  if (!user) return null;

  const limits = ROLE_LIMITS[user.role];
  const activeLoans = LoanService.getActiveLoans(user.id);

  const handleResetData = () => {
    if (window.confirm('Reset all library books, loans, and reservations to default seeds?')) {
      StorageService.resetToDefaults();
      showToast('Database Reset', 'Library state restored to initial demo seeds.', 'INFO');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="w-24 h-24 rounded-2xl object-cover ring-4 ring-slate-100 dark:ring-slate-800 shadow-md"
        />

        <div className="space-y-2 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {user.name}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>

            <span className="self-center sm:self-start px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
              {limits.label}
            </span>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-400" />
              <span>{user.department}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <span>ID: {user.studentOrEmployeeId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quotas & Role Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Circulation Privileges */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Borrowing Privileges & Quota
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Max Simultaneous Loans:</span>
              <strong className="text-slate-900 dark:text-slate-100 font-mono">
                {limits.maxLoans} books
              </strong>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Current Active Loans:</span>
              <strong className="text-primary-600 dark:text-primary-400 font-mono">
                {activeLoans.length} books
              </strong>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Standard Loan Duration:</span>
              <strong className="text-slate-900 dark:text-slate-100">
                {limits.maxLoanDays} Calendar Days
              </strong>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-slate-500">Max Online Renewals:</span>
              <strong className="text-slate-900 dark:text-slate-100">2 Extensions per title</strong>
            </div>
          </div>
        </div>

        {/* Change Role Simulation */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Role Switcher Simulator
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Test role-based UI views and different loan allowances in real-time.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {(['STUDENT', 'PROFESSOR', 'LIBRARIAN'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all ${
                  user.role === r
                    ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-rose-500" />}
              onClick={handleResetData}
              className="text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              Reset Seed Data to Defaults
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
