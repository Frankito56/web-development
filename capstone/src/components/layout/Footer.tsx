/**
 * UniLib - University Library Footer
 */

import React from 'react';
import { BookOpen, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100">
                UniLib Central System
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              University Library Single Page Application providing academic resource cataloging, dynamic book loans, reservation queues, and reading tracking.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Campus Digital Services • Verified System Status: Operational</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Library Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/books" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Catalog Search
                </Link>
              </li>
              <li>
                <Link to="/my-loans" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Loans & Due Dates
                </Link>
              </li>
              <li>
                <Link to="/reading-tracker" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Reading Progress
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Wishlist & Alerts
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic Hours */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Circulation Hours
            </h4>
            <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <p>Mon - Fri: 08:00 - 22:00</p>
              <p>Saturday: 09:00 - 18:00</p>
              <p>Sunday: 10:00 - 16:00 (Reading Room only)</p>
              <p className="text-[11px] text-primary-600 dark:text-primary-400 font-medium mt-2">
                Standard Loan: 14 Days
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-500">
          <p>© {new Date().getFullYear()} UniLib Academic Library. Built for Web Development Capstone.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with Clean Architecture & React 18/19</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
