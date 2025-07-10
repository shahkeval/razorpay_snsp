import React, { useState } from 'react';
import './Login.css'; // Optional: Create a CSS file for styling
import Footer from '../components/Footer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await axios.post('https://namonamahshaswatparivar-dt17.vercel.app/api/auth/login', { username, password });
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1000);
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <>
    <div className="login-container">
      <h1>Admin Login</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
        {success && <div style={{ color: 'green', marginTop: '10px' }}>{success}</div>}
      </form>
    </div>
    <div>
        <Footer/>
    </div>
    </>
);
};

export default Login;
