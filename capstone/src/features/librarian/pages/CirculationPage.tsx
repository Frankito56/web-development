import React, { useEffect, useState, useCallback } from 'react';
import {
  ClipboardList,
  BookOpen,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Mail,
  Badge as BadgeIcon,
  RefreshCw,
  Package,
  Search,
  X,
} from 'lucide-react';
import { apiClient, ApiLoan, ApiReservation } from '@/services/apiClient';
import { Button } from '@/components/ui/Button';
import { useNotification } from '@/context/NotificationContext';
import './CirculationPage.css';

type Tab = 'loans' | 'reservations' | 'overdue';

interface CirculationData {
  loans: ApiLoan[];
  reservations: ApiReservation[];
  overdueLoans: ApiLoan[];
}

const getBookTitle = (l: ApiLoan | ApiReservation): string =>
  (l as any).book?.title || (l as any).bookTitle || 'Unknown Book';

const getBookCover = (l: ApiLoan | ApiReservation): string | undefined =>
  (l as any).book?.coverUrl || (l as any).bookCoverUrl;

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const daysFromNow = (dateStr: string): number => {
  const now = Date.now();
  const target = new Date(dateStr).getTime();
  const diff = target - now;
  if (diff < 0) return Math.floor(diff / (1000 * 60 * 60 * 24));
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const loanStatusLabel = (status: ApiLoan['status']): { label: string; cls: string } => {
  switch (status) {
    case 'PENDING_PICKUP': return { label: 'Pending Pickup', cls: 'circ-status--pending' };
    case 'ACTIVE':         return { label: 'Checked Out', cls: 'circ-status--active' };
    case 'DELIVERED':      return { label: 'Delivered', cls: 'circ-status--delivered' };
    case 'OVERDUE':        return { label: 'Overdue', cls: 'circ-status--overdue' };
    case 'RETURNED':       return { label: 'Returned', cls: 'circ-status--returned' };
    default:               return { label: status, cls: '' };
  }
};

export const CirculationPage: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<Tab>('loans');
  const [data, setData] = useState<CirculationData>({ loans: [], reservations: [], overdueLoans: [] });
  const [loading, setLoading] = useState(true);
  const [delivering, setDelivering] = useState<string | null>(null);
  const [returning, setReturning] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const overview = await apiClient.loans.getCirculationOverview();
      setData(overview);
    } catch (e: any) {
      showToast('Error', e.message || 'Failed to load circulation data', 'ERROR');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDeliver = async (loanId: string) => {
    setDelivering(loanId);
    try {
      await apiClient.loans.deliverLoan(loanId);
      showToast('Success', 'Book delivered successfully. 14-day loan period started.', 'SUCCESS');
      await load();
    } catch (e: any) {
      showToast('Error', e.message || 'Failed to deliver loan', 'ERROR');
    } finally {
      setDelivering(null);
    }
  };

  const handleReturn = async (loanId: string) => {
    setReturning(loanId);
    try {
      await apiClient.loans.returnLoan(loanId);
      showToast('Success', 'Book returned successfully. Inventory updated.', 'SUCCESS');
      await load();
    } catch (e: any) {
      showToast('Error', e.message || 'Failed to return book', 'ERROR');
    } finally {
      setReturning(null);
    }
  };

  const matchesSearch = (item: ApiLoan | ApiReservation): boolean => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const userName = (item.user?.name || '').toLowerCase();
    const studentOrEmployeeId = (item.user?.studentOrEmployeeId || '').toLowerCase();
    const department = (item.user?.department || '').toLowerCase();
    const email = (item.user?.email || '').toLowerCase();
    const title = getBookTitle(item).toLowerCase();

    return (
      userName.includes(q) ||
      studentOrEmployeeId.includes(q) ||
      department.includes(q) ||
      email.includes(q) ||
      title.includes(q)
    );
  };

  const pendingLoans = data.loans.filter((l) => l.status === 'PENDING_PICKUP');
  const activeLoans = data.loans.filter((l) => l.status === 'ACTIVE' || l.status === 'DELIVERED');

  const filteredPendingLoans = pendingLoans.filter(matchesSearch);
  const filteredActiveLoans = activeLoans.filter(matchesSearch);
  const filteredReservations = data.reservations.filter(matchesSearch);
  const filteredOverdueLoans = data.overdueLoans.filter(matchesSearch);

  return (
    <main className="circ-page">
      {/* Page Header */}
      <div className="circ-page__header">
        <div className="circ-page__header-icon">
          <ClipboardList size={28} />
        </div>
        <div>
          <h1 className="circ-page__title">Circulation Desk</h1>
          <p className="circ-page__subtitle">Manage active loans, pickup queue, and overdue returns</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={load}
          disabled={loading}
          className="circ-page__refresh-btn"
        >
          <RefreshCw size={14} className={loading ? 'circ-spin' : ''} />
          Refresh
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="circ-stats-bar">
        <div className="circ-stat">
          <Package size={18} className="circ-stat__icon circ-stat__icon--pending" />
          <div>
            <div className="circ-stat__value">{pendingLoans.length}</div>
            <div className="circ-stat__label">Pending Pickup</div>
          </div>
        </div>
        <div className="circ-stat">
          <BookOpen size={18} className="circ-stat__icon circ-stat__icon--active" />
          <div>
            <div className="circ-stat__value">{activeLoans.length}</div>
            <div className="circ-stat__label">Active Loans</div>
          </div>
        </div>
        <div className="circ-stat">
          <Clock size={18} className="circ-stat__icon circ-stat__icon--queue" />
          <div>
            <div className="circ-stat__value">{data.reservations.length}</div>
            <div className="circ-stat__label">In Queue</div>
          </div>
        </div>
        <div className="circ-stat">
          <AlertTriangle size={18} className="circ-stat__icon circ-stat__icon--overdue" />
          <div>
            <div className="circ-stat__value">{data.overdueLoans.length}</div>
            <div className="circ-stat__label">Overdue</div>
          </div>
        </div>
      </div>

      {/* Search Patron by Name or Student/Professor Code */}
      <div className="circ-search-bar">
        <div className="circ-search-input-wrap">
          <Search size={18} className="circ-search-icon" />
          <input
            type="text"
            className="circ-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patron name, campus ID code (e.g. EST-9901, PROF-2024), or book title..."
          />
          {searchQuery && (
            <button
              type="button"
              className="circ-search-clear"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {searchQuery.trim() && (
          <div className="circ-search-feedback">
            <span>Filtering by: <strong>"{searchQuery}"</strong></span>
            <span className="circ-search-count">
              {filteredPendingLoans.length + filteredActiveLoans.length} loans · {filteredReservations.length} reservations · {filteredOverdueLoans.length} overdue
            </span>
            <button
              type="button"
              className="circ-search-clear-btn"
              onClick={() => setSearchQuery('')}
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="circ-tabs">
        <button
          className={`circ-tab ${activeTab === 'loans' ? 'circ-tab--active' : ''}`}
          onClick={() => setActiveTab('loans')}
        >
          <BookOpen size={15} />
          Loans
          {(filteredPendingLoans.length + filteredActiveLoans.length) > 0 && (
            <span className="circ-tab__badge">
              {filteredPendingLoans.length + filteredActiveLoans.length}
            </span>
          )}
        </button>
        <button
          className={`circ-tab ${activeTab === 'reservations' ? 'circ-tab--active' : ''}`}
          onClick={() => setActiveTab('reservations')}
        >
          <Clock size={15} />
          Reservations Queue
          {filteredReservations.length > 0 && (
            <span className="circ-tab__badge">{filteredReservations.length}</span>
          )}
        </button>
        <button
          className={`circ-tab ${activeTab === 'overdue' ? 'circ-tab--active' : ''} ${filteredOverdueLoans.length > 0 ? 'circ-tab--danger' : ''}`}
          onClick={() => setActiveTab('overdue')}
        >
          <AlertTriangle size={15} />
          Overdue
          {filteredOverdueLoans.length > 0 && (
            <span className="circ-tab__badge circ-tab__badge--danger">{filteredOverdueLoans.length}</span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="circ-content">
        {loading ? (
          <div className="circ-loading">
            <RefreshCw size={32} className="circ-spin" />
            <p>Loading circulation data…</p>
          </div>
        ) : (
          <>
            {/* LOANS TAB */}
            {activeTab === 'loans' && (
              <div className="circ-section">
                {/* Pending Pickup sub-section */}
                {pendingLoans.length > 0 && (
                  <>
                    <h2 className="circ-section__title circ-section__title--pending">
                      <Package size={16} /> Pending Pickup ({filteredPendingLoans.length}{searchQuery ? ` of ${pendingLoans.length}` : ''})
                    </h2>
                    {filteredPendingLoans.length === 0 ? (
                      <div className="circ-empty" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                        No pending pickups match "{searchQuery}".
                      </div>
                    ) : (
                      <div className="circ-table-wrap">
                        <table className="circ-table">
                          <thead>
                            <tr>
                              <th>Book</th>
                              <th>Patron</th>
                              <th>ID / Dept</th>
                              <th>Due Date</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredPendingLoans.map((loan) => (
                              <tr key={loan.id} className="circ-table__row circ-table__row--pending">
                                <td>
                                  <div className="circ-book-cell">
                                    {getBookCover(loan) ? (
                                      <img src={getBookCover(loan)} alt="" className="circ-book-thumb" />
                                    ) : (
                                      <div className="circ-book-thumb circ-book-thumb--fallback">
                                        <BookOpen size={16} />
                                      </div>
                                    )}
                                    <span className="circ-book-title">{getBookTitle(loan)}</span>
                                  </div>
                                </td>
                                <td>
                                  <div className="circ-patron-cell">
                                    <User size={14} />
                                    <div>
                                      <div className="circ-patron-name">{loan.user?.name || loan.userId}</div>
                                      <div className="circ-patron-email">
                                        <Mail size={11} /> {loan.user?.email || '—'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="circ-id-cell">
                                    <span className="circ-id-badge">{loan.user?.studentOrEmployeeId || '—'}</span>
                                    <span className="circ-dept">{loan.user?.department || ''}</span>
                                  </div>
                                </td>
                                <td>{formatDate(loan.dueDate)}</td>
                                <td>
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => handleDeliver(loan.id)}
                                    disabled={delivering === loan.id}
                                  >
                                    {delivering === loan.id ? (
                                      <><RefreshCw size={12} className="circ-spin" /> Delivering…</>
                                    ) : (
                                      <><CheckCircle size={12} /> Deliver Book</>
                                    )}
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}

                {/* Active Loans sub-section */}
                <h2 className="circ-section__title">
                  <BookOpen size={16} /> Active Loans ({filteredActiveLoans.length}{searchQuery ? ` of ${activeLoans.length}` : ''})
                </h2>
                {activeLoans.length === 0 ? (
                  <div className="circ-empty">No active loans at the moment.</div>
                ) : filteredActiveLoans.length === 0 ? (
                  <div className="circ-empty">No active loans match "{searchQuery}".</div>
                ) : (
                  <div className="circ-table-wrap">
                    <table className="circ-table">
                      <thead>
                        <tr>
                          <th>Book</th>
                          <th>Patron</th>
                          <th>ID / Dept</th>
                          <th>Status</th>
                          <th>Due Date</th>
                          <th>Days Left</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredActiveLoans.map((loan) => {
                          const daysLeft = daysFromNow(loan.dueDate);
                          const statusInfo = loanStatusLabel(loan.status);
                          return (
                            <tr key={loan.id} className={`circ-table__row ${daysLeft < 0 ? 'circ-table__row--overdue' : daysLeft <= 3 ? 'circ-table__row--warning' : ''}`}>
                              <td>
                                <div className="circ-book-cell">
                                  {getBookCover(loan) ? (
                                    <img src={getBookCover(loan)} alt="" className="circ-book-thumb" />
                                  ) : (
                                    <div className="circ-book-thumb circ-book-thumb--fallback">
                                      <BookOpen size={16} />
                                    </div>
                                  )}
                                  <span className="circ-book-title">{getBookTitle(loan)}</span>
                                </div>
                              </td>
                              <td>
                                <div className="circ-patron-cell">
                                  <User size={14} />
                                  <div>
                                    <div className="circ-patron-name">{loan.user?.name || loan.userId}</div>
                                    <div className="circ-patron-email">
                                      <Mail size={11} /> {loan.user?.email || '—'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="circ-id-cell">
                                  <span className="circ-id-badge">{loan.user?.studentOrEmployeeId || '—'}</span>
                                  <span className="circ-dept">{loan.user?.department || ''}</span>
                                </div>
                              </td>
                              <td><span className={`circ-status ${statusInfo.cls}`}>{statusInfo.label}</span></td>
                              <td>{formatDate(loan.dueDate)}</td>
                              <td>
                                <span className={`circ-days ${daysLeft < 0 ? 'circ-days--late' : daysLeft <= 3 ? 'circ-days--soon' : 'circ-days--ok'}`}>
                                  {daysLeft < 0 ? `${Math.abs(daysLeft)}d late` : daysLeft === 0 ? 'Today' : `${daysLeft}d`}
                                </span>
                              </td>
                              <td>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReturn(loan.id)}
                                  disabled={returning === loan.id}
                                >
                                  {returning === loan.id ? (
                                    <><RefreshCw size={12} className="circ-spin" /> Returning…</>
                                  ) : (
                                    <><CheckCircle size={12} /> Return Book</>
                                  )}
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                {pendingLoans.length === 0 && activeLoans.length === 0 && (
                  <div className="circ-empty">No loans to show.</div>
                )}
              </div>
            )}

            {/* RESERVATIONS TAB */}
            {activeTab === 'reservations' && (
              <div className="circ-section">
                <h2 className="circ-section__title">
                  <Clock size={16} /> Reservations Queue ({filteredReservations.length}{searchQuery ? ` of ${data.reservations.length}` : ''})
                </h2>
                {data.reservations.length === 0 ? (
                  <div className="circ-empty">No active reservations in the queue.</div>
                ) : filteredReservations.length === 0 ? (
                  <div className="circ-empty">No reservations match "{searchQuery}".</div>
                ) : (
                  <div className="circ-table-wrap">
                    <table className="circ-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Book</th>
                          <th>Patron</th>
                          <th>ID / Dept</th>
                          <th>Reserved On</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReservations.map((res) => (
                          <tr key={res.id} className="circ-table__row">
                            <td>
                              <span className="circ-queue-pos">#{res.priorityOrder}</span>
                            </td>
                            <td>
                              <div className="circ-book-cell">
                                {getBookCover(res) ? (
                                  <img src={getBookCover(res)} alt="" className="circ-book-thumb" />
                                ) : (
                                  <div className="circ-book-thumb circ-book-thumb--fallback">
                                    <BookOpen size={16} />
                                  </div>
                                )}
                                <span className="circ-book-title">{getBookTitle(res)}</span>
                              </div>
                            </td>
                            <td>
                              <div className="circ-patron-cell">
                                <User size={14} />
                                <div>
                                  <div className="circ-patron-name">{res.user?.name || res.userId}</div>
                                  <div className="circ-patron-email">
                                    <Mail size={11} /> {res.user?.email || '—'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="circ-id-cell">
                                <span className="circ-id-badge">{res.user?.studentOrEmployeeId || '—'}</span>
                                <span className="circ-dept">{res.user?.department || ''}</span>
                              </div>
                            </td>
                            <td>{formatDate(res.reservedAt)}</td>
                            <td>
                              <span className={`circ-status ${res.status === 'READY_FOR_PICKUP' ? 'circ-status--active' : 'circ-status--pending'}`}>
                                {res.status === 'READY_FOR_PICKUP' ? 'Ready' : 'Waiting'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* OVERDUE TAB */}
            {activeTab === 'overdue' && (
              <div className="circ-section">
                <h2 className="circ-section__title circ-section__title--danger">
                  <AlertTriangle size={16} /> Overdue Loans ({filteredOverdueLoans.length}{searchQuery ? ` of ${data.overdueLoans.length}` : ''})
                </h2>
                {data.overdueLoans.length === 0 ? (
                  <div className="circ-empty circ-empty--success">
                    <CheckCircle size={24} />
                    No overdue loans — great job!
                  </div>
                ) : filteredOverdueLoans.length === 0 ? (
                  <div className="circ-empty">No overdue loans match "{searchQuery}".</div>
                ) : (
                  <div className="circ-table-wrap">
                    <table className="circ-table">
                      <thead>
                        <tr>
                          <th>Book</th>
                          <th>Patron</th>
                          <th>Contact</th>
                          <th>Due Date</th>
                          <th>Days Overdue</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOverdueLoans.map((loan) => {
                          const daysOverdue = Math.abs(daysFromNow(loan.dueDate));
                          return (
                            <tr key={loan.id} className="circ-table__row circ-table__row--overdue">
                              <td>
                                <div className="circ-book-cell">
                                  {getBookCover(loan) ? (
                                    <img src={getBookCover(loan)} alt="" className="circ-book-thumb" />
                                  ) : (
                                    <div className="circ-book-thumb circ-book-thumb--fallback">
                                      <BookOpen size={16} />
                                    </div>
                                  )}
                                  <span className="circ-book-title">{getBookTitle(loan)}</span>
                                </div>
                              </td>
                              <td>
                                <div className="circ-patron-cell">
                                  <User size={14} />
                                  <div>
                                    <div className="circ-patron-name">{loan.user?.name || loan.userId}</div>
                                    <div className="circ-patron-meta">
                                      <BadgeIcon size={11} /> {loan.user?.studentOrEmployeeId || '—'} · {loan.user?.department || '—'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="circ-patron-email">
                                  <Mail size={11} /> {loan.user?.email || '—'}
                                </div>
                              </td>
                              <td>{formatDate(loan.dueDate)}</td>
                              <td>
                                <span className="circ-overdue-badge">
                                  {daysOverdue}d overdue
                                </span>
                              </td>
                              <td>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReturn(loan.id)}
                                  disabled={returning === loan.id}
                                >
                                  {returning === loan.id ? (
                                    <><RefreshCw size={12} className="circ-spin" /> Returning…</>
                                  ) : (
                                    <><CheckCircle size={12} /> Return Book</>
                                  )}
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default CirculationPage;
