import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {

  const navigate  = useNavigate();
  const { login } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Email and password cannot be blank.');
      return;
    }

    setLoading(true);
    try {
      const data = await login(cleanEmail, cleanPassword);
      navigate(data.user?.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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
                  <p className="text-muted">Welcome Back</p>
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

                {/* Login Form */}
                <Form onSubmit={handleSubmit}>

                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      required
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 login-btn"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>

                </Form>

                {/* Register Link */}
                <div className="text-center mt-4">
                  <p className="mb-0">Don't have an account?</p>
                  <Link to="/register" className="text-decoration-none aqua-link fw-bold">
                    Sign Up
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

export default Login;
