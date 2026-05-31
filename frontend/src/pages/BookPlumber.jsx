import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './BookPlumber.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import API from '../utils/axios';

const STEPS = ['Service', 'Plumber', 'Date & Address', 'Confirm'];
const MIN_BOOKING_LEAD_MINUTES = 30;
const BOOKING_DATE_TIME_ERROR = 'Enter a future date and time, minimum after 30 minutes from now.';

const pad = (value) => String(value).padStart(2, '0');

const roundUpToNextMinute = (date) => {
  const rounded = new Date(date);
  if (rounded.getSeconds() || rounded.getMilliseconds()) {
    rounded.setMinutes(rounded.getMinutes() + 1);
  }
  rounded.setSeconds(0, 0);
  return rounded;
};

const toDateInputValue = (date) => (
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
);

const toTimeInputValue = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const getMinimumBookingDateTime = () => (
  roundUpToNextMinute(new Date(Date.now() + MIN_BOOKING_LEAD_MINUTES * 60 * 1000))
);

const getSelectedBookingDateTime = (date, time) => {
  if (!date || !time) return null;
  const selected = new Date(`${date}T${time}`);
  return Number.isNaN(selected.getTime()) ? null : selected;
};

const validateBookingDateTime = (date, time) => {
  const selected = getSelectedBookingDateTime(date, time);
  if (!selected) return 'Please select a valid date and time.';
  if (selected < getMinimumBookingDateTime()) {
    return BOOKING_DATE_TIME_ERROR;
  }
  return '';
};

// ── STEPPER ──────────────────────────────────────────────

function Stepper({ current }) {
  return (
    <div className="stepper-wrap">
      <div className="stepper">
        {STEPS.map((label, i) => (
          <React.Fragment key={i}>
            <div className={`step-item ${i === current ? 'active' : i < current ? 'done' : ''}`}>
              <div className="step-circle">
                {i < current ? '✓' : i + 1}
              </div>
              <div className="step-label">{label}</div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`step-line ${i < current ? 'done' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ── STEP 1: SELECT SERVICE ────────────────────────────────

function Step1({ selected, onSelect }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await API.get('/services');
        setServices((data.services || []).map((service) => ({
          _id: service._id,
          id: service._id,
          icon: '🔧',
          name: service.serviceName,
          price: service.serviceCharges,
          description: service.serviceDescription,
        })));
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load services.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="step-card fade-up">
      <div className="step-card-header">
        <div className="step-card-num">1</div>
        <div className="step-card-title">Choose a Service</div>
      </div>
      <div className="step-card-body">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-light)' }}>
            Loading services...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '28px', color: 'var(--error)' }}>
            {error}
          </div>
        ) : services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-light)' }}>
            No services found. Please seed services from the backend.
          </div>
        ) : (
          <div className="service-grid">
            {services.map((s) => (
              <div
                key={s._id}
                className={`service-option ${selected?._id === s._id ? 'selected' : ''}`}
                onClick={() => onSelect(s)}
              >
                <div className="service-option-icon">{s.icon}</div>
                <div>
                  <div className="service-option-name">{s.name}</div>
                  <div className="service-option-price">From ₹{s.price}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── STEP 2: SELECT PLUMBER ────────────────────────────────

function Step2({ selected, onSelect, service }) {
  const [plumbers, setPlumbers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const fetchPlumbers = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await API.get('/plumbers', {
          params: service?._id ? { serviceId: service._id } : {},
        });
        setPlumbers(data.plumbers);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load technicians.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlumbers();
  }, [service?._id]);

  if (loading) return (
    <div className="step-card fade-up">
      <div className="step-card-body" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
        Loading plumbers...
      </div>
    </div>
  );

  if (error) return (
    <div className="step-card fade-up">
      <div className="step-card-body" style={{ textAlign: 'center', padding: '40px', color: 'var(--error)' }}>
        {error}
      </div>
    </div>
  );

  return (
    <div className="step-card fade-up">
      <div className="step-card-header">
        <div className="step-card-num">2</div>
        <div className="step-card-title">Select a Plumber</div>
      </div>
      <div className="step-card-body">
        {plumbers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-light)' }}>
            No technicians found for this service.
          </div>
        ) : plumbers.map((p) => (
          <div
            key={p._id}
            className={`plumber-option ${selected?._id === p._id ? 'selected' : ''}`}
            onClick={() => p.availability !== 'offline' && onSelect(p)}
            style={{ opacity: p.availability === 'offline' ? 0.5 : 1, cursor: p.availability === 'offline' ? 'not-allowed' : 'pointer' }}
          >
            <div className="plumber-option-avatar">{p.emoji || '👨‍🔧'}</div>
            <div>
              <div className="plumber-option-name">{p.name}</div>
              <div className="plumber-option-spec">{p.specialization || p.specialisation}</div>
              <div className="plumber-option-meta">
                <span>⭐ {p.rating}</span>
                <span>💼 {p.totalJobs}+ jobs</span>
                <span>⏱ {p.experience} yrs</span>
              </div>
            </div>
            <div className="plumber-option-right">
              <div className="plumber-option-rating">{p.rating}</div>
              <div className={`plumber-option-status ${p.availability === 'online' ? 'status-online' : 'status-busy'}`}>
                ● {p.availability === 'online' ? 'Available' : 'Busy'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── STEP 3: DATE & ADDRESS ────────────────────────────────

function Step3({ data, onChange, error }) {
  const minimumBookingDateTime = getMinimumBookingDateTime();
  const minDate = toDateInputValue(minimumBookingDateTime);
  const minimumDate = toDateInputValue(minimumBookingDateTime);
  const minTime = data.date === minimumDate ? toTimeInputValue(minimumBookingDateTime) : undefined;

  return (
    <div className="step-card fade-up">
      <div className="step-card-header">
        <div className="step-card-num">3</div>
        <div className="step-card-title">Date, Time & Address</div>
      </div>
      <div className="step-card-body">
        <div className="form-grid">
          <div className="field-group">
            <label className="field-label">Preferred Date</label>
            <div className="field-wrap">
              <span className="field-icon">📅</span>
              <input
                className="field-input"
                type="date"
                name="date"
                value={data.date}
                onChange={onChange}
                min={minDate}
              />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Preferred Time</label>
            <div className="field-wrap">
              <span className="field-icon">🕐</span>
              <input
                className="field-input"
                type="time"
                name="time"
                value={data.time}
                onChange={onChange}
                min={minTime}
              />
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '6px' }}>
              Same-day bookings must be at least {MIN_BOOKING_LEAD_MINUTES} minutes from now.
            </div>
          </div>
        </div>
        {error && (
          <div style={{ background: '#FFF5F5', border: '1px solid #FED7D7', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: '13px', color: 'var(--error)', marginBottom: '16px' }}>
            ⚠️ {error}
          </div>
        )}
        <div className="field-group">
          <label className="field-label">Full Address</label>
          <div className="field-wrap">
            <span className="field-icon">📍</span>
            <input
              className="field-input"
              name="address"
              value={data.address}
              onChange={onChange}
              placeholder="House/Flat No., Street, Area"
            />
          </div>
        </div>
        <div className="form-grid">
          <div className="field-group">
            <label className="field-label">City</label>
            <div className="field-wrap">
              <span className="field-icon">🌆</span>
              <input
                className="field-input"
                name="city"
                value={data.city}
                onChange={onChange}
                placeholder="Your city"
              />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Pincode</label>
            <div className="field-wrap">
              <span className="field-icon">🏷️</span>
              <input
                className="field-input"
                name="pincode"
                value={data.pincode}
                onChange={onChange}
                placeholder="700000"
              />
            </div>
          </div>
        </div>
        <div className="field-group">
          <label className="field-label">Additional Notes (optional)</label>
          <div className="field-wrap">
            <span className="field-icon">💬</span>
            <input
              className="field-input"
              name="description"
              value={data.description}
              onChange={onChange}
              placeholder="Describe the issue in detail..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── STEP 4: CONFIRM ───────────────────────────────────────

function Step4({ service, plumber, details, onConfirm, loading, error }) {
  return (
    <div className="step-card fade-up">
      <div className="step-card-header">
        <div className="step-card-num">4</div>
        <div className="step-card-title">Confirm Booking</div>
      </div>
      <div className="step-card-body">
        {error && (
          <div style={{ background: '#FFF5F5', border: '1px solid #FED7D7', borderRadius: 'var(--radius-sm)', padding: '12px 16px', fontSize: '13px', color: 'var(--error)', marginBottom: '20px' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Summary rows */}
        {[
          { label: '🔧 Service',    value: service?.name },
          { label: '👨‍🔧 Plumber',   value: plumber?.name },
          { label: '⭐ Rating',     value: plumber?.rating },
          { label: '📅 Date',       value: details.date },
          { label: '🕐 Time',       value: details.time },
          { label: '📍 Address',    value: details.address },
          { label: '🌆 City',       value: details.city },
          { label: '💬 Notes',      value: details.description || '—' },
          { label: '💰 Est. Price', value: `₹${service?.price}` },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(0,194,199,0.07)' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>{label}</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', textAlign: 'right', maxWidth: '200px' }}>{value}</span>
          </div>
        ))}

        <button className="btn-next w-100 mt-4" onClick={onConfirm} disabled={loading}>
          {loading ? '⏳ Booking...' : '✅ Confirm Booking'}
        </button>
      </div>
    </div>
  );
}

// ── ORDER SUMMARY PANEL ───────────────────────────────────

function SummaryPanel({ service, plumber, details }) {
  return (
    <div className="summary-card">
      <div className="summary-header">
        <div className="summary-title">📋 Booking Summary</div>
      </div>
      <div className="summary-body">
        {!service && !plumber ? (
          <div className="summary-empty">Select a service and plumber to see your summary</div>
        ) : (
          <>
            {service && (
              <div className="summary-item">
                <span className="summary-label">Service</span>
                <span className="summary-value">{service.icon} {service.name}</span>
              </div>
            )}
            {plumber && (
              <div className="summary-item">
                <span className="summary-label">Plumber</span>
                <span className="summary-value">{plumber.name}</span>
              </div>
            )}
            {details.date && (
              <div className="summary-item">
                <span className="summary-label">Date</span>
                <span className="summary-value">{details.date}</span>
              </div>
            )}
            {details.time && (
              <div className="summary-item">
                <span className="summary-label">Time</span>
                <span className="summary-value">{details.time}</span>
              </div>
            )}
            {details.city && (
              <div className="summary-item">
                <span className="summary-label">City</span>
                <span className="summary-value">{details.city}</span>
              </div>
            )}
            <hr className="summary-divider" />
            <div className="summary-item">
              <span className="summary-total-label">Estimated Total</span>
              <span className="summary-total-value">₹{service?.price || 0}</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '8px' }}>
              * Final price may vary based on work done
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────

export default function BookPlumber() {
  const navigate           = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [step, setStep]    = useState(0);
  const [booked, setBooked] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedPlumber, setSelectedPlumber] = useState(null);
  const [details, setDetails] = useState({
    date: '', time: '', address: '', city: '', pincode: '', description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) navigate('/login');
  }, [isLoggedIn]);

  // Pre-fill address from user profile
  useEffect(() => {
    if (user) {
      setDetails(d => ({
        ...d,
        address: user.address || '',
        city:    user.city    || '',
        pincode: user.pincode || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    setSelectedPlumber(null);
  }, [selectedService?._id]);

  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    const nextDetails = { ...details, [name]: value };
    const minimumBookingDateTime = getMinimumBookingDateTime();
    const minimumDate = toDateInputValue(minimumBookingDateTime);
    const minimumTime = toTimeInputValue(minimumBookingDateTime);

    if (name === 'date') {
      if (value === minimumDate && (!nextDetails.time || validateBookingDateTime(value, nextDetails.time))) {
        nextDetails.time = minimumTime;
      }
      if (value > minimumDate && validateBookingDateTime(value, nextDetails.time)) {
        nextDetails.time = '';
      }
    }

    if (e.target.name === 'date' || e.target.name === 'time') {
      const nextError = nextDetails.date && nextDetails.time
        ? validateBookingDateTime(nextDetails.date, nextDetails.time)
        : '';
      setError(nextError);
    } else {
      setError('');
    }
    setDetails(nextDetails);
  };

  const canNext = () => {
    if (step === 0) return !!selectedService;
    if (step === 1) return !!selectedPlumber;
    if (step === 2) {
      return details.date &&
        details.time &&
        details.address.trim() &&
        details.city.trim() &&
        !validateBookingDateTime(details.date, details.time);
    }
    return true;
  };

  const validateCurrentStep = () => {
    if (step === 2) {
      if (!details.date || !details.time || !details.address || !details.city) {
        return 'Please fill booking date, time, address, and city.';
      }
      return validateBookingDateTime(details.date, details.time);
    }
    return '';
  };

  const handleNext = () => {
    const stepError = validateCurrentStep();
    if (stepError) {
      setError(stepError);
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleConfirm = async () => {
    setError('');
    const dateTimeError = validateBookingDateTime(details.date, details.time);
    if (dateTimeError) {
      setError(dateTimeError);
      setStep(2);
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.post('/bookings', {
        plumber:     selectedPlumber._id,
        serviceId:   selectedService._id,
        problemDetails: details.description || selectedService.name,
        serviceAddress: details.address,
        city:        details.city,
        pincode:     details.pincode,
        bookingDate: details.date,
        bookingTime: details.time,
      });
      setBookingId(data.booking._id);
      setBooked(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── SUCCESS SCREEN ──
if (booked) {
    return (
      <div className="booking-page">
        <Navbar />
        <div className="booking-layout">
          <div className="container">
            <div className="step-card">
              <div className="success-screen">
                <div className="success-icon">🎉</div>
                <div className="success-title">Booking Confirmed!</div>
                <div className="success-sub">
                  Your booking for <strong>{selectedService?.name}</strong> with{' '}
                  <strong>{selectedPlumber?.name}</strong> on{' '}
                  <strong>{details.date}</strong> at{' '}
                  <strong>{details.time}</strong> has been placed successfully.
                </div>
                <div>
                  <button className="btn-success" onClick={() => navigate('/track')}>
                    📍 Track My Booking
                  </button>
                  <button className="btn-success" onClick={() => navigate('/profile')}>
                    📋 View My Bookings
                  </button>
                  <button className="btn-success-outline" onClick={() => navigate('/')}>
                    🏠 Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="booking-page">
      <Navbar />

      {/* HERO */}
      <section className="booking-hero">
        <div className="booking-hero-bg b1" />
        <div className="booking-hero-bg b2" />
        <div className="container">
          <div className="booking-tag"><span className="booking-tag-dot" />Book a Service</div>
          <h1 className="booking-hero-title">Book a <span className="accent">Plumber</span></h1>
          <p className="booking-hero-sub">Complete the steps below to book your verified plumber in minutes.</p>
          <Stepper current={step} />
        </div>
      </section>

      {/* MAIN */}
      <div className="booking-layout">
        <div className="container">
          <div className="booking-grid">

            {/* LEFT: Steps */}
            <div>
              {step === 0 && <Step1 selected={selectedService} onSelect={setSelectedService} />}
              {step === 1 && <Step2 selected={selectedPlumber} onSelect={setSelectedPlumber} service={selectedService} />}
              {step === 2 && <Step3 data={details} onChange={handleDetailsChange} error={error} />}
              {step === 3 && (
                <Step4
                  service={selectedService}
                  plumber={selectedPlumber}
                  details={details}
                  onConfirm={handleConfirm}
                  loading={loading}
                  error={error}
                />
              )}

              {/* Navigation */}
              <div className="step-nav">
                {step > 0 ? (
                  <button className="btn-back" onClick={() => setStep(step - 1)}>← Back</button>
                ) : <div />}
                {step < 3 && (
                  <button className="btn-next" onClick={handleNext} disabled={!canNext()}>
                    Next →
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT: Summary */}
            <SummaryPanel service={selectedService} plumber={selectedPlumber} details={details} />

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
