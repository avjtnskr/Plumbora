import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../utils/axios';

const steps = [
  {
    num: '01',
    icon: '📍',
    title: 'Choose Your Service',
    desc: 'Select from our wide range of plumbing services. Tell us your location and preferred time.',
  },
  {
    num: '02',
    icon: '👨‍🔧',
    title: 'Get Matched Instantly',
    desc: 'We match you with a verified, nearby plumber. View profiles, ratings, and estimated arrival.',
  },
  {
    num: '03',
    icon: '✅',
    title: 'Track & Confirm',
    desc: 'Track your plumber in real-time. Rate and review once the job is done — payment made easy.',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [services, setServices] = useState([]);
  const [plumbers, setPlumbers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    technicians: 0,
    averageRating: 0,
    completedJobs: 0,
    services: 0,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [servicesRes, plumbersRes, reviewsRes] = await Promise.all([
          API.get('/services'),
          API.get('/plumbers', { params: { sort: 'rating' } }),
          API.get('/reviews/recent', { params: { limit: 3 } }),
        ]);

        const serviceRows = servicesRes.data.services || [];
        const technicianRows = plumbersRes.data.plumbers || [];
        const reviewRows = reviewsRes.data.reviews || [];

        setServices(serviceRows.map((service) => ({
          id: service._id,
          icon: '🔧',
          label: service.serviceName,
        })));
        setPlumbers(technicianRows.slice(0, 3).map((tech) => ({
          id: tech._id,
          name: tech.name,
          spec: tech.specialization || tech.specialisation || tech.service?.serviceName || 'Technician',
          rating: tech.rating || 0,
          jobs: tech.totalJobs || 0,
          exp: `${tech.experience || 0} yrs`,
          status: tech.availability || 'offline',
          emoji: '👨‍🔧',
        })));
        setReviews(reviewRows);

        const ratingSum = technicianRows.reduce((sum, tech) => sum + Number(tech.rating || 0), 0);
        const ratedCount = technicianRows.filter((tech) => Number(tech.rating || 0) > 0).length;
        setStats({
          technicians: technicianRows.length,
          averageRating: ratedCount ? (ratingSum / ratedCount).toFixed(1) : '0.0',
          completedJobs: technicianRows.reduce((sum, tech) => sum + Number(tech.totalJobs || 0), 0),
          services: serviceRows.length,
        });
      } catch (err) {
        console.error(err);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div className="home-page">

      {/* ── NAVBAR ── */}
      <Navbar />

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg-circle c1" />
        <div className="hero-bg-circle c2" />
        <div className="container">
          <div className="row align-items-center g-5">

            {/* Left: Headline */}
            <div className="col-lg-6">
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                Live Online Plumbing Booking
              </div>
              <h1 className="hero-title">
                Fast, Reliable<br />
                <span className="accent">Plumbing</span> at<br />
                Your Doorstep
              </h1>
              <p className="hero-subtitle">
                Book verified plumbing services with transparent pricing, technician assignment,
                cash-on-delivery payment, and booking status updates.
              </p>
              <div className="hero-actions">
                <button className="btn-primary-custom" onClick={() => navigate('/book')}>
                  Book a Plumber
                </button>
                <button className="btn-outline-custom" onClick={() => navigate('/services')}>
                  View Services
                </button>
              </div>
            </div>

            {/* Right: Floating card */}
            <div className="col-lg-5 offset-lg-1">
              <div className="hero-card-float">
                <p
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-light)',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  Available Now
                </p>

                {plumbers.slice(0, 2).map((p) => (
                  <div className="hero-plumber-card" key={p.id}>
                    <div className="plumber-avatar">{p.emoji}</div>
                    <div>
                      <div className="plumber-name">{p.name}</div>
                      <div className="plumber-meta">{p.spec} · ⭐ {p.rating}</div>
                    </div>
                    <div className="status-badge">● {p.status === 'online' ? 'Online' : p.status}</div>
                  </div>
                ))}
                {plumbers.length === 0 && (
                  <div style={{ color: 'var(--text-light)', fontSize: '13px' }}>
                    Technicians will appear here after they are added from admin.
                  </div>
                )}

                <div className="hero-stats">
                  <div className="stat-box">
                    <div className="stat-num">{stats.technicians}</div>
                    <div className="stat-label">Technicians</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-num">{stats.averageRating}★</div>
                    <div className="stat-label">Avg Rating</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-num">{stats.services}</div>
                    <div className="stat-label">Services</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-num">{stats.completedJobs}</div>
                    <div className="stat-label">Jobs Done</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-5">
            <div className="section-label">Process</div>
            <h2 className="section-title">How Plumbora Works</h2>
            <p className="section-sub mx-auto">Three simple steps to get a verified plumber at your door.</p>
          </div>
          <div className="row g-4">
            {steps.map((s, i) => (
              <div className="col-md-4" key={i}>
                <div className="step-card">
                  <div className="step-num">{s.num}</div>
                  <div className="step-icon">{s.icon}</div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="section services-bg">
        <div className="container">
          <div className="row align-items-center mb-5">
            <div className="col-lg-5">
              <div className="section-label">Services</div>
              <h2 className="section-title">What We Fix</h2>
              <p className="section-sub">From quick repairs to full installations — our plumbers handle it all.</p>
            </div>
          </div>
          <div className="d-flex flex-wrap gap-3">
            {services.map((s) => (
              <div className="service-chip" key={s.id}>
                <span className="icon">{s.icon}</span>
                {s.label}
              </div>
            ))}
            {services.length === 0 && (
              <div style={{ color: 'var(--text-light)' }}>Services will appear here after they are added from admin.</div>
            )}
          </div>
        </div>
      </section>

      {/* ── TOP PLUMBERS ── */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-5">
            <div className="section-label">Professionals</div>
            <h2 className="section-title">Top Rated Plumbers</h2>
            <p className="section-sub mx-auto">Every plumber is background-verified and highly rated by customers.</p>
          </div>
          <div className="row g-4">
            {plumbers.map((p) => (
              <div className="col-md-4" key={p.id}>
                <div className="plumber-card">
                  <div className="plumber-card-top">
                    <div className="plumber-avatar-lg">{p.emoji}</div>
                    <div className="plumber-card-name">{p.name}</div>
                    <div className="plumber-card-spec">{p.spec}</div>
                    <div className="stars">{'★'.repeat(Math.floor(p.rating))} {p.rating}</div>
                  </div>
                  <div className="plumber-card-body">
                    <div className="plumber-info-row">
                      <span className="plumber-info-label">Jobs Done</span>
                      <span className="plumber-info-val">{p.jobs}+</span>
                    </div>
                    <div className="plumber-info-row">
                      <span className="plumber-info-label">Experience</span>
                      <span className="plumber-info-val">{p.exp}</span>
                    </div>
                    <div className="plumber-info-row">
                      <span className="plumber-info-label">Status</span>
                      <span className="plumber-info-val" style={{ color: '#0D7A4A' }}>● Available</span>
                    </div>
                    <button className="btn-book" onClick={() => navigate('/book')}>
                      Book {p.name.split(' ')[0]}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <div className="section-label">Reviews</div>
            <h2 className="section-title">What Customers Say</h2>
          </div>
          <div className="row g-4">
            {reviews.length === 0 ? (
              <div className="col-12">
                <div className="review-card text-center">
                  <p className="review-text">Real customer reviews will appear here after completed bookings are reviewed.</p>
                </div>
              </div>
            ) : reviews.map((r) => (
              <div className="col-md-4" key={r._id}>
                <div className="review-card">
                  <div className="review-quote">"</div>
                  <p className="review-text">{r.comment}</p>
                  <div className="stars mb-3">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  <div className="reviewer">
                    <div className="reviewer-avatar">👤</div>
                    <div>
                      <div className="reviewer-name">{[r.user?.firstName, r.user?.lastName].filter(Boolean).join(' ') || 'Customer'}</div>
                      <div className="reviewer-loc">{r.plumber?.name || 'Plumbora technician'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container position-relative">
          <h2 className="cta-title">Need a Plumber Right Now?</h2>
          <p className="cta-sub">Choose a service, share your problem details, and let the admin assign the right technician.</p>
          <button className="btn-cta-white" onClick={() => navigate('/book')}>
            Book Instantly — It's Free
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}
