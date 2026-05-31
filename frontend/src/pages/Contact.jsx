import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Contact.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const INFO_CARDS = [
  {
    icon: '📞',
    title: 'Call Us',
    value: <><a href="tel:+917278984078">+91 72789 84078</a><br />Mon–Sat, 9am–8pm</>,
  },
  {
    icon: '✉️',
    title: 'Email Us',
    value: <><a href="mailto:hello@plumbora.in">hello@plumbora.in</a><br />We reply within 24 hours</>,
  },
  {
    icon: '📍',
    title: 'Our Location',
    value: <>Baruipur, Kolkata<br />West Bengal, India — 700144</>,
  },
  {
    icon: '🕐',
    title: 'Working Hours',
    value: <>Mon – Sat: 9am – 8pm<br />Emergency: 24/7</>,
  },
];

const SUBJECTS = [
  'General Inquiry',
  'Book a Service',
  'Complaint / Issue',
  'Partnership',
  'Other',
];

export default function Contact() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', subject: '', message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    // Simulate API call — replace with real API when ready
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="contact-page">

      <Navbar />

      {/* ── HERO ── */}
      <section className="contact-hero">
        <div className="contact-hero-bg b1" />
        <div className="contact-hero-bg b2" />
        <div className="container fade-up">
          <div className="contact-tag">
            <span className="contact-tag-dot" />
            Get In Touch
          </div>
          <h1 className="contact-hero-title">
            We're Here to <span className="accent">Help</span> You
          </h1>
          <p className="contact-hero-sub">
            Have a question, complaint, or just want to say hello?
            Reach out to us and our team will get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* ── INFO CARDS ── */}
      <section className="contact-info-section">
        <div className="container">
          <div className="row g-4">
            {INFO_CARDS.map((card, i) => (
              <div className="col-md-6 col-lg-3" key={i}>
                <div className="info-card">
                  <div className="info-icon">{card.icon}</div>
                  <div className="info-title">{card.title}</div>
                  <div className="info-value">{card.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORM + MAP ── */}
      <section className="contact-form-section">
        <div className="container">
          <div className="row g-4 align-items-start">

            {/* Contact Form */}
            <div className="col-lg-7">
              <div className="contact-form-card">
                <div className="section-label">Send a Message</div>
                <h2 className="section-title">We'd Love to Hear From You</h2>
                <p className="section-sub">
                  Fill in the form below and we'll get back to you within 24 hours.
                </p>

                {success && (
                  <div className="success-alert">
                    ✅ Message sent successfully! We'll get back to you soon.
                  </div>
                )}
                {error && (
                  <div className="error-alert">⚠️ {error}</div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    {/* Name */}
                    <div className="field-group">
                      <label className="field-label">Full Name <span style={{color:'var(--error)'}}>*</span></label>
                      <div className="field-wrap">
                        <span className="field-icon">👤</span>
                        <input
                          className="field-input"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="field-group">
                      <label className="field-label">Email Address <span style={{color:'var(--error)'}}>*</span></label>
                      <div className="field-wrap">
                        <span className="field-icon">✉️</span>
                        <input
                          className="field-input"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="field-group">
                      <label className="field-label">Phone Number</label>
                      <div className="field-wrap">
                        <span className="field-icon">📞</span>
                        <input
                          className="field-input"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+91 00000 00000"
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="field-group">
                      <label className="field-label">Subject</label>
                      <div className="field-wrap">
                        <span className="field-icon">📋</span>
                        <select
                          className="field-input"
                          name="subject"
                          value={form.subject}
                          onChange={handleChange}
                          style={{ cursor: 'pointer' }}
                        >
                          <option value="">Select a subject</option>
                          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="field-group">
                    <label className="field-label">Message <span style={{color:'var(--error)'}}>*</span></label>
                    <div className="field-wrap">
                      <span className="field-icon" style={{ top: '16px', transform: 'none' }}>💬</span>
                      <textarea
                        className="field-textarea"
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Write your message here..."
                        required
                      />
                    </div>
                  </div>

                  <button className="btn-send" type="submit" disabled={loading}>
                    {loading ? <>⏳ Sending...</> : <>📨 Send Message</>}
                  </button>
                </form>
              </div>
            </div>

            {/* Map / Location */}
            <div className="col-lg-5">
              <div className="map-card">
                <div className="map-icon">🗺️</div>
                <div className="map-title">Find Us Here</div>
                <div className="map-sub">
                  Baruipur, Kolkata<br />
                  West Bengal, India — 700144<br /><br />
                  Available across Mumbai, Pune,<br />
                  Thane, Bangalore and more cities.
                </div>
                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                  <button
                    style={{
                      background: 'var(--aqua)', color: 'white', border: 'none',
                      padding: '11px 20px', borderRadius: 'var(--radius-sm)',
                      fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
                    }}
                    onClick={() => navigate('/services')}
                  >
                    🔧 Book a Service
                  </button>
                  <button
                    style={{
                      background: 'transparent', color: 'var(--aqua-dark)',
                      border: '1.5px solid var(--aqua)',
                      padding: '11px 20px', borderRadius: 'var(--radius-sm)',
                      fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
                    }}
                    onClick={() => navigate('/plumbers')}
                  >
                    👨‍🔧 View Plumbers
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
}