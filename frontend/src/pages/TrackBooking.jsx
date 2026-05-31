import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './TrackBooking.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import API from '../utils/axios';

// ── HELPERS ───────────────────────────────────────────────

const STATUS_CONFIG = {
  pending: {
    icon: '⏳', label: 'Booking Pending',
    sub: 'Your booking is waiting to be confirmed by the plumber.',
    banner: 'pending', eta: '—',
  },
  confirmed: {
    icon: '✅', label: 'Booking Confirmed',
    sub: 'Your plumber has confirmed and will arrive at the scheduled time.',
    banner: 'confirmed', eta: '~30 min',
  },
  'in-progress': {
    icon: '🔧', label: 'Work In Progress',
    sub: 'Your plumber is currently working on the job.',
    banner: 'in-progress', eta: 'Ongoing',
  },
  completed: {
    icon: '🎉', label: 'Job Completed',
    sub: 'The job has been completed successfully. Please rate your experience.',
    banner: 'completed', eta: 'Done',
  },
  cancelled: {
    icon: '❌', label: 'Booking Cancelled',
    sub: 'This booking has been cancelled.',
    banner: 'cancelled', eta: '—',
  },
};

const TIMELINE_STEPS = [
  { key: 'pending',     label: 'Booking Placed',    desc: 'Your booking request was submitted',       icon: '📋' },
  { key: 'confirmed',   label: 'Plumber Confirmed',  desc: 'Plumber accepted and is on the way',       icon: '✅' },
  { key: 'in-progress', label: 'Work Started',       desc: 'Plumber has arrived and started the job',  icon: '🔧' },
  { key: 'completed',   label: 'Job Completed',      desc: 'Service completed successfully',            icon: '🎉' },
];

const STATUS_ORDER = ['pending', 'confirmed', 'in-progress', 'completed'];

function getStepState(stepKey, currentStatus) {
  if (currentStatus === 'cancelled') return 'pending-step';
  const stepIdx    = STATUS_ORDER.indexOf(stepKey);
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  if (stepIdx < currentIdx)  return 'done';
  if (stepIdx === currentIdx) return 'active';
  return 'pending-step';
}

// ── CANCEL MODAL ──────────────────────────────────────────

function CancelModal({ onConfirm, onClose, loading }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Cancel Booking?</div>
        <div className="modal-sub">
          Are you sure you want to cancel this booking? This action cannot be undone.
          Cancellations made less than 1 hour before the scheduled time may incur a fee.
        </div>
        <div className="modal-actions">
          <button className="btn-modal-back" onClick={onClose}>Keep Booking</button>
          <button className="btn-modal-cancel" onClick={onConfirm} disabled={loading}>
            {loading ? 'Cancelling...' : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────

export default function TrackBooking() {
  const navigate           = useNavigate();
  const { isLoggedIn }     = useAuth();

  const [bookings, setBookings]         = useState([]);
  const [selectedId, setSelectedId]     = useState('');
  const [booking, setBooking]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [showCancel, setShowCancel]     = useState(false);
  const [cancelling, setCancelling]     = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) navigate('/login');
  }, [isLoggedIn]);

  // Fetch all bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await API.get('/bookings/my');
        setBookings(data.bookings);
        if (data.bookings.length > 0) {
          // Auto-select most recent active booking
          const active = data.bookings.find(b => b.status !== 'completed' && b.status !== 'cancelled');
          const first  = active || data.bookings[0];
          setSelectedId(first._id);
          setBooking(first);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Load selected booking
  const handleSelectBooking = (id) => {
    setSelectedId(id);
    const found = bookings.find(b => b._id === id);
    setBooking(found);
    setCancelSuccess(false);
  };

  // Cancel booking
  const handleCancel = async () => {
    setCancelling(true);
    try {
      await API.delete(`/bookings/${booking._id}`);
      setBooking({ ...booking, status: 'cancelled' });
      setBookings(bookings.map(b => b._id === booking._id ? { ...b, status: 'cancelled' } : b));
      setCancelSuccess(true);
      setShowCancel(false);
    } catch (err) {
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  const config = booking ? STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending : null;

  // ── RENDER ────────────────────────────────────────────

  return (
    <div className="track-page">
      <Navbar />

      {/* HERO */}
      <section className="track-hero">
        <div className="track-hero-bg b1" />
        <div className="track-hero-bg b2" />
        <div className="container fade-up">
          <div className="track-tag">
            <span className="track-tag-dot" />
            Live Tracking
          </div>
          <h1 className="track-hero-title">Track Your <span className="accent">Booking</span></h1>
          <p className="track-hero-sub">Monitor your booking status and stay updated in real time.</p>
        </div>
      </section>

      {/* MAIN */}
      <div className="track-layout">
        <div className="container">

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-light)' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
              <div>Loading your bookings...</div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="track-card">
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <div className="empty-title">No Bookings Found</div>
                <div className="empty-sub">You haven't made any bookings yet. Book a plumber to get started!</div>
                <button className="btn-go-book" onClick={() => navigate('/book')}>🔧 Book a Plumber</button>
              </div>
            </div>
          ) : (
            <div className="track-grid">

              {/* LEFT COLUMN */}
              <div>

                {/* Booking Selector */}
                <div className="track-card fade-up">
                  <div className="track-card-header">
                    <div className="track-card-title">📋 Select Booking</div>
                  </div>
                  <div className="track-card-body">
                    <div className="booking-select-wrap">
                      <select
                        className="booking-select"
                        value={selectedId}
                        onChange={(e) => handleSelectBooking(e.target.value)}
                      >
                        {bookings.map((b) => (
                          <option key={b._id} value={b._id}>
                            {b.service} — {new Date(b.scheduledAt).toLocaleDateString('en-IN')} [{b.status}]
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {booking && (
                  <>
                    {/* Cancel success */}
                    {cancelSuccess && (
                      <div style={{ background: 'var(--success-bg)', border: '1px solid #9FE1CB', borderRadius: 'var(--radius-sm)', padding: '12px 16px', fontSize: '13px', color: 'var(--success)', marginBottom: '16px' }}>
                        ✅ Booking cancelled successfully.
                      </div>
                    )}

                    {/* Status Banner */}
                    <div className={`status-banner ${config.banner} fade-up`}>
                      <div className="status-banner-icon">{config.icon}</div>
                      <div>
                        <div className="status-banner-title">{config.label}</div>
                        <div className="status-banner-sub">{config.sub}</div>
                      </div>
                    </div>

                    {/* ETA Card */}
                    {booking.status !== 'cancelled' && (
                      <div className="eta-card fade-up">
                        <div>
                          <div className="eta-label">Estimated Arrival / Time</div>
                          <div className="eta-time">{config.eta}</div>
                          <div className="eta-unit">
                            {booking.status === 'completed' ? 'Completed' : 'from now'}
                          </div>
                        </div>
                        <div className="eta-right">
                          <div className="eta-status">Scheduled for</div>
                          <div style={{ color: 'white', fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>
                            {new Date(booking.scheduledAt).toLocaleString('en-IN', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </div>
                          {booking.status !== 'completed' && (
                            <div className="eta-pulse">
                              <span className="eta-pulse-dot" />
                              Live
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Plumber Info */}
                    {booking.plumber && (
                      <div className="track-card fade-up">
                        <div className="track-card-header">
                          <div className="track-card-title">👨‍🔧 Your Plumber</div>
                        </div>
                        <div className="track-card-body">
                          <div className="plumber-info-card">
                            <div className="plumber-info-avatar">👨‍🔧</div>
                            <div>
                              <div className="plumber-info-name">{booking.plumber?.name || 'Assigned Plumber'}</div>
                              <div className="plumber-info-spec">{booking.plumber?.specialization || booking.plumber?.specialisation || 'Professional Plumber'}</div>
                              <div className="plumber-info-rating">⭐ {booking.plumber?.rating || '4.8'}</div>
                            </div>
                            <div className="plumber-info-actions">
                              <button className="btn-call" onClick={() => window.location.href = 'tel:+917278984078'}>
                                📞 Call
                              </button>
                              <button className="btn-message" onClick={() => navigate('/contact')}>
                                💬 Message
                              </button>
                            </div>
                          </div>

                          {/* Cancel Button */}
                          {(booking.status === 'pending' || booking.status === 'confirmed') && (
                            <button
                              className="btn-cancel-booking"
                              onClick={() => setShowCancel(true)}
                              disabled={cancelling}
                            >
                              ❌ Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="track-card fade-up">
                      <div className="track-card-header">
                        <div className="track-card-title">📍 Booking Timeline</div>
                        <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                          Updated live
                        </span>
                      </div>
                      <div className="track-card-body">
                        {booking.status === 'cancelled' ? (
                          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--error)' }}>
                            <div style={{ fontSize: '36px', marginBottom: '10px' }}>❌</div>
                            <div style={{ fontWeight: 600 }}>This booking was cancelled</div>
                          </div>
                        ) : (
                          <div className="timeline">
                            {TIMELINE_STEPS.map((step, i) => {
                              const state = getStepState(step.key, booking.status);
                              return (
                                <div key={step.key} className={`timeline-item ${state}`}>
                                  <div className="timeline-dot">
                                    {state === 'done' ? '✓' : state === 'active' ? '●' : '○'}
                                  </div>
                                  {i < TIMELINE_STEPS.length - 1 && <div className="timeline-line" />}
                                  <div className="timeline-content">
                                    <div className="timeline-title">{step.icon} {step.label}</div>
                                    <div className="timeline-desc">{step.desc}</div>
                                    {state === 'active' && (
                                      <div className="timeline-time">● In progress now</div>
                                    )}
                                    {state === 'done' && (
                                      <div className="timeline-time">✓ Completed</div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                  </>
                )}
              </div>

              {/* RIGHT COLUMN: Booking Details */}
              <div>
                {booking && (
                  <div className="track-card fade-up" style={{ position: 'sticky', top: '90px' }}>
                    <div className="track-card-header">
                      <div className="track-card-title">📄 Booking Details</div>
                    </div>
                    <div className="track-card-body">
                      {[
                        { label: '🔧 Service',    value: booking.service },
                        { label: '📍 Address',    value: booking.address },
                        { label: '🌆 City',       value: booking.city },
                        { label: '📅 Scheduled',  value: new Date(booking.scheduledAt).toLocaleString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) },
                        { label: '💰 Amount',     value: `₹${booking.amount}` },
                        { label: '💬 Notes',      value: booking.notes || '—' },
                        { label: '📌 Status',     value: booking.status.charAt(0).toUpperCase() + booking.status.slice(1) },
                        { label: '🆔 Booking ID', value: booking._id?.slice(-8).toUpperCase() },
                      ].map(({ label, value }) => (
                        <div className="detail-row" key={label}>
                          <span className="detail-label">{label}</span>
                          <span className="detail-value">{value}</span>
                        </div>
                      ))}

                      {booking.status === 'completed' && (
                        <button
                          className="btn-call w-100 mt-3"
                          style={{ justifyContent: 'center' }}
                          onClick={() => navigate('/profile')}
                        >
                          ⭐ Leave a Review
                        </button>
                      )}

                      <button
                        className="btn-message w-100 mt-2"
                        style={{ justifyContent: 'center' }}
                        onClick={() => navigate('/book')}
                      >
                        🔧 Book Another Service
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancel && (
        <CancelModal
          onConfirm={handleCancel}
          onClose={() => setShowCancel(false)}
          loading={cancelling}
        />
      )}

      <Footer />
    </div>
  );
}
