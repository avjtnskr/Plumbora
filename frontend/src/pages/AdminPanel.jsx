import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/axios';
import './AdminPanel.css';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: '▦' },
  { key: 'bookings', label: 'Booking Requests', icon: '◎' },
  { key: 'technicians', label: 'Technicians', icon: '◉' },
  { key: 'services', label: 'Services', icon: '◆' },
  { key: 'customers', label: 'Customers', icon: '◇' },
  { key: 'reports', label: 'Reports', icon: '▤' },
];

const emptyTechnician = {
  name: '',
  phone: '',
  email: '',
  specialization: '',
  experience: '',
  serviceId: '',
  location: '',
  city: '',
  pricePerHour: '',
  availability: 'online',
  isActive: true,
};

const emptyService = {
  serviceName: '',
  serviceDescription: '',
  serviceCharges: '',
  category: 'Repair',
  isActive: true,
};

const formatDateTime = (booking) => {
  if (!booking?.scheduledAt) return `${booking?.bookingDate || ''} ${booking?.bookingTime || ''}`;
  return new Date(booking.scheduledAt).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const customerName = (user) => [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Customer';

function StatCard({ label, value }) {
  return (
    <div className="admin-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [stats, setStats] = useState({});
  const [bookings, setBookings] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [bookingDraft, setBookingDraft] = useState({
    status: 'pending',
    finalAmount: '',
    paymentStatus: 'unpaid',
    adminNotes: '',
    technicianId: '',
  });

  const [technicianForm, setTechnicianForm] = useState(emptyTechnician);
  const [editingTechnicianId, setEditingTechnicianId] = useState('');
  const [serviceForm, setServiceForm] = useState(emptyService);
  const [editingServiceId, setEditingServiceId] = useState('');

  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking._id === selectedBookingId) || bookings[0],
    [bookings, selectedBookingId]
  );
  const activeLabel = TABS.find((tab) => tab.key === activeTab)?.label || 'Dashboard';

  const availableTechnicians = useMemo(() => {
    if (!selectedBooking?.serviceId) return technicians;
    return technicians.filter((technician) => {
      const serviceId = technician.service?._id || technician.service;
      return String(serviceId) === String(selectedBooking.serviceId);
    });
  }, [selectedBooking, technicians]);

  const showMessage = (text) => {
    setMessage(text);
    setError('');
    setTimeout(() => setMessage(''), 3000);
  };

  const showError = (text) => {
    setError(text);
    setMessage('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes, techniciansRes, servicesRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/bookings'),
        API.get('/plumbers/admin/all'),
        API.get('/services/admin/all'),
        API.get('/admin/users'),
      ]);

      setStats(statsRes.data.stats || {});
      setBookings(bookingsRes.data.bookings || []);
      setTechnicians((techniciansRes.data.technicians || techniciansRes.data.plumbers || [])
        .filter((technician) => technician.isActive !== false));
      setServices((servicesRes.data.services || [])
        .filter((service) => service.isActive !== false));
      setCustomers(usersRes.data.users || []);
    } catch (err) {
      showError(err.response?.data?.message || 'Could not load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (isAdmin) loadAdminData();
  }, [isLoggedIn, isAdmin]);

  useEffect(() => {
    if (!selectedBooking) return;
    setBookingDraft({
      status: selectedBooking.status || 'pending',
      finalAmount: selectedBooking.finalAmount || selectedBooking.amount || '',
      paymentStatus: selectedBooking.paymentStatus || 'unpaid',
      adminNotes: selectedBooking.adminNotes || '',
      technicianId: selectedBooking.plumber?._id || selectedBooking.plumber || '',
    });
  }, [selectedBooking?._id]);

  const updateBooking = async () => {
    if (!selectedBooking) return;
    try {
      const payload = {
        status: bookingDraft.status,
        finalAmount: Number(bookingDraft.finalAmount || 0),
        paymentStatus: bookingDraft.paymentStatus,
        cashCollected: bookingDraft.paymentStatus === 'paid',
        adminNotes: bookingDraft.adminNotes,
      };

      if (bookingDraft.technicianId && bookingDraft.technicianId !== (selectedBooking.plumber?._id || selectedBooking.plumber)) {
        await API.put(`/bookings/${selectedBooking._id}/assign`, {
          plumber: bookingDraft.technicianId,
          adminNotes: bookingDraft.adminNotes,
        });
      }

      await API.put(`/bookings/${selectedBooking._id}`, payload);
      await loadAdminData();
      showMessage('Booking updated successfully.');
    } catch (err) {
      showError(err.response?.data?.message || 'Booking update failed.');
    }
  };

  const sendEmail = async () => {
    if (!selectedBooking) return;
    try {
      const { data } = await API.post(`/bookings/${selectedBooking._id}/send-email`, {
        adminNotes: bookingDraft.adminNotes,
      });
      await loadAdminData();
      showMessage(data.message || 'Email sent to technician.');
    } catch (err) {
      showError(err.response?.data?.message || 'Email failed.');
    }
  };

  const saveTechnician = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...technicianForm,
        experience: Number(technicianForm.experience || 0),
        pricePerHour: Number(technicianForm.pricePerHour || 0),
        serviceId: technicianForm.serviceId,
      };

      if (editingTechnicianId) {
        await API.put(`/plumbers/${editingTechnicianId}`, payload);
        showMessage('Technician updated.');
      } else {
        await API.post('/plumbers', payload);
        showMessage('Technician added.');
      }

      setTechnicianForm(emptyTechnician);
      setEditingTechnicianId('');
      await loadAdminData();
    } catch (err) {
      showError(err.response?.data?.message || 'Technician save failed.');
    }
  };

  const editTechnician = (technician) => {
    setEditingTechnicianId(technician._id);
    setTechnicianForm({
      name: technician.name || '',
      phone: technician.phone || '',
      email: technician.email || '',
      specialization: technician.specialization || technician.specialisation || '',
      experience: technician.experience || '',
      serviceId: technician.service?._id || technician.service || '',
      location: technician.location || '',
      city: technician.city || '',
      pricePerHour: technician.pricePerHour || '',
      availability: technician.availability || 'online',
      isActive: technician.isActive !== false,
    });
    setActiveTab('technicians');
  };

  const deleteTechnician = async (id) => {
    if (!window.confirm('Deactivate this technician?')) return;
    try {
      await API.delete(`/plumbers/${id}`);
      await loadAdminData();
      showMessage('Technician deactivated.');
    } catch (err) {
      showError(err.response?.data?.message || 'Technician delete failed.');
    }
  };

  const saveService = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...serviceForm,
        serviceCharges: Number(serviceForm.serviceCharges || 0),
      };

      if (editingServiceId) {
        await API.put(`/services/${editingServiceId}`, payload);
        showMessage('Service updated.');
      } else {
        await API.post('/services', payload);
        showMessage('Service added.');
      }

      setServiceForm(emptyService);
      setEditingServiceId('');
      await loadAdminData();
    } catch (err) {
      showError(err.response?.data?.message || 'Service save failed.');
    }
  };

  const editService = (service) => {
    setEditingServiceId(service._id);
    setServiceForm({
      serviceName: service.serviceName || '',
      serviceDescription: service.serviceDescription || '',
      serviceCharges: service.serviceCharges || '',
      category: service.category || 'Repair',
      isActive: service.isActive !== false,
    });
    setActiveTab('services');
  };

  const deleteService = async (id) => {
    if (!window.confirm('Deactivate this service?')) return;
    try {
      await API.delete(`/services/${id}`);
      await loadAdminData();
      showMessage('Service deactivated.');
    } catch (err) {
      showError(err.response?.data?.message || 'Service delete failed.');
    }
  };

  const deleteCustomer = async (customer) => {
    if (customer.role === 'admin') {
      showError('Admin users cannot be deleted from this screen.');
      return;
    }
    if (!window.confirm(`Delete customer ${customerName(customer)}?`)) return;
    try {
      await API.delete(`/admin/users/${customer._id}`);
      await loadAdminData();
      showMessage('Customer deleted.');
    } catch (err) {
      showError(err.response?.data?.message || 'Customer delete failed.');
    }
  };

  if (isLoggedIn && !isAdmin) {
    return (
      <div className="admin-page">
        <main className="admin-login-state">
          <div className="admin-empty">Admin access only.</div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-dot" />
          <div>
            <strong>PLUMBORA</strong>
            <small>Admin Panel</small>
          </div>
        </div>

        <nav className="admin-side-nav">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? 'active' : ''}
              onClick={() => setActiveTab(tab.key)}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="admin-side-footer">
          <button onClick={() => navigate('/')}>Back to Website</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="admin-shell">
        <div className="admin-header">
          <div>
            <p className="admin-kicker">Operations Control</p>
            <h1>{activeLabel}</h1>
            <span className="admin-user-line">{user?.email}</span>
          </div>
          <button className="admin-btn secondary" onClick={loadAdminData}>Refresh</button>
        </div>

        {message && <div className="admin-alert success">{message}</div>}
        {error && <div className="admin-alert error">{error}</div>}

        {loading ? (
          <div className="admin-empty">Loading admin data...</div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <section className="admin-section">
                <div className="admin-stats">
                  <StatCard label="Customers" value={stats.users || 0} />
                  <StatCard label="Services" value={stats.services || 0} />
                  <StatCard label="Technicians" value={stats.plumbers || 0} />
                  <StatCard label="Bookings" value={stats.bookings || 0} />
                  <StatCard label="Pending" value={stats.pending || 0} />
                  <StatCard label="Confirmed" value={stats.confirmed || 0} />
                  <StatCard label="Completed" value={stats.completed || 0} />
                  <StatCard label="Cash Collected" value={`₹${stats.revenue || 0}`} />
                </div>
              </section>
            )}

            {activeTab === 'bookings' && (
              <section className="admin-grid two">
                <div className="admin-card">
                  <div className="admin-card-head">
                    <h2>Booking Requests</h2>
                    <span>{bookings.length} total</span>
                  </div>
                  <div className="admin-list">
                    {bookings.map((booking) => (
                      <button
                        key={booking._id}
                        className={`admin-list-item ${selectedBooking?._id === booking._id ? 'selected' : ''}`}
                        onClick={() => setSelectedBookingId(booking._id)}
                      >
                        <strong>{booking.service}</strong>
                        <span>{customerName(booking.user)} · {booking.status}</span>
                        <small>{formatDateTime(booking)}</small>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="admin-card">
                  <div className="admin-card-head">
                    <h2>Booking Details</h2>
                    {selectedBooking?.emailSent && <span>Email sent</span>}
                  </div>
                  {selectedBooking ? (
                    <>
                      <div className="admin-detail-grid">
                        <div><span>Customer</span><strong>{customerName(selectedBooking.user)}</strong></div>
                        <div><span>Mobile</span><strong>{selectedBooking.user?.mobile || '-'}</strong></div>
                        <div><span>Service</span><strong>{selectedBooking.service}</strong></div>
                        <div><span>Amount</span><strong>₹{selectedBooking.amount || 0}</strong></div>
                        <div className="wide"><span>Address</span><strong>{selectedBooking.serviceAddress || selectedBooking.address}</strong></div>
                        <div className="wide"><span>Problem</span><strong>{selectedBooking.problemDetails || selectedBooking.description}</strong></div>
                      </div>

                      <div className="admin-form compact">
                        <label>Status
                          <select value={bookingDraft.status} onChange={(e) => setBookingDraft({ ...bookingDraft, status: e.target.value })}>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </label>
                        <label>Technician
                          <select value={bookingDraft.technicianId} onChange={(e) => setBookingDraft({ ...bookingDraft, technicianId: e.target.value })}>
                            <option value="">Select technician</option>
                            {availableTechnicians.map((tech) => (
                              <option key={tech._id} value={tech._id}>{tech.name} · {tech.email}</option>
                            ))}
                          </select>
                        </label>
                        <label>Final Amount
                          <input value={bookingDraft.finalAmount} onChange={(e) => setBookingDraft({ ...bookingDraft, finalAmount: e.target.value })} />
                        </label>
                        <label>Payment
                          <select value={bookingDraft.paymentStatus} onChange={(e) => setBookingDraft({ ...bookingDraft, paymentStatus: e.target.value })}>
                            <option value="unpaid">Cash Pending</option>
                            <option value="paid">Cash Collected</option>
                          </select>
                        </label>
                        <label className="wide">Admin Notes
                          <textarea rows="3" value={bookingDraft.adminNotes} onChange={(e) => setBookingDraft({ ...bookingDraft, adminNotes: e.target.value })} />
                        </label>
                      </div>

                      <div className="admin-actions">
                        <button className="admin-btn" onClick={updateBooking}>Update Booking</button>
                        <button className="admin-btn dark" onClick={sendEmail}>Send Email</button>
                      </div>
                    </>
                  ) : (
                    <div className="admin-empty small">No booking selected.</div>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'technicians' && (
              <section className="admin-grid two">
                <form className="admin-card admin-form" onSubmit={saveTechnician}>
                  <div className="admin-card-head">
                    <h2>{editingTechnicianId ? 'Update Technician' : 'Add Technician'}</h2>
                  </div>
                  <label>Name<input required value={technicianForm.name} onChange={(e) => setTechnicianForm({ ...technicianForm, name: e.target.value })} /></label>
                  <label>Phone<input required value={technicianForm.phone} onChange={(e) => setTechnicianForm({ ...technicianForm, phone: e.target.value })} /></label>
                  <label>Email<input required type="email" value={technicianForm.email} onChange={(e) => setTechnicianForm({ ...technicianForm, email: e.target.value })} /></label>
                  <label>Specialization<input required value={technicianForm.specialization} onChange={(e) => setTechnicianForm({ ...technicianForm, specialization: e.target.value })} /></label>
                  <label>Experience<input required type="number" min="0" value={technicianForm.experience} onChange={(e) => setTechnicianForm({ ...technicianForm, experience: e.target.value })} /></label>
                  <label>Service
                    <select required value={technicianForm.serviceId} onChange={(e) => setTechnicianForm({ ...technicianForm, serviceId: e.target.value })}>
                      <option value="">Select service</option>
                      {services.filter((service) => service.isActive !== false).map((service) => (
                        <option key={service._id} value={service._id}>{service.serviceName}</option>
                      ))}
                    </select>
                  </label>
                  <label>Location<input required value={technicianForm.location} onChange={(e) => setTechnicianForm({ ...technicianForm, location: e.target.value })} /></label>
                  <label>City<input required value={technicianForm.city} onChange={(e) => setTechnicianForm({ ...technicianForm, city: e.target.value })} /></label>
                  <label>Price/hour<input required type="number" min="0" value={technicianForm.pricePerHour} onChange={(e) => setTechnicianForm({ ...technicianForm, pricePerHour: e.target.value })} /></label>
                  <label>Availability
                    <select value={technicianForm.availability} onChange={(e) => setTechnicianForm({ ...technicianForm, availability: e.target.value })}>
                      <option value="online">Online</option>
                      <option value="busy">Busy</option>
                      <option value="offline">Offline</option>
                    </select>
                  </label>
                  <div className="admin-actions wide">
                    <button className="admin-btn" type="submit">{editingTechnicianId ? 'Update' : 'Create'}</button>
                    {editingTechnicianId && <button className="admin-btn secondary" type="button" onClick={() => { setEditingTechnicianId(''); setTechnicianForm(emptyTechnician); }}>Cancel</button>}
                  </div>
                </form>

                <div className="admin-card">
                  <div className="admin-card-head"><h2>Technicians</h2><span>{technicians.length} total</span></div>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead><tr><th>Name</th><th>Service</th><th>Status</th><th></th></tr></thead>
                      <tbody>
                        {technicians.map((tech) => (
                          <tr key={tech._id}>
                            <td><strong>{tech.name}</strong><small>{tech.email}</small></td>
                            <td>{tech.service?.serviceName || '-'}</td>
                            <td>{tech.isActive === false ? 'Inactive' : tech.availability}</td>
                            <td>
                              <button onClick={() => editTechnician(tech)}>Edit</button>
                              <button onClick={() => deleteTechnician(tech._id)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'services' && (
              <section className="admin-grid two">
                <form className="admin-card admin-form" onSubmit={saveService}>
                  <div className="admin-card-head">
                    <h2>{editingServiceId ? 'Update Service' : 'Add Service'}</h2>
                  </div>
                  <label>Service Name<input required value={serviceForm.serviceName} onChange={(e) => setServiceForm({ ...serviceForm, serviceName: e.target.value })} /></label>
                  <label>Charges<input required type="number" min="0" value={serviceForm.serviceCharges} onChange={(e) => setServiceForm({ ...serviceForm, serviceCharges: e.target.value })} /></label>
                  <label>Category
                    <select value={serviceForm.category} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}>
                      <option value="Repair">Repair</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Installation">Installation</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </label>
                  <label>Status
                    <select value={serviceForm.isActive ? 'active' : 'inactive'} onChange={(e) => setServiceForm({ ...serviceForm, isActive: e.target.value === 'active' })}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>
                  <label className="wide">Description<textarea required rows="4" value={serviceForm.serviceDescription} onChange={(e) => setServiceForm({ ...serviceForm, serviceDescription: e.target.value })} /></label>
                  <div className="admin-actions wide">
                    <button className="admin-btn" type="submit">{editingServiceId ? 'Update' : 'Create'}</button>
                    {editingServiceId && <button className="admin-btn secondary" type="button" onClick={() => { setEditingServiceId(''); setServiceForm(emptyService); }}>Cancel</button>}
                  </div>
                </form>

                <div className="admin-card">
                  <div className="admin-card-head"><h2>Services</h2><span>{services.length} total</span></div>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead><tr><th>Service</th><th>Charge</th><th>Status</th><th></th></tr></thead>
                      <tbody>
                        {services.map((service) => (
                          <tr key={service._id}>
                            <td><strong>{service.serviceName}</strong><small>{service.category}</small></td>
                            <td>₹{service.serviceCharges}</td>
                            <td>{service.isActive === false ? 'Inactive' : 'Active'}</td>
                            <td>
                              <button onClick={() => editService(service)}>Edit</button>
                              <button onClick={() => deleteService(service._id)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'customers' && (
              <section className="admin-card">
                <div className="admin-card-head"><h2>Customers</h2><span>{customers.length} total</span></div>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Role</th><th>Address</th><th></th></tr></thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer._id}>
                          <td><strong>{customerName(customer)}</strong></td>
                          <td>{customer.email}</td>
                          <td>{customer.mobile}</td>
                          <td>{customer.role}</td>
                          <td>{customer.address}</td>
                          <td>
                            {customer.role !== 'admin' && (
                              <button onClick={() => deleteCustomer(customer)}>Delete</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeTab === 'reports' && (
              <section className="admin-grid two">
                <div className="admin-card">
                  <div className="admin-card-head"><h2>Booking Report</h2><span>Current totals</span></div>
                  <div className="admin-report-list">
                    <div><span>Total bookings</span><strong>{stats.bookings || 0}</strong></div>
                    <div><span>Pending</span><strong>{stats.pending || 0}</strong></div>
                    <div><span>Confirmed</span><strong>{stats.confirmed || 0}</strong></div>
                    <div><span>In progress</span><strong>{stats.inProgress || 0}</strong></div>
                    <div><span>Completed</span><strong>{stats.completed || 0}</strong></div>
                    <div><span>Cancelled</span><strong>{stats.cancelled || 0}</strong></div>
                  </div>
                </div>
                <div className="admin-card">
                  <div className="admin-card-head"><h2>Cash Collection</h2><span>COD only</span></div>
                  <div className="admin-report-list">
                    <div><span>Paid bookings</span><strong>{stats.paidBookings || 0}</strong></div>
                    <div><span>Total cash collected</span><strong>₹{stats.revenue || 0}</strong></div>
                    <div><span>Technicians</span><strong>{stats.plumbers || 0}</strong></div>
                    <div><span>Active services</span><strong>{stats.services || 0}</strong></div>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
