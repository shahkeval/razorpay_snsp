import React, { useState, useEffect } from 'react';
import './Donation.css';
import { QRCodeSVG } from 'qrcode.react';
import Footer from '../components/Footer';
import axios from 'axios'; // Import axios for making HTTP requests
import gPayLogo from '../assets/gpay-logo (2).png'; // Import the gPay logo

const Donation = () => {
  const initialFormState = {
    name: '',
    category: '',
    phone: '',
    address: '',
    amount: '',
    message: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [qrData, setQrData] = useState(null);
  const [timer, setTimer] = useState(10);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (qrData && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [qrData, timer]);

  useEffect(() => {
    if (timer === 0) {
      setQrData(null);
      setSubmitted(false);
      setFormData(initialFormState);
      setError('QR Code expired. Please resubmit the form.');
    }
  }, [timer]);

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, category, phone, address, amount } = formData;

    if (!name || !category || !phone || !address || !amount) {
      setError('Please fill in all required fields.');
      return;
    }

    setError('');
    
    // Send data to the backend
    try {
      
      const response = await axios.post(`https://namonamahshaswatparivar-dt17.vercel.app/api/donations`, formData);
      console.log('Donation saved:', response.data);
      
      // Generate QR code after successful donation
      const qrString = `upi://pay?pa=namonamahshashwatcha.62486048@hdfcbank&pn=${formData.name}&am=${formData.amount}&cu=INR&tn=${formData.message}`;
      setQrData(qrString);
      setTimer(300); // 5 minutes
      setSubmitted(true); // Set submitted to true after successful save
    } catch (error) {
      console.error('Error saving donation:', error);
      setError('Failed to save donation. Please try again.');
    }
  };

  const handleBack = () => {
    setSubmitted(false);
    setQrData(null);
    setFormData(initialFormState);
    setError('');
    setTimer(10);
  };

  const handleGPay = () => {
    const { amount, name, message } = formData;
    const gPayUrl = `upi://pay?pa=namonamahshashwatcha.62486048@hdfcbank&pn=${name}&am=${amount}&cu=INR&tn=${message}`;
    window.open(gPayUrl, '_blank'); // Open gPay in a new tab
  };

  return (
    <>
    <div className="donation-container">
      <h1 className="heading" style={{marginTop: "0px"}}>Donation Form</h1>
      {!submitted && (
        <form className="donation-form" onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
          <select name="category" value={formData.category} onChange={handleChange} required>
            <option value="">Select Category</option>
            <option value="દેવદ્રવ્ય ખાતે">દેવદ્રવ્ય ખાતે</option>
            <option value="સાધુ-સાધ્વી વૈયાવચ્ચ ફંડ ખાતે">સાધુ-સાધ્વી વૈયાવચ્ચ ફંડ ખાતે</option>
            <option value="સાધર્મિક ખાતે">સાધર્મિક ખાતે</option>
            <option value="સાધારણ ફંડ ખાતે">સાધારણ ફંડ ખાતે</option>
            <option value="જીવદયા ખાતે">જીવદયા ખાતે</option>
            <option value="અનુકંપા ખાતે">અનુકંપા ખાતે</option>
          </select>
          <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
          <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
          <input type="number" name="amount" placeholder="Amount" value={formData.amount} onChange={handleChange} required />
          <textarea name="message" placeholder="Message (optional)" value={formData.message} onChange={handleChange} />
          <button type="submit">Submit</button>
          {error && <p className="error-message">{error}</p>}
        </form>
      )}

      {submitted && qrData && timer > 0 && (
        <div className="qr-section">
          <p>Scan the QR code below to complete your donation. Valid for: {Math.floor(timer / 60)}:{('0' + (timer % 60)).slice(-2)}</p>
          <QRCodeSVG value={qrData} size={256} />
          <br />
          <button className="gpay-button" onClick={handleGPay}>
            <img src={gPayLogo} alt="Google Pay" style={{ width: '30px' }} />
            Pay with gPay
          </button>
          
          <div>
          <button className="back-button" onClick={handleBack}>Back</button>
          </div>
        </div>
      )}
    </div>
    <Footer/>
    </>
  );
};

export default Donation;
