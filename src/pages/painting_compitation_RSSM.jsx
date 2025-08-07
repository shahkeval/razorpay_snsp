import React, { useState } from 'react';
import states from '../data/IN-states.json';
import cities from '../data/IN-cities.json';

const PaintingCompitationRSSM = () => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    gender: '',
    area: '',
    sanghName: '',
    state: '',
    city: '',
    ageGroup: '',
    paintingType: '',
  });
  const [focusField, setFocusField] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Find the selected state object
  const selectedState = states.find((s) => s.name === formData.state);
  // Filter cities by selected state
  const filteredCities = selectedState
    ? cities.filter((city) => city.stateCode === selectedState.isoCode)
    : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Reset city if state changes
    if (name === 'state') {
      setFormData((prev) => ({ ...prev, state: value, city: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFocus = (e) => setFocusField(e.target.name);
  const handleBlur = () => setFocusField('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const apiBase = process.env.REACT_APP_API_BASE_URL || '';
      const response = await fetch(`${apiBase}/api/painting_rssm/create_paint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        let errorMsg = 'Something went wrong. Please try again later.';
        if (process.env.NODE_ENV === 'development') {
          const data = await response.json();
          errorMsg = data.error || errorMsg;
        }
        throw new Error(errorMsg);
      }
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAnother = () => {
    setFormData({
      name: '',
      contact: '',
      gender: '',
      area: '',
      sanghName: '',
      state: '',
      city: '',
      ageGroup: '',
      paintingType: '',
    });
    setSubmitSuccess(false);
    setSubmitError('');
    setFocusField('');
  };

  return (
    <>
      <h2
        style={{
          textAlign: 'center',
          marginBottom: 24,
          color: '#800000',
          fontWeight: 700,
          fontSize: '1.6rem',
          letterSpacing: '0.5px',
        }}
      >
        Painting Competition Registration (RSSM)
      </h2>
      {submitSuccess ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px',
            padding: '2rem 1rem',
          }}
        >
          <div
            style={{
              background: '#e8f5e9',
              border: '1px solid #43a047',
              borderRadius: '12px',
              padding: '2rem 2.5rem',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(67,160,71,0.07)',
            }}
          >
            <div style={{ fontSize: '2rem', color: '#43a047', marginBottom: '1rem' }}>&#10003;</div>
            <h2 style={{ color: '#2e7d32', marginBottom: '0.5rem' }}>Thank you for your registration!</h2>
            <div style={{ fontSize: '1.1rem', color: '#333', marginBottom: '1.5rem' }}>
              We have received your details.<br />We will contact you with more information soon.
            </div>
            <button
              onClick={handleAddAnother}
              style={{
                background: '#43a047',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                padding: '0.8rem 1.5rem',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              Add Another Response
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ width: '100%', maxWidth: 360, margin: '0 auto' }}
          autoComplete="off"
        >
          {/* Name */}
          <div style={{ marginBottom: 18, display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="name" style={{ marginBottom: 6, fontWeight: 600, color: '#333' }}>Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
              disabled={isSubmitting}
              style={{
                padding: '10px 12px',
                border: focusField === 'name' ? '2px solid #800000' : '1.5px solid #d1d5db',
                borderRadius: 6,
                fontSize: '1rem',
                outline: 'none',
                transition: 'border 0.2s',
                fontWeight: 500,
              }}
            />
          </div>
          {/* Contact Details */}
          <div style={{ marginBottom: 18, display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="contact" style={{ marginBottom: 6, fontWeight: 600, color: '#333' }}>Contact Details (Whatsapp Number)*</label>
            <input
              type="text"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
              disabled={isSubmitting}
              style={{
                padding: '10px 12px',
                border: focusField === 'contact' ? '2px solid #800000' : '1.5px solid #d1d5db',
                borderRadius: 6,
                fontSize: '1rem',
                outline: 'none',
                transition: 'border 0.2s',
                fontWeight: 500,
              }}
            />
          </div>
          {/* Gender (Radio) */}
          <div style={{ marginBottom: 18, display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: 6, fontWeight: 600, color: '#333' }}>Gender*</label>
            <div style={{ display: 'flex', gap: '2rem', margin: '0.5rem 0 0.5rem 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={formData.gender === 'Male'}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                /> Male
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={formData.gender === 'Female'}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                /> Female
              </label>
            </div>
          </div>
          {/* Area */}
          <div style={{ marginBottom: 18, display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="area" style={{ marginBottom: 6, fontWeight: 600, color: '#333' }}>Area*</label>
            <input
              type="text"
              id="area"
              name="area"
              value={formData.area}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
              disabled={isSubmitting}
              style={{
                padding: '10px 12px',
                border: focusField === 'area' ? '2px solid #800000' : '1.5px solid #d1d5db',
                borderRadius: 6,
                fontSize: '1rem',
                outline: 'none',
                transition: 'border 0.2s',
                fontWeight: 500,
              }}
            />
          </div>
          {/* Sangh Name */}
          <div style={{ marginBottom: 18, display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="sanghName" style={{ marginBottom: 6, fontWeight: 600, color: '#333' }}>Sangh Name*</label>
            <input
              type="text"
              id="sanghName"
              name="sanghName"
              value={formData.sanghName}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
              disabled={isSubmitting}
              style={{
                padding: '10px 12px',
                border: focusField === 'sanghName' ? '2px solid #800000' : '1.5px solid #d1d5db',
                borderRadius: 6,
                fontSize: '1rem',
                outline: 'none',
                transition: 'border 0.2s',
                fontWeight: 500,
              }}
            />
          </div>
          {/* State */}
          <div style={{ marginBottom: 18, display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="state" style={{ marginBottom: 6, fontWeight: 600, color: '#333' }}>State*</label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
              disabled={isSubmitting}
              style={{
                padding: '10px 12px',
                border: focusField === 'state' ? '2px solid #800000' : '1.5px solid #d1d5db',
                borderRadius: 6,
                fontSize: '1rem',
                outline: 'none',
                transition: 'border 0.2s',
                fontWeight: 500,
                background: '#fff',
              }}
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state.isoCode} value={state.name}>{state.name}</option>
              ))}
            </select>
          </div>
          {/* City (dropdown, filtered by state) */}
          <div style={{ marginBottom: 18, display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="city" style={{ marginBottom: 6, fontWeight: 600, color: '#333' }}>City*</label>
            <select
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
              disabled={!formData.state || isSubmitting}
              style={{
                padding: '10px 12px',
                border: focusField === 'city' ? '2px solid #800000' : '1.5px solid #d1d5db',
                borderRadius: 6,
                fontSize: '1rem',
                outline: 'none',
                transition: 'border 0.2s',
                fontWeight: 500,
                background: '#fff',
                color: '#333',
              }}
            >
              <option value="">{formData.state ? 'Select City' : 'Select State First'}</option>
              {filteredCities.map((city) => (
                <option key={city.name} value={city.name}>{city.name}</option>
              ))}
            </select>
          </div>
          {/* Age Group */}
          <div style={{ marginBottom: 18, display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="ageGroup" style={{ marginBottom: 6, fontWeight: 600, color: '#333' }}>Age Group*</label>
            <select
              id="ageGroup"
              name="ageGroup"
              value={formData.ageGroup}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
              disabled={isSubmitting}
              style={{
                padding: '10px 12px',
                border: focusField === 'ageGroup' ? '2px solid #800000' : '1.5px solid #d1d5db',
                borderRadius: 6,
                fontSize: '1rem',
                outline: 'none',
                transition: 'border 0.2s',
                fontWeight: 500,
                background: '#fff',
              }}
            >
              <option value="">Select Age Group</option>
              <option value="upto 10">Upto 10</option>
              <option value="11-16">11 - 16</option>
              <option value="17-25">17 - 25</option>
              <option value="25+">25 +</option>
            </select>
          </div>
          {/* Type of Painting (Radio) */}
          <div style={{ marginBottom: 18, display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: 6, fontWeight: 600, color: '#333' }}>Type of Painting*</label>
            <div style={{ display: 'flex', gap: '2rem', margin: '0.5rem 0 0.5rem 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <input
                  type="radio"
                  name="paintingType"
                  value="Drawing Paper"
                  checked={formData.paintingType === 'Drawing Paper'}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                /> Drawing Paper
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <input
                  type="radio"
                  name="paintingType"
                  value="Canvas"
                  checked={formData.paintingType === 'Canvas'}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                /> Canvas
              </label>
            </div>
          </div>
          {submitError && (
            <div
              style={{
                background: '#e8f5e9',
                border: '1px solid #b71c1c',
                borderRadius: '12px',
                color: '#b71c1c',
                fontWeight: 600,
                fontSize: '1.1rem',
                padding: '1rem 1.5rem',
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              {submitError}
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px 0',
              background: isSubmitting ? '#aaa' : '#800000',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: '1.1rem',
              fontWeight: 700,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginTop: 10,
              transition: 'background 0.2s',
              letterSpacing: '0.5px',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      )}
    </>
  );
};

export default PaintingCompitationRSSM; 