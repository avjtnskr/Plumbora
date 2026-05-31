import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AboutUs.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../utils/axios';

// ── DATA ────────────────────────────────────────────────

const storyItems = [
  {
    year: 'Step 1',
    title: 'Choose a Service',
    desc: 'Customers can browse the live service catalog, select the right plumbing work, and submit the full problem details with address and schedule.',
  },
  {
    year: 'Step 2',
    title: 'Admin Reviews the Booking',
    desc: 'The admin checks each request, confirms the service details, and assigns a suitable registered technician from the admin panel.',
  },
  {
    year: 'Step 3',
    title: 'Technician Gets the Job Email',
    desc: 'The selected technician receives a structured email with customer details, service information, schedule, address, and problem notes.',
  },
  {
    year: 'Step 4',
    title: 'Cash Payment After Service',
    desc: 'The work status and cash payment status are controlled from the admin panel, so the full booking lifecycle stays organized in one place.',
  },
];

const whyItems = [
  { icon: '✅', title: 'Admin Verified Records', desc: 'Technician details, service links, phone numbers, emails, and experience are managed from the admin panel.' },
  { icon: '📧', title: 'Structured Job Emails', desc: 'Admins can send booking details directly to the assigned technician in a clean, readable email format.' },
  { icon: '💰', title: 'Cash on Delivery', desc: 'No online payment is required. Payment and collection status are updated after the service is completed.' },
  { icon: '📋', title: 'Booking Control', desc: 'Admins can accept requests, assign technicians, update work status, and keep internal notes in one place.' },
  { icon: '🔧', title: 'Live Service Catalog', desc: 'Services, charges, and descriptions come from the database and can be updated without changing the frontend.' },
  { icon: '🧾', title: 'Clean Customer Records', desc: 'Customer profiles and booking history stay connected through the backend instead of static frontend data.' },
];



const coreValues = [
  { icon: '🤝', title: 'Trust First',      desc: 'We build every feature around safety and transparency.' },
  { icon: '🚀', title: 'Move Fast',        desc: 'We ship solutions quickly because your home cannot wait.' },
  { icon: '💡', title: 'Always Improving', desc: 'Every booking teaches us how to do better next time.' },
];

// ── COMPONENT ────────────────────────────────────────────

export default function AboutUs() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [stats, setStats] = useState([
    { icon: '👨‍🔧', num: '0', label: 'Registered Technicians' },
    { icon: '🔧', num: '0', label: 'Active Services' },
    { icon: '⭐', num: '0.0', label: 'Average Rating' },
    { icon: '📋', num: '0', label: 'Completed Jobs' },
  ]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [servicesRes, plumbersRes] = await Promise.all([
          API.get('/services'),
          API.get('/plumbers'),
        ]);
        const liveServices = servicesRes.data?.services || [];
        const liveTechnicians = plumbersRes.data?.plumbers || [];
        const rated = liveTechnicians.filter((tech) => Number(tech.rating) > 0);
        const avgRating = rated.length
          ? (rated.reduce((sum, tech) => sum + Number(tech.rating || 0), 0) / rated.length).toFixed(1)
          : '0.0';
        const completedJobs = liveTechnicians.reduce((sum, tech) => sum + Number(tech.totalJobs || 0), 0);

        setStats([
          { icon: '👨‍🔧', num: String(liveTechnicians.length), label: 'Registered Technicians' },
          { icon: '🔧', num: String(liveServices.length), label: 'Active Services' },
          { icon: '⭐', num: avgRating, label: 'Average Rating' },
          { icon: '📋', num: String(completedJobs), label: 'Completed Jobs' },
        ]);
      } catch (err) {
        console.error('Could not load about page stats', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="about-page">

      {/* ── NAVBAR ── */}
      <Navbar />

      {/* ── HERO BANNER ── */}
      <section className="about-hero">
        <div className="about-hero-bg b1" />
        <div className="about-hero-bg b2" />
        <div className="container">
          <div className="row align-items-center g-5">

            <div className="col-lg-6 fadeup">
              <div className="about-tag">
                <span className="about-tag-dot" />
                Who We Are
              </div>
              <h1 className="about-hero-title">
                India's Most <span className="accent">Trusted</span><br />
                Plumbing Platform
              </h1>
              <p className="about-hero-sub">
                Plumbora connects customers with registered plumbing technicians through
                service booking, admin assignment, structured job emails, and cash payment after work.
              </p>
            </div>

            <div className="col-lg-5 offset-lg-1">
              <div className="hero-img-card">
                <div className="hero-img-top">🔧</div>
                <div className="hero-img-body">
                  <div className="hero-img-stat">
                    {stats.map((s, i) => (
                      <div className="hero-img-stat-item" key={i}>
                        <div className="his-num">{s.num}</div>
                        <div className="his-label">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── OUR STORY ── */}
      <section className="section story-section">
        <div className="container">
          <div className="row g-5 align-items-start">

            <div className="col-lg-4">
              <div className="section-label">Our Story</div>
              <h2 className="section-title">How Plumbora Came to Be</h2>
              <p className="section-sub">
                The public website, customer booking flow, and admin controls work together
                to keep every plumbing request clear from start to finish.
              </p>
            </div>

            <div className="col-lg-7 offset-lg-1">
              <div className="story-timeline">
                {storyItems.map((item, i) => (
                  <div className="story-item" key={i}>
                    <div className="story-dot" />
                    <div className="story-year">{item.year}</div>
                    <div className="story-item-title">{item.title}</div>
                    <div className="story-item-desc">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── MISSION & VISION ── */}
      <section className="section mv-section">
        <div className="container">
          <div className="text-center mb-5">
            <div className="section-label">Mission & Vision</div>
            <h2 className="section-title">What Drives Us Every Day</h2>
          </div>
          <div className="row g-4 align-items-stretch">

            {/* Mission */}
            <div className="col-lg-5">
              <div className="mv-card mission">
                <span className="mv-icon">🎯</span>
                <div className="mv-title">Our Mission</div>
                <p className="mv-text">
                  To make plumbing service requests simple for customers and easy for admins
                  to assign, track, and complete with registered technicians.
                </p>
              </div>
            </div>

            {/* Vision + Values */}
            <div className="col-lg-7">
              <div className="mv-card vision mb-4">
                <span className="mv-icon">🔭</span>
                <div className="mv-title">Our Vision</div>
                <p className="mv-text">
                  To build a dependable online plumber booking system where service data,
                  technician records, bookings, and cash payment status stay accurate.
                </p>
              </div>

              <div className="values-grid">
                {coreValues.map((v, i) => (
                  <div className="value-row" key={i}>
                    <div className="value-icon">{v.icon}</div>
                    <div>
                      <div className="value-title">{v.title}</div>
                      <div className="value-desc">{v.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats-section">
        <div className="container">
          <div className="text-center mb-5">
            <h2
              className="section-title"
              style={{ color: 'white', fontFamily: "'Clash Display', sans-serif" }}
            >
              Plumbora by the Numbers
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '15px' }}>
              Real impact, real people, real results.
            </p>
          </div>
          <div className="row g-4">
            {stats.map((s, i) => (
              <div className="col-6 col-md-3" key={i}>
                <div className="stat-card">
                  <span className="stat-card-icon">{s.icon}</span>
                  <div className="stat-card-num">{s.num}</div>
                  <div className="stat-card-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="section why-section">
        <div className="container">
          <div className="text-center mb-5">
            <div className="section-label">Why Plumbora</div>
            <h2 className="section-title">What Makes Us Different</h2>
            <p className="section-sub mx-auto" style={{ maxWidth: '500px' }}>
              We don't just send a plumber — we deliver a complete, worry-free experience.
            </p>
          </div>
          <div className="row g-4">
            {whyItems.map((w, i) => (
              <div className="col-md-6 col-lg-4" key={i}>
                <div className="why-card">
                  <div className="why-icon">{w.icon}</div>
                  <div className="why-title">{w.title}</div>
                  <div className="why-desc">{w.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta">
        <div className="container">
          <div className="cta-card">
            <div className="position-relative">
              <h2 className="cta-card-title">Ready to Experience Plumbora?</h2>
              <p className="cta-card-sub">
                Choose a service, share your problem details, and let the admin assign the right technician.
              </p>
              <div className="d-flex justify-content-center flex-wrap gap-2">
                <button className="btn-cta-white" onClick={() => navigate('/register')}>
                  Book a Plumber
                </button>
                <button className="btn-cta-outline" onClick={() => navigate('/register')}>
                  Join as Plumber
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}
