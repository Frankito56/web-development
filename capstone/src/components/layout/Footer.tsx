

import React from 'react';
import { BookOpen, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="unilib-footer">
      <div className="unilib-footer__container">
        <div className="unilib-footer__grid">
          { }
          <div className="unilib-footer__brand-block">
            <div className="unilib-footer__brand-header">
              <div className="unilib-footer__logo-box">
                <BookOpen size={16} />
              </div>
              <span className="unilib-footer__brand-name">
                UniLib Central System
              </span>
            </div>
            <p className="unilib-footer__desc">
              University Library Single Page Application providing academic resource cataloging, dynamic book loans, reservation queues, and reading tracking.
            </p>
            <div className="unilib-footer__status-badge">
              <ShieldCheck size={16} />
              <span>Campus Digital Services • Verified System Status: Operational</span>
            </div>
          </div>

          { }
          <div>
            <h4 className="unilib-footer__section-title">Library Services</h4>
            <ul className="unilib-footer__links-list">
              <li>
                <Link to="/books" className="unilib-footer__link">
                  Catalog Search
                </Link>
              </li>
              <li>
                <Link to="/my-loans" className="unilib-footer__link">
                  Loans & Due Dates
                </Link>
              </li>
              <li>
                <Link to="/reading-tracker" className="unilib-footer__link">
                  Reading Progress
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="unilib-footer__link">
                  Wishlist & Alerts
                </Link>
              </li>
            </ul>
          </div>

          { }
          <div>
            <h4 className="unilib-footer__section-title">Circulation Hours</h4>
            <div className="unilib-footer__hours-list">
              <p>Mon - Fri: 08:00 - 22:00</p>
              <p>Saturday: 09:00 - 18:00</p>
              <p>Sunday: 10:00 - 16:00 (Reading Room only)</p>
              <p className="unilib-footer__highlight-text">
                Standard Loan: 14 Days
              </p>
            </div>
          </div>
        </div>

        <div className="unilib-footer__bottom-row">
          <p>© {new Date().getFullYear()} UniLib Academic Library.</p>
        </div>
      </div>
    </footer>
  );
};
