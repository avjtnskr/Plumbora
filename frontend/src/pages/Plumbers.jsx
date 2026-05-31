import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Plumbers.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../utils/axios';

const AVAILABILITY    = ['All', 'Available Now', 'Busy', 'Offline'];
const SORT_OPTIONS    = ['Top Rated', 'Most Jobs', 'Price: Low to High', 'Experience'];

// ── HELPERS ───────────────────────────────────────────────

function Stars({ count }) {
  return <span>{'★'.repeat(Math.floor(count))}{'☆'.repeat(5 - Math.floor(count))}</span>;
}

function StatusBadge({ status }) {
  if (status === 'online')  return <span className="availability-badge available">● Available Now</span>;
  if (status === 'busy')    return <span className="availability-badge busy-badge">● Busy</span>;
  return <span className="availability-badge offline-badge">● Offline</span>;
}

// ── DETAIL PANEL ──────────────────────────────────────────

const mapTechnician = (tech) => ({
  id: tech._id,
  emoji: '👨‍🔧',
  name: tech.name,
  spec: tech.specialization || tech.specialisation || tech.service?.serviceName || 'Technician',
  status: tech.availability || 'offline',
  rating: tech.rating || 0,
  reviewCount: tech.totalReviews || 0,
  jobs: tech.totalJobs || 0,
  exp: `${tech.experience || 0} yrs`,
  experienceYears: Number(tech.experience || 0),
  location: tech.location || tech.city || 'Service area',
  price: `₹${tech.pricePerHour || tech.service?.serviceCharges || 0}/hr`,
  priceValue: Number(tech.pricePerHour || tech.service?.serviceCharges || 0),
  tags: [tech.service?.serviceName, tech.specialization, ...(tech.skills || [])].filter(Boolean),
  skills: tech.skills?.length ? tech.skills : [tech.service?.serviceName, tech.specialization].filter(Boolean),
  bio: `${tech.name} is a ${tech.specialization || 'verified technician'} with ${tech.experience || 0} years of experience.`,
});

function DetailPanel({ plumber, reviews, reviewsLoading, onBook }) {
  if (!plumber) {
    return (
      <div className="detail-panel">
        <div className="detail-empty">
          <div className="detail-empty-icon">👈</div>
          <div className="detail-empty-text">
            Select a technician from the list to view their profile, reviews, and book a service.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-panel slide-in">
      {/* Top */}
      <div className="detail-top">
        <div className="detail-avatar">{plumber.emoji}</div>
        <div className="detail-name">{plumber.name}</div>
        <div className="detail-spec">{plumber.spec}</div>
        <div className="detail-status">
          <span className="detail-status-dot" style={{
            background: plumber.status === 'online' ? '#22C55E' : plumber.status === 'busy' ? '#F59E0B' : '#94A3B8'
          }} />
          {plumber.status === 'online' ? 'Available Now' : plumber.status === 'busy' ? 'Busy' : 'Offline'}
        </div>
      </div>

      {/* Stats */}
      <div className="detail-stats">
        <div className="detail-stat">
          <div className="detail-stat-num">{plumber.rating}</div>
          <div className="detail-stat-label">Rating</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-num">{plumber.jobs}+</div>
          <div className="detail-stat-label">Jobs</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-num">{plumber.exp}</div>
          <div className="detail-stat-label">Experience</div>
        </div>
      </div>

      {/* Body */}
      <div className="detail-body">

        {/* Bio */}
        <div className="detail-section-title">About</div>
        <p style={{ fontSize: '13px', color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: '20px' }}>
          {plumber.bio}
        </p>

        {/* Location & Price */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-mid)' }}>📍 {plumber.location}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-mid)' }}>💰 {plumber.price}</div>
        </div>

        {/* Skills */}
        <div className="detail-section-title">Skills</div>
        <div className="detail-skills">
          {plumber.skills.map((s, i) => (
            <span className="detail-skill" key={i}>{s}</span>
          ))}
        </div>

        {/* Reviews */}
        <div className="detail-section-title">Recent Reviews</div>
        <div className="detail-reviews">
          {reviewsLoading ? (
            <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>No customer reviews yet.</div>
          ) : reviews.map((r) => (
              <div className="detail-review" key={r._id}>
                <div className="detail-review-header">
                  <span className="detail-review-name">{[r.user?.firstName, r.user?.lastName].filter(Boolean).join(' ') || 'Customer'}</span>
                  <span className="detail-review-date">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <div className="detail-review-stars"><Stars count={r.rating} /></div>
                <div className="detail-review-text">{r.comment}</div>
              </div>
            ))}
        </div>

        {/* Actions */}
        <div className="detail-actions">
          <button className="btn-book-now" onClick={() => onBook(plumber)}>
            📅 Book {plumber.name.split(' ')[0]} Now
          </button>
          <button className="btn-call">
            📞 Call Plumber
          </button>
        </div>

      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────

export default function Plumbers() {
  const navigate = useNavigate();
  const [search, setSearch]             = useState('');
  const [specFilter, setSpecFilter]     = useState('All');
  const [availFilter, setAvailFilter]   = useState('All');
  const [sortBy, setSortBy]             = useState('Top Rated');
  const [selected, setSelected]         = useState(null);
  const [plumbers, setPlumbers]         = useState([]);
  const [reviews, setReviews]           = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const { data } = await API.get('/plumbers');
        const mapped = (data.plumbers || []).map(mapTechnician);
        setPlumbers(mapped);
        setSelected(mapped[0] || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load technicians.');
      } finally {
        setLoading(false);
      }
    };
    fetchTechnicians();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!selected?.id) {
        setReviews([]);
        return;
      }
      setReviewsLoading(true);
      try {
        const { data } = await API.get(`/reviews/plumber/${selected.id}`);
        setReviews(data.reviews || []);
      } catch {
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [selected?.id]);

  const specialisations = useMemo(() => {
    const values = plumbers.flatMap((p) => p.tags).filter(Boolean);
    return ['All', ...Array.from(new Set(values))];
  }, [plumbers]);

  const filtered = plumbers
    .filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.spec.toLowerCase().includes(search.toLowerCase()) ||
                          p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchSpec = specFilter === 'All' || p.tags.includes(specFilter) || p.skills.includes(specFilter);
      const matchAvail =
        availFilter === 'All' ||
        (availFilter === 'Available Now' && p.status === 'online') ||
        (availFilter === 'Busy'          && p.status === 'busy') ||
        (availFilter === 'Offline'       && p.status === 'offline');
      return matchSearch && matchSpec && matchAvail;
    })
    .sort((a, b) => {
      if (sortBy === 'Top Rated')           return b.rating - a.rating;
      if (sortBy === 'Most Jobs')           return b.jobs - a.jobs;
      if (sortBy === 'Experience')          return b.experienceYears - a.experienceYears;
      if (sortBy === 'Price: Low to High')  return a.priceValue - b.priceValue;
      return 0;
    });

  const handleBook = (plumber) => navigate('/book');

  return (
    <div className="plumbers-page">

      <Navbar />

      {/* ── HERO ── */}
      <section className="plumbers-hero">
        <div className="hero-bg b1" />
        <div className="hero-bg b2" />
        <div className="container">
          <div className="fade-up">
            <div className="hero-tag"><span className="hero-tag-dot" />Our Professionals</div>
            <h1 className="plumbers-hero-title">
              Find Your <span className="accent">Trusted</span><br />Plumber
            </h1>
            <p className="plumbers-hero-sub">
              Browse verified technicians. Filter by specialty,
              availability, and ratings to find the perfect match for your job.
            </p>
          </div>
        </div>
      </section>

      {/* ── SEARCH & FILTER BAR ── */}
      <div className="container">
        <div className="search-filter-bar">
          {/* Search */}
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search by name, skill or area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Specialisation */}
          <select
            className="filter-select"
            value={specFilter}
            onChange={(e) => setSpecFilter(e.target.value)}
          >
            {specialisations.map(s => <option key={s}>{s}</option>)}
          </select>

          {/* Availability */}
          <select
            className="filter-select"
            value={availFilter}
            onChange={(e) => setAvailFilter(e.target.value)}
          >
            {AVAILABILITY.map(a => <option key={a}>{a}</option>)}
          </select>

          {/* Sort */}
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div className="plumbers-layout">

          {/* LEFT: Cards */}
          <div>
            <p className="results-info">
              {loading ? 'Loading technicians...' : <>Showing <span>{filtered.length}</span> technician{filtered.length !== 1 ? 's' : ''}</>}
            </p>

            {error ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--error)' }}>{error}</div>
            ) : loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>Loading technicians...</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>No technicians found</div>
                <div style={{ fontSize: '14px' }}>Try adjusting your search or filters</div>
              </div>
            ) : (
              <div className="plumbers-grid">
                {filtered.map((p) => (
                  <div
                    key={p.id}
                    className={`plumber-card ${selected?.id === p.id ? 'selected' : ''}`}
                    onClick={() => setSelected(p)}
                  >
                    {/* Avatar */}
                    <div className="plumber-avatar">
                      {p.emoji}
                      <span className={`avatar-status ${p.status === 'busy' ? 'busy' : p.status}`} />
                    </div>

                    {/* Info */}
                    <div className="plumber-info">
                      <div className="plumber-name">{p.name}</div>
                      <div className="plumber-spec">{p.spec}</div>
                      <div className="plumber-tags">
                        {p.tags.slice(0, 3).map((t, i) => (
                          <span className="plumber-tag" key={i}>{t}</span>
                        ))}
                      </div>
                      <div className="plumber-meta-row">
                        <span className="plumber-meta-item">📍 {p.location}</span>
                        <span className="plumber-meta-item">💼 {p.jobs}+ jobs</span>
                        <span className="plumber-meta-item">⏱ {p.exp}</span>
                        <span className="plumber-meta-item">💰 {p.price}</span>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="plumber-right">
                      <div className="plumber-rating">{p.rating}</div>
                      <div className="stars"><Stars count={p.rating} /></div>
                      <div className="plumber-rating-label" style={{ marginTop: '4px', marginBottom: '8px' }}>
                        {p.reviewCount}+ reviews
                      </div>
                      <StatusBadge status={p.status} />
                      <br />
                      <button className="btn-view mt-2" onClick={(e) => { e.stopPropagation(); setSelected(p); }}>
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Detail Panel */}
          <DetailPanel plumber={selected} reviews={reviews} reviewsLoading={reviewsLoading} onBook={handleBook} />

        </div>
      </div>

      <Footer />

    </div>
  );
}
