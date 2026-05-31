import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CustomerProfile.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import API from '../utils/axios';

const NAV_ITEMS = [
  { key: 'info',     icon: '👤', label: 'Personal Info' },
  { key: 'edit',     icon: '✏️', label: 'Edit Profile' },
  { key: 'bookings', icon: '📋', label: 'Booking History' },
  { key: 'reviews',  icon: '⭐', label: 'My Reviews' },
  { key: 'password', icon: '🔒', label: 'Change Password' },
];

function Stars({ count }) {
  return <span>{'★'.repeat(count)}{'☆'.repeat(5 - count)}</span>;
}

function StatusBadge({ status }) {
  return (
    <span className={`booking-status status-${status}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ── PERSONAL INFO ─────────────────────────────────────────
function PersonalInfo({ user }) {
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'N/A';

  return (
    <div className="content-card fade-up">
      <div className="content-card-header">
        <div className="content-card-title"><span>👤</span> Personal Information</div>
      </div>
      <div className="content-card-body">
        <div className="info-grid">
          <div className="info-item">
            <div className="info-label">Full Name</div>
            <div className="info-value">{user?.name || '—'}</div>
          </div>
          <div className="info-item">
            <div className="info-label">First Name</div>
            <div className="info-value">{user?.firstName || '—'}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Last Name</div>
            <div className="info-value">{user?.lastName || '—'}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Email Address</div>
            <div className="info-value">{user?.email || '—'}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Mobile Number</div>
            <div className="info-value">{user?.mobile || user?.phone || '—'}</div>
          </div>
          <div className="info-item">
            <div className="info-label">City</div>
            <div className="info-value">{user?.city || '—'}</div>
          </div>
          <div className="info-item" style={{ gridColumn: '1 / -1' }}>
            <div className="info-label">Address</div>
            <div className="info-value">{user?.address || '—'}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Pincode</div>
            <div className="info-value">{user?.pincode || '—'}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Member Since</div>
            <div className="info-value">{joinDate}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── EDIT PROFILE ──────────────────────────────────────────
function EditProfile({ user }) {
  const { updateProfile } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    mobile:    user?.mobile || user?.phone || '',
    address: user?.address || '',
    city:    user?.city    || '',
    pincode: user?.pincode || '',
  });
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setError('');
    setLoading(true);
    try {
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-card fade-up">
      <div className="content-card-header">
        <div className="content-card-title"><span>✏️</span> Edit Profile</div>
      </div>
      <div className="content-card-body">
        {saved && <div className="success-alert">✅ Profile updated successfully!</div>}
        {error && <div style={{ background:'#FFF5F5', border:'1px solid #FED7D7', borderRadius:'var(--radius-sm)', padding:'12px 16px', fontSize:'13px', color:'var(--error)', marginBottom:'20px' }}>⚠️ {error}</div>}
        <div className="form-grid">
          <div className="field-group">
            <label className="field-label">First Name</label>
            <div className="field-wrap">
              <span className="field-icon">👤</span>
              <input className="field-input" name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Last Name</label>
            <div className="field-wrap">
              <span className="field-icon">👤</span>
              <input className="field-input" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Mobile Number</label>
            <div className="field-wrap">
              <span className="field-icon">📞</span>
              <input className="field-input" name="mobile" value={form.mobile} onChange={handleChange} placeholder="+91 00000 00000" />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">City</label>
            <div className="field-wrap">
              <span className="field-icon">🌆</span>
              <input className="field-input" name="city" value={form.city} onChange={handleChange} placeholder="Your city" />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Pincode</label>
            <div className="field-wrap">
              <span className="field-icon">🏷️</span>
              <input className="field-input" name="pincode" value={form.pincode} onChange={handleChange} placeholder="700000" />
            </div>
          </div>
        </div>
        <div className="field-group">
          <label className="field-label">Full Address</label>
          <div className="field-wrap">
            <span className="field-icon">📍</span>
            <input className="field-input" name="address" value={form.address} onChange={handleChange} placeholder="House/Flat, Street, Area" />
          </div>
        </div>
        <div className="d-flex gap-3 mt-2">
          <button className="btn-save" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button className="btn-cancel">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── BOOKING HISTORY ───────────────────────────────────────
function BookingHistory({ onStatsUpdate }) {
  const navigate            = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [reviewedBookingIds, setReviewedBookingIds] = useState(new Set());
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [loading, setLoading]   = useState(true);

  const serviceIcons = {
    'Pipe Leak Repair': '🔧', 'Drain Cleaning': '🪠',
    'Bathroom Fitting': '🚿', 'Water Heater Fix': '💧',
    'Toilet Repair': '🚽', 'Tap & Faucet Repair': '🚰',
    'New Installation': '🏗️', 'Emergency Fix': '🔩',
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const [bookingsRes, reviewsRes] = await Promise.all([
          API.get('/bookings/my'),
          API.get('/reviews/my'),
        ]);
        const bookingList = bookingsRes.data.bookings || [];
        setBookings(bookingList);
        setReviewedBookingIds(new Set(
          (reviewsRes.data.reviews || [])
            .map((review) => String(review.booking || review.booking?._id || ''))
            .filter(Boolean)
        ));
        // Pass stats up to parent
        if (onStatsUpdate) {
          const total  = bookingList.length;
          const spent  = bookingList
            .filter(b => b.status === 'completed')
            .reduce((sum, b) => sum + (b.amount || 0), 0);
          onStatsUpdate({ total, spent });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await API.delete(`/bookings/${id}`);
      setBookings(bookings.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const openReviewForm = (booking) => {
    setReviewTarget(booking);
    setReviewForm({ rating: 5, comment: '' });
    setReviewError('');
    setReviewSuccess('');
  };

  const submitReview = async () => {
    if (!reviewTarget) return;
    const comment = reviewForm.comment.trim();
    if (!comment) {
      setReviewError('Please write a short review.');
      return;
    }

    setReviewSubmitting(true);
    setReviewError('');
    try {
      await API.post('/reviews', {
        plumber: reviewTarget.plumber?._id,
        booking: reviewTarget._id,
        rating: Number(reviewForm.rating),
        comment,
      });
      setReviewedBookingIds(new Set([...reviewedBookingIds, reviewTarget._id]));
      setReviewTarget(null);
      setReviewSuccess('Review submitted successfully.');
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Could not submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) return (
    <div className="content-card fade-up">
      <div className="content-card-body" style={{ textAlign:'center', padding:'40px', color:'var(--text-light)' }}>
        Loading bookings...
      </div>
    </div>
  );

  return (
    <div className="content-card fade-up">
      <div className="content-card-header">
        <div className="content-card-title"><span>📋</span> Booking History</div>
        <span style={{ fontSize:'13px', color:'var(--text-light)' }}>{bookings.length} bookings</span>
      </div>
      <div className="content-card-body">
        {reviewSuccess && (
          <div className="success-alert">{reviewSuccess}</div>
        )}
        {reviewError && !reviewTarget && (
          <div style={{ background:'#FFF5F5', border:'1px solid #FED7D7', borderRadius:'var(--radius-sm)', padding:'12px 16px', fontSize:'13px', color:'var(--error)', marginBottom:'20px' }}>
            ⚠️ {reviewError}
          </div>
        )}
        {bookings.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px', color:'var(--text-light)' }}>
            <div style={{ fontSize:'40px', marginBottom:'12px' }}>📋</div>
            <div style={{ marginBottom:'16px' }}>No bookings yet</div>
            <button
              onClick={() => navigate('/book')}
              className="btn-save"
              style={{ padding:'10px 24px' }}
            >
              🔧 Book a Plumber
            </button>
          </div>
        ) : bookings.map((b) => (
          <div className="booking-item" key={b._id}>
            <div className="booking-icon">{serviceIcons[b.service] || '🔧'}</div>
            <div className="booking-info">
              <div className="booking-service">{b.service}</div>
              <div className="booking-meta">
                👨‍🔧 {b.plumber?.name || 'Pending'} &nbsp;·&nbsp;
                📅 {new Date(b.scheduledAt).toLocaleDateString('en-IN')}
              </div>
            </div>
            <div className="booking-right">
              <div className="booking-amount">₹{b.amount}</div>
              <StatusBadge status={b.status} />
              <div style={{ display:'flex', gap:'6px', marginTop:'6px', justifyContent:'flex-end' }}>
                {/* Track Button */}
                <button
                  onClick={() => navigate('/track')}
                  style={{
                    background: 'var(--aqua-light)', color: 'var(--aqua-dark)',
                    border: '1px solid rgba(0,194,199,0.3)',
                    borderRadius: '6px', padding: '3px 10px',
                    fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  📍 Track
                </button>
                {/* Cancel Button */}
                {(b.status === 'pending' || b.status === 'confirmed') && (
                  <button
                    onClick={() => handleCancel(b._id)}
                    style={{
                      background: 'transparent', border: '1px solid #E53E3E',
                      color: '#E53E3E', borderRadius: '6px', padding: '3px 10px',
                      fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    ❌ Cancel
                  </button>
                )}
                {b.status === 'completed' && !reviewedBookingIds.has(String(b._id)) && (
                  <button
                    onClick={() => openReviewForm(b)}
                    style={{
                      background: '#FFF7E6', border: '1px solid #F6C85F',
                      color: '#9A6700', borderRadius: '6px', padding: '3px 10px',
                      fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    ⭐ Review
                  </button>
                )}
                {b.status === 'completed' && reviewedBookingIds.has(String(b._id)) && (
                  <span style={{ fontSize:'11px', color:'var(--success)', fontWeight:600 }}>
                    Reviewed
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {reviewTarget && (
          <div style={{ marginTop:'18px', padding:'18px', border:'1px solid rgba(0,194,199,0.18)', borderRadius:'var(--radius)', background:'white' }}>
            <div style={{ fontWeight:700, color:'var(--text-dark)', marginBottom:'4px' }}>
              Review {reviewTarget.plumber?.name || 'Technician'}
            </div>
            <div style={{ fontSize:'12px', color:'var(--text-light)', marginBottom:'14px' }}>
              {reviewTarget.service} · Booking #{reviewTarget._id?.slice(-8).toUpperCase()}
            </div>
            {reviewError && (
              <div style={{ background:'#FFF5F5', border:'1px solid #FED7D7', borderRadius:'var(--radius-sm)', padding:'10px 12px', fontSize:'13px', color:'var(--error)', marginBottom:'12px' }}>
                ⚠️ {reviewError}
              </div>
            )}
            <div className="field-group">
              <label className="field-label">Rating</label>
              <select
                className="field-input"
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
              >
                <option value="5">★★★★★ Excellent</option>
                <option value="4">★★★★ Good</option>
                <option value="3">★★★ Average</option>
                <option value="2">★★ Poor</option>
                <option value="1">★ Very poor</option>
              </select>
            </div>
            <div className="field-group">
              <label className="field-label">Comment</label>
              <textarea
                className="field-input"
                rows="4"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Share your service experience..."
                style={{ minHeight:'96px', resize:'vertical' }}
              />
            </div>
            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
              <button className="btn-cancel" onClick={() => setReviewTarget(null)} disabled={reviewSubmitting}>
                Cancel
              </button>
              <button className="btn-save" onClick={submitReview} disabled={reviewSubmitting}>
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MY REVIEWS ────────────────────────────────────────────
function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await API.get('/reviews/my');
        setReviews(data.reviews);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) return (
    <div className="content-card fade-up">
      <div className="content-card-body" style={{ textAlign:'center', padding:'40px', color:'var(--text-light)' }}>
        Loading reviews...
      </div>
    </div>
  );

  return (
    <div className="content-card fade-up">
      <div className="content-card-header">
        <div className="content-card-title"><span>⭐</span> My Reviews</div>
        <span style={{ fontSize:'13px', color:'var(--text-light)' }}>{reviews.length} reviews</span>
      </div>
      <div className="content-card-body">
        {reviews.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px', color:'var(--text-light)' }}>
            <div style={{ fontSize:'40px', marginBottom:'12px' }}>⭐</div>
            <div>No reviews yet. Complete a booking to leave a review!</div>
          </div>
        ) : reviews.map((r) => (
          <div className="review-item" key={r._id}>
            <div className="review-header">
              <div>
                <div className="review-plumber">{r.plumber?.name}</div>
                <div style={{ fontSize:'12px', color:'var(--text-light)' }}>{r.plumber?.specialization || r.plumber?.specialisation}</div>
              </div>
              <div className="review-date">{new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
            </div>
            <div className="review-stars"><Stars count={r.rating} /></div>
            <div className="review-text">{r.comment}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CHANGE PASSWORD ───────────────────────────────────────
function ChangePassword() {
  const { changePassword } = useAuth();
  const [form, setForm]       = useState({ current: '', newPass: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const getStrength = (pwd) => {
    if (!pwd) return null;
    if (pwd.length < 6) return 'weak';
    if (pwd.length < 10 || !/[0-9]/.test(pwd)) return 'medium';
    return 'strong';
  };
  const strength = getStrength(form.newPass);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleSave = async () => {
    if (!form.current || !form.newPass || !form.confirm) { setError('Please fill in all fields.'); return; }
    if (form.newPass !== form.confirm) { setError('New passwords do not match.'); return; }
    if (strength === 'weak') { setError('Password is too weak. Use at least 6 characters.'); return; }
    setLoading(true);
    try {
      await changePassword(form.current, form.newPass);
      setSaved(true);
      setForm({ current: '', newPass: '', confirm: '' });
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-card fade-up">
      <div className="content-card-header">
        <div className="content-card-title"><span>🔒</span> Change Password</div>
      </div>
      <div className="content-card-body" style={{ maxWidth:'480px' }}>
        {saved && <div className="success-alert">✅ Password changed successfully!</div>}
        {error && <div style={{ background:'#FFF5F5', border:'1px solid #FED7D7', borderRadius:'var(--radius-sm)', padding:'12px 16px', fontSize:'13px', color:'var(--error)', marginBottom:'20px' }}>⚠️ {error}</div>}
        <div className="field-group">
          <label className="field-label">Current Password</label>
          <div className="field-wrap">
            <span className="field-icon">🔑</span>
            <input className="field-input" name="current" type={showCurrent ? 'text' : 'password'} value={form.current} onChange={handleChange} placeholder="Enter current password" style={{ paddingRight:'40px' }} />
            <button className="eye-btn" onClick={() => setShowCurrent(!showCurrent)}>{showCurrent ? '🙈' : '👁️'}</button>
          </div>
        </div>
        <div className="field-group">
          <label className="field-label">New Password</label>
          <div className="field-wrap">
            <span className="field-icon">🔒</span>
            <input className="field-input" name="newPass" type={showNew ? 'text' : 'password'} value={form.newPass} onChange={handleChange} placeholder="Enter new password" style={{ paddingRight:'40px' }} />
            <button className="eye-btn" onClick={() => setShowNew(!showNew)}>{showNew ? '🙈' : '👁️'}</button>
          </div>
          {strength && (
            <div className={`password-strength strength-${strength}`}>
              <div className="strength-bar-wrap"><div className="strength-bar" /></div>
              <div className="strength-label">{strength === 'weak' ? 'Weak password' : strength === 'medium' ? 'Medium strength' : 'Strong password'}</div>
            </div>
          )}
        </div>
        <div className="field-group">
          <label className="field-label">Confirm New Password</label>
          <div className="field-wrap">
            <span className="field-icon">🔒</span>
            <input className="field-input" name="confirm" type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={handleChange} placeholder="Re-enter new password" style={{ paddingRight:'40px' }} />
            <button className="eye-btn" onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? '🙈' : '👁️'}</button>
          </div>
        </div>
        <div className="d-flex gap-3 mt-2">
          <button className="btn-save" onClick={handleSave} disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</button>
          <button className="btn-cancel" onClick={() => setForm({ current:'', newPass:'', confirm:'' })}>Clear</button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────
export default function CustomerProfile() {
  const navigate             = useNavigate();
  const location             = useLocation();
  const { user, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'info');
  const [stats, setStats]         = useState({ total: 0, spent: 0 });

  useEffect(() => {
    if (!isLoggedIn) navigate('/login');
  }, [isLoggedIn]);

  const renderContent = () => {
    switch (activeTab) {
      case 'info':     return <PersonalInfo user={user} />;
      case 'edit':     return <EditProfile user={user} />;
      case 'bookings': return <BookingHistory onStatsUpdate={setStats} />;
      case 'reviews':  return <MyReviews />;
      case 'password': return <ChangePassword />;
      default:         return <PersonalInfo user={user} />;
    }
  };

  return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-layout">
        <div className="profile-container">

          {/* SIDEBAR */}
          <div className="profile-sidebar">
            <div className="profile-card">
              <div className="profile-card-top">
                <div className="profile-avatar-wrap">
                  <div className="profile-avatar">👤</div>
                  <button className="avatar-edit-btn" onClick={() => setActiveTab('edit')}>✏️</button>
                </div>
                <div className="profile-name">{user?.name}</div>
                <div className="profile-email">{user?.email}</div>
                <div className="profile-badge">⭐ Verified Customer</div>
              </div>
              <div className="profile-card-stats">
                <div className="pcs-item">
                  <div className="pcs-num">{stats.total}</div>
                  <div className="pcs-label">Bookings</div>
                </div>
                <div className="pcs-item">
                  <div className="pcs-num">{user?.role}</div>
                  <div className="pcs-label">Role</div>
                </div>
                <div className="pcs-item">
                  <div className="pcs-num">₹{stats.spent}</div>
                  <div className="pcs-label">Spent</div>
                </div>
              </div>
            </div>

            {/* Sidebar Nav */}
            <div className="sidebar-nav">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.key}
                  className={`sidebar-nav-item ${activeTab === item.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.key)}
                >
                  <span className="sidebar-nav-icon">{item.icon}</span>
                  {item.label}
                </div>
              ))}
              {/* Track Booking shortcut */}
              <div
                className="sidebar-nav-item"
                onClick={() => navigate('/track')}
              >
                <span className="sidebar-nav-icon">📍</span>
                Track Booking
              </div>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="profile-main">
            {renderContent()}
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
