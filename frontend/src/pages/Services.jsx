import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Services.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../utils/axios';

// ── DATA ─────────────────────────────────────────────────

const CATEGORIES = ['All', 'Repair', 'Cleaning', 'Installation', 'Emergency'];

const FAQS = [
  { q: 'How is a technician assigned?', a: 'After a customer submits a booking, the admin reviews the request and assigns a registered technician from the admin panel.' },
  { q: 'How does the technician receive the work details?', a: 'The admin can send a structured email to the technician with customer details, service, schedule, address, and problem notes.' },
  { q: 'What is included in the service price?', a: 'The listed amount is the service charge stored in the Service table. Any extra material cost can be discussed before the work is completed.' },
  { q: 'Do I need to pay online?', a: 'No. This system uses cash on delivery, so payment is collected after the service and updated by the admin.' },
  { q: 'Can the booking status be updated?', a: 'Yes. The admin can move a booking through pending, confirmed, in-progress, completed, or cancelled status.' },
  { q: 'Can services and technicians be changed later?', a: 'Yes. The admin panel supports create, read, update, and delete controls for services and technicians.' },
];

// ── COMPONENT ─────────────────────────────────────────────

export default function Services() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [services, setServices] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const [servicesRes, techniciansRes] = await Promise.all([
          API.get('/services'),
          API.get('/plumbers'),
        ]);
        setServices((servicesRes.data?.services || []).map((service) => ({
          id: service._id,
          icon: '🔧',
          name: service.serviceName,
          category: service.category || 'Repair',
          badge: service.category === 'Emergency' ? '24/7' : null,
          badgeType: service.category === 'Emergency' ? 'emergency' : null,
          desc: service.serviceDescription,
          includes: [
            'Professional diagnosis',
            'Transparent service charge',
            'Verified technician visit',
            'Work quality check',
          ],
          price: `₹${service.serviceCharges}`,
          unit: 'onwards',
        })));
        setTechnicians(techniciansRes.data?.plumbers || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load service data.');
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, []);

  const filtered = services.filter((s) => {
    const matchCat = activeCategory === 'All' || s.category === activeCategory;
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleFaq = (i) => setOpenFaq(openFaq === i ? null : i);

  const ratedTechnicians = technicians.filter((tech) => Number(tech.rating) > 0);
  const avgRating = ratedTechnicians.length
    ? (ratedTechnicians.reduce((sum, tech) => sum + Number(tech.rating || 0), 0) / ratedTechnicians.length).toFixed(1)
    : '0.0';
  const completedJobs = technicians.reduce((sum, tech) => sum + Number(tech.totalJobs || 0), 0);
  const heroStats = [
    { icon: '🔧', num: String(services.length), label: 'Active Services' },
    { icon: '👨‍🔧', num: String(technicians.length), label: 'Technicians' },
    { icon: '⭐', num: avgRating, label: 'Avg Rating' },
    { icon: '📋', num: String(completedJobs), label: 'Completed Jobs' },
  ];

  return (
    <div className="services-page">

      <Navbar />

      {/* ── HERO ── */}
      <section className="services-hero">
        <div className="services-hero-bg b1" />
        <div className="services-hero-bg b2" />
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-7 fade-up">
              <div className="hero-tag">
                <span className="hero-tag-dot" />
                What We Offer
              </div>
              <h1 className="services-hero-title">
                Professional <span className="accent">Plumbing</span><br />
                Services for Every Need
              </h1>
              <p className="services-hero-sub">
                From quick fixes to full installations — choose from our wide range
                of verified plumbing services with transparent pricing and instant booking.
              </p>

              {/* Search */}
              <div className="search-wrap">
                <span className="search-icon">🔍</span>
                <input
                  className="search-input"
                  placeholder="Search services e.g. pipe, drain, toilet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="search-btn">Search</button>
              </div>
            </div>

            {/* Hero Stats */}
            <div className="col-lg-4 offset-lg-1">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {heroStats.map((s, i) => (
                  <div key={i} style={{
                    background: 'white', borderRadius: 'var(--radius)',
                    padding: '20px', textAlign: 'center',
                    boxShadow: 'var(--shadow-card)',
                    border: '1px solid rgba(0,194,199,0.08)',
                  }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
                    <div style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '24px', fontWeight: 700, color: 'var(--aqua-dark)' }}>{s.num}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="filter-section">
            <div className="filter-tabs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`filter-tab ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES GRID ── */}
      <section className="services-grid-section">
        <div className="container">
          <p className="results-count">
            {loading ? 'Loading services...' : <>Showing <span>{filtered.length}</span> service{filtered.length !== 1 ? 's' : ''}</>}
            {activeCategory !== 'All' && <> in <span>{activeCategory}</span></>}
            {searchQuery && <> matching <span>"{searchQuery}"</span></>}
          </p>

          {error ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--error)' }}>
              {error}
            </div>
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
              Loading services...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>No services found</div>
              <div style={{ fontSize: '14px' }}>Try a different search term or category</div>
            </div>
          ) : (
            <div className="services-grid">
              {filtered.map((service) => (
                <div className="service-card" key={service.id}>
                  <div className="service-card-top">
                    <div className="service-card-icon">{service.icon}</div>
                    <div className="service-card-name">{service.name}</div>
                    <div className="service-card-desc">{service.desc}</div>
                    {service.badge && (
                      <div className={`service-badge ${service.badgeType}`}>{service.badge}</div>
                    )}
                  </div>

                  <div className="service-card-body">
                    <div className="service-includes">
                      <div className="service-includes-title">What's Included</div>
                      {service.includes.map((item, i) => (
                        <div className="service-include-item" key={i}>
                          <span className="include-dot" />
                          {item}
                        </div>
                      ))}
                    </div>

                    <div className="service-card-footer">
                      <div className="service-price-wrap">
                        <div className="service-price-label">Starting from</div>
                        <div>
                          <span className="service-price">{service.price}</span>
                          <span className="service-price-unit"> {service.unit}</span>
                        </div>
                      </div>
                      <button
                        className="btn-book-service"
                        onClick={() => navigate('/book')}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section">
        <div className="container">
          <div className="row g-5 align-items-start">

            <div className="col-lg-4">
              <div className="section-label">FAQ</div>
              <h2 className="section-title">Frequently Asked Questions</h2>
              <p className="section-sub">Everything you need to know about our plumbing services.</p>
              <button
                className="btn-book-service mt-4"
                style={{ padding: '12px 24px' }}
                onClick={() => navigate('/book')}
              >
                Still have questions? Contact Us
              </button>
            </div>

            <div className="col-lg-7 offset-lg-1">
              <div className="faq-list">
                {FAQS.map((faq, i) => (
                  <div className={`faq-item ${openFaq === i ? 'open' : ''}`} key={i}>
                    <div className="faq-question" onClick={() => toggleFaq(i)}>
                      {faq.q}
                      <span className="faq-toggle">+</span>
                    </div>
                    <div className="faq-answer">{faq.a}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="services-cta">
        <div className="container position-relative">
          <h2 className="cta-title">Can't Find What You Need?</h2>
          <p className="cta-sub">Talk to us and we'll connect you with the right plumber for any job.</p>
          <button className="btn-cta-white" onClick={() => navigate('/book')}>
            Book a Custom Service
          </button>
        </div>
      </section>

      <Footer />

    </div>
  );
}
