import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Registration = () => {

  const navigate     = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const onlyDigits = (value) => value.replace(/\D/g, '');

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === 'mobile'
      ? onlyDigits(value).replace(/^91(?=\d{10}$)/, '').slice(0, 10)
      : value;
    setFormData({ ...formData, [name]: nextValue });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleaned = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      mobile: onlyDigits(formData.mobile).slice(0, 10),
      address: formData.address.trim(),
      password: formData.password.trim(),
      confirmPassword: formData.confirmPassword.trim(),
    };

    if (!cleaned.firstName || !cleaned.lastName || !cleaned.email || !cleaned.mobile || !cleaned.address || !cleaned.password || !cleaned.confirmPassword) {
      setError('Please fill all required fields. Blank spaces are not allowed.');
      return;
    }

    if (cleaned.mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Validate passwords match
    if (cleaned.password !== cleaned.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    // Validate password length
    if (cleaned.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({
        firstName: cleaned.firstName,
        lastName:  cleaned.lastName,
        email:     cleaned.email,
        mobile:    `+91${cleaned.mobile}`,
        address:   cleaned.address,
        password:  cleaned.password,
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-background">
      <Container>
        <Row className="justify-content-center align-items-center vh-100">
          <Col md={5} lg={4}>
            <Card className="login-card shadow">
              <Card.Body className="p-5">

                {/* Close Button */}
                <button className="close-btn" onClick={() => navigate('/')}>×</button>

                {/* Heading */}
                <div className="text-center mb-4">
                  <h1 className="plumbora-logo">Plumbora</h1>
                  <p className="text-muted">Create Your Account</p>
                </div>

                {/* Error Alert */}
                {error && (
                  <div style={{
                    background: '#FFF5F5', border: '1px solid #FED7D7',
                    borderRadius: '8px', padding: '10px 14px',
                    fontSize: '13px', color: '#E53E3E', marginBottom: '16px',
                  }}>
                    ⚠️ {error}
                  </div>
                )}

                {/* Registration Form */}
                <Form onSubmit={handleSubmit}>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formFirstName">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          placeholder="First name"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formLastName">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          placeholder="Last name"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formMobile">
                    <Form.Label>Mobile Number</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>+91</InputGroup.Text>
                      <Form.Control
                        type="tel"
                        name="mobile"
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        placeholder="00000 00000"
                        value={formData.mobile}
                        onChange={handleChange}
                        required
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formAddress">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      placeholder="House/Flat, Street, Area"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Create password (min 6 characters)"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 login-btn"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                  </Button>

                </Form>

                {/* Login Link */}
                <div className="text-center mt-4">
                  <p className="mb-0">Already have an account?</p>
                  <Link to="/login" className="text-decoration-none aqua-link fw-bold">
                    Login
                  </Link>
                </div>

              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Registration;
