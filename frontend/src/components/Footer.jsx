import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/axios';

const footerStyles = `
  .footer {
    background: #0D2B2C;
    padding: 50px 0 28px;
    color: rgba(255,255,255,0.6);
    font-family: 'DM Sans', sans-serif;
  }
  .footer-brand {
    font-family: 'Clash Display', sans-serif;
    font-size: 20px; font-weight: 700;
    color: white; margin-bottom: 8px;
  }
  .footer-brand span { color: #00C2C7; }
  .footer-desc {
    font-size: 13px; line-height: 1.7;
    max-width: 260px; color: rgba(255,255,255,0.55);
  }
  .footer-heading {
    font-size: 13px; font-weight: 600;
    color: white; margin-bottom: 14px;
    text-transform: uppercase; letter-spacing: 1px;
  }
  .footer-link {
    display: block; font-size: 13px;
    color: rgba(255,255,255,0.55);
    margin-bottom: 8px; text-decoration: none;
    cursor: pointer; transition: color 0.2s;
    background: none; border: none; padding: 0;
    font-family: 'DM Sans', sans-serif;
    text-align: left;
  }
  .footer-link:hover { color: #00C2C7; }
  .footer-divider {
    border-color: rgba(255,255,255,0.08);
    margin: 30px 0 20px;
  }
  .footer-bottom {
    font-size: 12px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    color: rgba(255,255,255,0.4);
  }
  .footer-social-row {
    display: flex; gap: 10px; margin-top: 16px;
  }
  .footer-social-btn {
    width: 34px; height: 34px; border-radius: 50%;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; cursor: pointer;
    transition: background 0.2s, transform 0.2s;
    color: white;
  }
  .footer-social-btn:hover {
    background: #00C2C7;
    transform: translateY(-2px);
  }
`;

const company = [
  { label: 'About Us',  path: '/about' },
  { label: 'Contact',   path: '/contact' },
];

const support = [
  { label: 'Track Booking', path: '/track' },
  { label: 'Cancellation',  path: '/track' },
  { label: 'Plumbers',      path: '/plumbers' },
];

export default function Footer() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await API.get('/services');
        setServices((data.services || []).slice(0, 4).map((service) => ({
          label: service.serviceName,
          path: '/services',
        })));
      } catch {
        setServices([]);
      }
    };
    fetchServices();
  }, []);

  return (
    <>
      <style>{footerStyles}</style>
      <footer className="footer">
        <div className="container">
          <div className="row g-4 mb-2">

            {/* Brand */}
            <div className="col-lg-4">
              <div className="footer-brand" style={{ cursor:'pointer' }} onClick={() => navigate('/')}>
                PLUMB<span>ORA</span>
              </div>
              <p className="footer-desc">
                Your trusted platform for fast, verified, and affordable
                plumbing services — available 24/7 across India.
              </p>
              <div className="footer-social-row">
                <button className="footer-social-btn" title="Facebook">📘</button>
                <button className="footer-social-btn" title="Instagram">📸</button>
                <button className="footer-social-btn" title="Twitter">🐦</button>
                <button className="footer-social-btn" title="LinkedIn">💼</button>
              </div>
            </div>

            {/* Services */}
            <div className="col-lg-2 col-6">
              <div className="footer-heading">Services</div>
              {services.map(({ label, path }) => (
                <button className="footer-link" key={label} onClick={() => navigate(path)}>{label}</button>
              ))}
              {services.length === 0 && (
                <button className="footer-link" onClick={() => navigate('/services')}>View Services</button>
              )}
            </div>

            {/* Company */}
            <div className="col-lg-2 col-6">
              <div className="footer-heading">Company</div>
              {company.map(({ label, path }) => (
                <button className="footer-link" key={label} onClick={() => navigate(path)}>{label}</button>
              ))}
            </div>

            {/* Support */}
            <div className="col-lg-2 col-6">
              <div className="footer-heading">Support</div>
              {support.map(({ label, path }) => (
                <button className="footer-link" key={label} onClick={() => navigate(path)}>{label}</button>
              ))}
            </div>

            {/* Contact */}
            <div className="col-lg-2 col-6">
              <div className="footer-heading">Contact</div>
              <button className="footer-link">📞 +91 72789 84078</button>
              <button className="footer-link">✉️ hello@plumbora.in</button>
              <button className="footer-link" onClick={() => navigate('/contact')}>📍 Baruipur, India</button>
            </div>

          </div>

          <hr className="footer-divider" />

          <div className="footer-bottom">
            <span>© 2026 Plumbora. All rights reserved.</span>
            <span>Privacy Policy · Terms of Service · Cookie Policy</span>
          </div>
        </div>
      </footer>
    </>
  );
}
