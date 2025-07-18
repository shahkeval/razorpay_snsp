import React, { useState, useEffect } from "react";
import axios from "axios";
import imageCompression from 'browser-image-compression';

const YatrikForm2025 = ({ event, onComplete }) => {
  // State
  const [yatraRegistrationData, setYatraRegistrationData] = useState({
    fullName: "",
    email: "",
    education: "",
    religiousEducation: "",
    phone: "",
    whatsappNumber: "",
    address: "",
    city: "",
    state: "",
    weight: "",
    height: "",
    dateOfBirth: "",
    progress: 0,
    familyMemberName: "",
    familyMemberRelation: "",
    familyMemberWhatsapp: "",
    emergencyNumber: "",
    done7YatraEarlier: "",
    howManyTimes: "",
    howToReachPalitana: "",
    yatrikConfirmation: "",
    familyConfirmation: "",
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [yatrikPhotoPreview, setYatrikPhotoPreview] = useState(null);
  const [captchaValue, setCaptchaValue] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());
  const [captchaInput, setCaptchaInput] = useState("");
  const [paymentThankYou, setPaymentThankYou] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [paymentError, setPaymentError] = useState("");
  const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false);
  const [paymentLinkError, setPaymentLinkError] = useState("");
  const [yatrikErrors, setYatrikErrors] = useState({});

  // Data
  const states = require("../data/IN-states.json");
  const cities = require("../data/IN-cities.json");
  const filteredCities = cities.filter((city) => city.stateCode === yatraRegistrationData.state);

  // Overlay style
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(255,255,255,0.85)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Effects (e.g., for Razorpay script, localStorage, etc.)
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('yatrikRegistrationData', JSON.stringify(yatraRegistrationData));
  }, [yatraRegistrationData]);
  useEffect(() => {
    if (yatraRegistrationData.yatrikPhoto) {
      localStorage.setItem('yatrikPhoto', yatraRegistrationData.yatrikPhoto);
    }
  }, [yatraRegistrationData.yatrikPhoto]);

  // Handlers
  const validateField = (name, value, allValues = {}) => {
    let error = '';
    if (["phone", "whatsappNumber", "familyMemberWhatsapp", "emergencyNumber"].includes(name)) {
      if (!/^[0-9]{0,10}$/.test(value)) error = 'Only digits allowed';
      else if (value.length !== 10) error = 'Must be exactly 10 digits';
    }
    if (name === "email") {
      if (!/^\S+@\S+\.\S+$/.test(value)) error = 'Invalid email address';
    }
    if (["weight", "height"].includes(name)) {
      if (!/^[0-9]*$/.test(value)) error = 'Only positive numbers allowed';
      else if (value === '' || parseInt(value) <= 0) error = 'Must be a positive number';
    }
    if (name === "address") {
      if (value.length > 255) error = 'Address cannot exceed 255 characters';
    }
    if (name === "yatrikConfirmation" || name === "familyConfirmation") {
      if (allValues.yatrikConfirmation !== 'yes' || allValues.familyConfirmation !== 'yes') {
        error = 'Both confirmations must be Yes';
      }
    }
    return error;
  };
  const handleYatraRegistrationChange = (e) => {
    const { name, value } = e.target;
    let fieldValue = value;
    // For mobile fields, allow only digits and max 10
    if (["phone", "whatsappNumber", "familyMemberWhatsapp", "emergencyNumber"].includes(name)) {
      fieldValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    }
    // For weight/height, allow only positive numbers
    if (["weight", "height"].includes(name)) {
      fieldValue = value.replace(/[^0-9]/g, '');
    }
    // For address, limit to 255 chars
    if (name === "address") {
      fieldValue = value.slice(0, 255);
    }
    setYatraRegistrationData((prev) => ({ ...prev, [name]: fieldValue }));
    setYatrikErrors((prev) => ({ ...prev, [name]: validateField(name, fieldValue, { ...yatraRegistrationData, [name]: fieldValue }) }));
  };
  const validateStep = (step) => {
    let errors = {};
    if (step === 1) {
      ["yatrikPhoto", "fullName", "phone", "whatsappNumber"].forEach((f) => {
        const err = validateField(f, yatraRegistrationData[f] || '');
        if (err) errors[f] = err;
      });
    }
    if (step === 2) {
      ["email", "education", "religiousEducation", "weight", "height", "dateOfBirth", "address", "state", "city"].forEach((f) => {
        const err = validateField(f, yatraRegistrationData[f] || '');
        if (err) errors[f] = err;
      });
    }
    if (step === 3) {
      ["familyMemberName", "familyMemberRelation", "familyMemberWhatsapp", "emergencyNumber"].forEach((f) => {
        const err = validateField(f, yatraRegistrationData[f] || '');
        if (err) errors[f] = err;
      });
    }
    if (step === 4) {
      ["yatrikConfirmation", "familyConfirmation"].forEach((f) => {
        const err = validateField(f, yatraRegistrationData[f] || '', yatraRegistrationData);
        if (err) errors[f] = err;
      });
    }
    return errors;
  };
  const nextStep = (e) => {
    if (e) e.preventDefault();
    const errors = validateStep(currentStep);
    setYatrikErrors(errors);
    if (Object.values(errors).some(Boolean)) return;
    setCurrentStep((prev) => Math.min(prev + 1, 5));
    setYatraRegistrationData((prev) => ({ ...prev, progress: prev.progress + 25 }));
  };
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setYatraRegistrationData((prev) => ({ ...prev, progress: prev.progress - 25 }));
  };
  const handleAddAnotherResponse = () => {
    setPaymentThankYou(false);
    setCurrentStep(1);
    setYatraRegistrationData({
      fullName: "",
      email: "",
      education: "",
      religiousEducation: "",
      phone: "",
      whatsappNumber: "",
      address: "",
      city: "",
      state: "",
      weight: "",
      height: "",
      dateOfBirth: "",
      progress: 0,
      familyMemberName: "",
      familyMemberRelation: "",
      familyMemberWhatsapp: "",
      emergencyNumber: "",
      done7YatraEarlier: "",
      howManyTimes: "",
      howToReachPalitana: "",
      yatrikConfirmation: "",
      familyConfirmation: "",
    });
    setYatrikPhotoPreview(null);
    setCaptchaValue(Math.random().toString(36).substring(2, 8).toUpperCase());
    setCaptchaInput("");
    setPaymentStatus("idle");
    setPaymentError("");
    setIsSubmittingRegistration(false);
    setPaymentLinkError("");
    if (onComplete) onComplete();
  };
  const handlePayNow = async (e) => {
    e.preventDefault();
    // Check for image presence and validity
    if (!yatraRegistrationData.yatrikPhoto || !yatraRegistrationData.yatrikPhoto.startsWith('data:image/')) {
      alert('Please select and upload a valid Yatrik photo.');
      setIsSubmittingRegistration(false);
      return;
    }
    setIsSubmittingRegistration(true);
    try {
      const formData = new FormData();
      formData.append('yatrikPhoto', yatraRegistrationData.yatrikPhoto);
      formData.append('name', yatraRegistrationData.fullName);
      formData.append('mobileNumber', yatraRegistrationData.phone);
      formData.append('whatsappNumber', yatraRegistrationData.whatsappNumber);
      formData.append('emailAddress', yatraRegistrationData.email);
      formData.append('education', yatraRegistrationData.education);
      formData.append('religiousEducation', yatraRegistrationData.religiousEducation);
      formData.append('weight', yatraRegistrationData.weight);
      formData.append('height', yatraRegistrationData.height);
      formData.append('dob', yatraRegistrationData.dateOfBirth);
      formData.append('address', yatraRegistrationData.address);
      formData.append('city', yatraRegistrationData.city);
      formData.append('state', yatraRegistrationData.state);
      formData.append('familyMemberName', yatraRegistrationData.familyMemberName);
      formData.append('relation', yatraRegistrationData.familyMemberRelation);
      formData.append('familyMemberWANumber', yatraRegistrationData.familyMemberWhatsapp);
      formData.append('emergencyNumber', yatraRegistrationData.emergencyNumber);
      formData.append('is7YatraDoneEarlier', yatraRegistrationData.done7YatraEarlier);
      formData.append('earlier7YatraCounts', yatraRegistrationData.howManyTimes);
      formData.append('howToReachPalitana', yatraRegistrationData.howToReachPalitana);
      formData.append('yatrikConfirmation', yatraRegistrationData.yatrikConfirmation);
      formData.append('familyConfirmation', yatraRegistrationData.familyConfirmation);
      // Send to backend to create payment link
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
      const res = await axios.post(`${API_BASE_URL}/api/yatriks/create-payment-link`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const { paymentLink, yatrikNo, orderId } = res.data;
      sessionStorage.setItem('yatrikNo', yatrikNo);
      sessionStorage.setItem('orderId', orderId);
      // window.open(paymentLink, '_blank');
      window.location.href = paymentLink;
    } catch (err) {
      alert('Failed to initiate payment. Please try again.');
      setIsSubmittingRegistration(false);
    }
  };

  return (
    <div>
      {/* Back arrow to go back to radio selection */}
      <button
        type="button"
        onClick={() => {
          // Call onComplete to go back to registration type selection
          if (onComplete) onComplete();
        }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          marginBottom: "0.5rem",
          fontSize: "1.5rem",
          color: "#800000",
          display: "flex",
          alignItems: "center",
        }}
        aria-label="Back to registration type selection"
      >
        <span
          style={{
            fontSize: "2rem",
            marginRight: "0.5rem",
            lineHeight: 1,
          }}
        >
          &larr;
        </span>
        <span style={{ fontSize: "1rem", fontWeight: 500 }}></span>
      </button>
      <h2>Yatrik Registration</h2>
      <div className="progress-bar">
        <div
          className="progress"
          style={{
            width: `${paymentThankYou ? 100 : ((currentStep - 1) / 5) * 100}%`,
          }}
        ></div>
      </div>
      {currentStep === 1 && (
        <form onSubmit={nextStep}>
          <div className="form-group">
            <label htmlFor="yatrikPhoto">Yatrik Profile Photo*</label>
            <input
              type="file"
              id="yatrikPhoto"
              name="yatrikPhoto"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  try {
                    const options = {
                      maxSizeMB: 1,
                      maxWidthOrHeight: 1920,
                      useWebWorker: true,
                    };
                    const compressedFile = await imageCompression(file, options);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64String = reader.result;
                      setYatraRegistrationData((prev) => ({ ...prev, yatrikPhoto: base64String }));
                      setYatrikPhotoPreview(base64String);
                    };
                    reader.readAsDataURL(compressedFile);
                  } catch (err) {
                    alert('Image compression failed. Please try another image.');
                  }
                }
              }}
              required
            />
            {yatrikErrors.yatrikPhoto && <div className="error-message">{yatrikErrors.yatrikPhoto}</div>}
          </div>
          {yatrikPhotoPreview && (
            <img
              src={yatrikPhotoPreview}
              alt="Yatrik Preview"
              style={{ width: "100px", height: "100px", marginTop: "10px" }}
            />
          )}
          <div className="form-group">
            <label htmlFor="yatrikName">Yatrik Name*</label>
            <input
              type="text"
              id="yatrikName"
              name="yatrikName"
              value={yatraRegistrationData.fullName}
              onChange={(e) =>
                setYatraRegistrationData({
                  ...yatraRegistrationData,
                  fullName: e.target.value,
                })
              }
              required
            />
            {yatrikErrors.fullName && <div className="error-message">{yatrikErrors.fullName}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="mobileNumber">Mobile Number*</label>
            <input
              type="tel"
              id="mobileNumber"
              name="phone"
              value={yatraRegistrationData.phone}
              onChange={handleYatraRegistrationChange}
              required
            />
            {yatrikErrors.phone && <div className="error-message">{yatrikErrors.phone}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="whatsappNumber">WhatsApp Number*</label>
            <input
              type="tel"
              id="whatsappNumber"
              name="whatsappNumber"
              value={yatraRegistrationData.whatsappNumber}
              onChange={handleYatraRegistrationChange}
              required
            />
            {yatrikErrors.whatsappNumber && <div className="error-message">{yatrikErrors.whatsappNumber}</div>}
          </div>
          <button type="submit" className="next-button">
            Next
          </button>
        </form>
      )}
      {currentStep === 2 && (
        <form onSubmit={nextStep}>
          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={yatraRegistrationData.email}
              onChange={handleYatraRegistrationChange}
              required
            />
            {yatrikErrors.email && <div className="error-message">{yatrikErrors.email}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="education">Education*</label>
            <input
              type="text"
              id="education"
              name="education"
              value={yatraRegistrationData.education}
              onChange={handleYatraRegistrationChange}
              required
            />
            {yatrikErrors.education && <div className="error-message">{yatrikErrors.education}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="religiousEducation">Religious Education*</label>
            <input
              type="text"
              id="religiousEducation"
              name="religiousEducation"
              value={yatraRegistrationData.religiousEducation}
              onChange={handleYatraRegistrationChange}
              required
            />
            {yatrikErrors.religiousEducation && <div className="error-message">{yatrikErrors.religiousEducation}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="weight">Weight (in kg)*</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={yatraRegistrationData.weight}
              onChange={handleYatraRegistrationChange}
              required
            />
            {yatrikErrors.weight && <div className="error-message">{yatrikErrors.weight}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="height">Height (in cm)*</label>
            <input
              type="number"
              id="height"
              name="height"
              value={yatraRegistrationData.height}
              onChange={handleYatraRegistrationChange}
              required
            />
            {yatrikErrors.height && <div className="error-message">{yatrikErrors.height}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth*</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={yatraRegistrationData.dateOfBirth}
              onChange={(e) =>
                setYatraRegistrationData({
                  ...yatraRegistrationData,
                  dateOfBirth: e.target.value,
                })
              }
              required
            />
            {yatrikErrors.dateOfBirth && <div className="error-message">{yatrikErrors.dateOfBirth}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="address">Address*</label>
            <input
              type="text"
              id="address"
              name="address"
              value={yatraRegistrationData.address}
              onChange={handleYatraRegistrationChange}
              required
            />
            <div style={{ fontSize: '0.85rem', color: '#888', marginTop: 2, marginBottom: 0, textAlign: 'left', paddingLeft: 2 }}>
              {yatraRegistrationData.address.length} / 255 characters
            </div>
            {yatrikErrors.address && <div className="error-message">{yatrikErrors.address}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="state">State*</label>
            <select
              id="state"
              name="state"
              value={yatraRegistrationData.state}
              onChange={(e) => {
                setYatraRegistrationData({
                  ...yatraRegistrationData,
                  state: e.target.value,
                });
              }}
              required
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state.isoCode} value={state.isoCode}>
                  {state.name}
                </option>
              ))}
            </select>
            {yatrikErrors.state && <div className="error-message">{yatrikErrors.state}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="city">City*</label>
            <select
              id="city"
              name="city"
              value={yatraRegistrationData.city}
              onChange={(e) =>
                setYatraRegistrationData({
                  ...yatraRegistrationData,
                  city: e.target.value,
                })
              }
              required
            >
              <option value="">Select City</option>
              {filteredCities.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
            {yatrikErrors.city && <div className="error-message">{yatrikErrors.city}</div>}
          </div>
          <button type="button" className="back-button-yatra" onClick={prevStep}>
            Back
          </button>
          <button type="submit" className="next-button">
            Next
          </button>
        </form>
      )}
      {currentStep === 3 && (
        <form onSubmit={nextStep}>
          <h3 style={{ marginTop: "2rem", marginBottom: "1rem" }}>Family Details</h3>
          <div className="form-group">
            <label htmlFor="familyMemberName">Family Member Name*</label>
            <input
              type="text"
              id="familyMemberName"
              name="familyMemberName"
              value={yatraRegistrationData.familyMemberName}
              onChange={handleYatraRegistrationChange}
              required
            />
            {yatrikErrors.familyMemberName && <div className="error-message">{yatrikErrors.familyMemberName}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="familyMemberRelation">Relation*</label>
            <input
              type="text"
              id="familyMemberRelation"
              name="familyMemberRelation"
              value={yatraRegistrationData.familyMemberRelation}
              onChange={handleYatraRegistrationChange}
              required
            />
            {yatrikErrors.familyMemberRelation && <div className="error-message">{yatrikErrors.familyMemberRelation}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="familyMemberWhatsapp">Family Member WhatsApp Number*</label>
            <input
              type="tel"
              id="familyMemberWhatsapp"
              name="familyMemberWhatsapp"
              value={yatraRegistrationData.familyMemberWhatsapp}
              onChange={handleYatraRegistrationChange}
              required
            />
            {yatrikErrors.familyMemberWhatsapp && <div className="error-message">{yatrikErrors.familyMemberWhatsapp}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="emergencyNumber">Emergency Number*</label>
            <input
              type="tel"
              id="emergencyNumber"
              name="emergencyNumber"
              value={yatraRegistrationData.emergencyNumber}
              onChange={handleYatraRegistrationChange}
              required
            />
            {yatrikErrors.emergencyNumber && <div className="error-message">{yatrikErrors.emergencyNumber}</div>}
          </div>
          <button type="button" className="back-button-yatra" onClick={prevStep}>
            Back
          </button>
          <button type="submit" className="next-button">
            Next
          </button>
        </form>
      )}
      {currentStep === 4 && (
        <form onSubmit={nextStep}>
          <div className="form-group">
            <label>Have you done 7 Yatra earlier?</label>
            <div style={{ display: "flex", gap: "2rem", margin: "0.5rem 0 1rem 0" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input
                  type="radio"
                  name="done7YatraEarlier"
                  value="yes"
                  checked={yatraRegistrationData.done7YatraEarlier === "yes"}
                  onChange={handleYatraRegistrationChange}
                  required
                />{" "}
                Yes
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input
                  type="radio"
                  name="done7YatraEarlier"
                  value="no"
                  checked={yatraRegistrationData.done7YatraEarlier === "no"}
                  onChange={handleYatraRegistrationChange}
                  required
                />{" "}
                No
              </label>
            </div>
            {yatrikErrors.done7YatraEarlier && <div className="error-message">{yatrikErrors.done7YatraEarlier}</div>}
          </div>
          {yatraRegistrationData.done7YatraEarlier === "yes" && (
            <div className="form-group">
              <label htmlFor="howManyTimes">How many times?</label>
              <input
                type="number"
                id="howManyTimes"
                name="howManyTimes"
                value={yatraRegistrationData.howManyTimes}
                onChange={handleYatraRegistrationChange}
                min="1"
                required
              />
              {yatrikErrors.howManyTimes && <div className="error-message">{yatrikErrors.howManyTimes}</div>}
            </div>
          )}
          <div className="form-group">
            <label>How to reach Palitana?</label>
            <div style={{ display: "flex", gap: "2rem", margin: "0.5rem 0 1rem 0" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input
                  type="radio"
                  name="howToReachPalitana"
                  value="with_us"
                  checked={yatraRegistrationData.howToReachPalitana === "with_us"}
                  onChange={handleYatraRegistrationChange}
                  required
                />{" "}
                With Us
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input
                  type="radio"
                  name="howToReachPalitana"
                  value="direct_palitana"
                  checked={yatraRegistrationData.howToReachPalitana === "direct_palitana"}
                  onChange={handleYatraRegistrationChange}
                  required
                />{" "}
                Direct Palitana
              </label>
            </div>
            {yatrikErrors.howToReachPalitana && <div className="error-message">{yatrikErrors.howToReachPalitana}</div>}
          </div>
          {/* Yatrik Confirmation radio group */}
          <div className="form-group">
            <label>Yatrik Confirmation</label>
            <div style={{ display: "flex", gap: "2rem", margin: "0.5rem 0 1rem 0" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input
                  type="radio"
                  name="yatrikConfirmation"
                  value="yes"
                  checked={yatraRegistrationData.yatrikConfirmation === "yes"}
                  onChange={handleYatraRegistrationChange}
                  required
                /> Yes
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input
                  type="radio"
                  name="yatrikConfirmation"
                  value="no"
                  checked={yatraRegistrationData.yatrikConfirmation === "no"}
                  onChange={handleYatraRegistrationChange}
                  required
                /> No
              </label>
            </div>
            {yatraRegistrationData.yatrikConfirmation !== 'yes' && <div className="error-message">Yatrik Confirmation is required.</div>}
          </div>
          {/* Family Confirmation radio group */}
          <div className="form-group">
            <label>Family Confirmation</label>
            <div style={{ display: "flex", gap: "2rem", margin: "0.5rem 0 1rem 0" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input
                  type="radio"
                  name="familyConfirmation"
                  value="yes"
                  checked={yatraRegistrationData.familyConfirmation === "yes"}
                  onChange={handleYatraRegistrationChange}
                  required
                /> Yes
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input
                  type="radio"
                  name="familyConfirmation"
                  value="no"
                  checked={yatraRegistrationData.familyConfirmation === "no"}
                  onChange={handleYatraRegistrationChange}
                  required
                /> No
              </label>
            </div>
            {yatraRegistrationData.familyConfirmation !== 'yes' && <div className="error-message">Family Confirmation is required.</div>}
          </div>
          <div
            style={{
              background: "#fff3cd",
              color: "#856404",
              border: "1px solid #ffeeba",
              borderRadius: "8px",
              padding: "1rem",
              margin: "1.5rem 0",
              fontWeight: "bold",
              fontSize: "1.1rem",
              lineHeight: "1.6",
              textAlign: "justify",
            }}
          >
            <span style={{ textDecoration: "underline", fontWeight: "bold" }}>
              नियम और शर्तें
            </span>
            <br />
            मैं अपनी इच्छा और मर्जी से शत्रुंजय गिरिराज की चौवीयार छठ करके सात यात्रा करने के लिए के आपके आयोजन में आने के लिए सहमत हूं. यात्रा के दौरान कोईभी मेडीकल आपत्ति आने पर उनकी जिम्मेदारी मेरी खुद की रहेगी. जो मुझे और मेरे परिवार को मंजूर है.
          </div>
          <button type="button" className="back-button-yatra" onClick={prevStep}>
            Back
          </button>
          <button type="submit" className="next-button">
            Next
          </button>
        </form>
      )}
      {currentStep === 5 && (
        <>
          {/* Loader Overlay (keep as overlay) */}
          {paymentStatus === "verifying" && !paymentThankYou && (
            <div style={overlayStyle}>
              <div
                className="payment-loader-message"
                style={{
                  color: "#075e54",
                  fontWeight: 600,
                  fontSize: "1.2rem",
                  background: "#e3f2fd",
                  borderRadius: 12,
                  padding: "2rem 2.5rem",
                  textAlign: "center",
                  boxShadow: "0 2px 8px rgba(7,94,84,0.07)",
                }}
              >
                <span className="loader" style={{ marginRight: 12, verticalAlign: "middle" }}></span>
                We are checking your payment, please wait for confirmation...
              </div>
            </div>
          )}
          {/* Thank You Message (in form area) */}
          {paymentThankYou && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "300px",
                padding: "2rem 1rem",
              }}
            >
              <div
                style={{
                  background: "#e8f5e9",
                  border: "1px solid #43a047",
                  borderRadius: "12px",
                  padding: "2rem 2.5rem",
                  textAlign: "center",
                  boxShadow: "0 2px 8px rgba(67,160,71,0.07)",
                }}
              >
                <div style={{ fontSize: "2rem", color: "#43a047", marginBottom: "1rem" }}>&#10003;</div>
                <h2 style={{ color: "#2e7d32", marginBottom: "0.5rem" }}>Thank you for your registration!</h2>
                <div style={{ fontSize: "1.1rem", color: "#333", marginBottom: "1.5rem" }}>
                  We have received your payment and details.<br />We will contact you with more information soon.
                </div>
                <button
                  onClick={handleAddAnotherResponse}
                  style={{
                    background: "#43a047",
                    color: "white",
                    border: "none",
                    borderRadius: "25px",
                    padding: "0.8rem 1.5rem",
                    fontWeight: 600,
                    fontSize: "1rem",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  Add Another Response
                </button>
              </div>
            </div>
          )}
          {/* Error Message (in form area, not overlay) */}
          {paymentStatus === "error" && !paymentThankYou && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "300px",
                padding: "2rem 1rem",
              }}
            >
              <div
                style={{
                  background: "#e8f5e9",
                  border: "1px solid #43a047",
                  borderRadius: "12px",
                  padding: "2rem 2.5rem",
                  textAlign: "center",
                  boxShadow: "0 2px 8px rgba(67,160,71,0.07)",
                }}
              >
                <div style={{ fontSize: "2rem", color: "#43a047", marginBottom: "1rem" }}>&#10003;</div>
                <h2 style={{ color: "#b71c1c", marginBottom: "0.5rem", fontSize: "2rem", fontWeight: 700 }}>Payment Failed</h2>
                <div style={{ fontSize: "1.1rem", color: "#b71c1c", marginBottom: "1.5rem", fontWeight: 500 }}>
                  {paymentError || "Payment verification failed. Please contact support."}
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
                  <button
                    onClick={() => {
                      setPaymentStatus("idle");
                      setPaymentError("");
                    }}
                    style={{
                      background: "#e53935",
                      color: "white",
                      border: "none",
                      borderRadius: "25px",
                      padding: "0.8rem 1.5rem",
                      fontWeight: 600,
                      fontSize: "1rem",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                  >
                    Try Again
                  </button>
                  <button
                    onClick={prevStep}
                    style={{
                      background: "#fff",
                      color: "#e53935",
                      border: "1.5px solid #e53935",
                      borderRadius: "25px",
                      padding: "0.8rem 1.5rem",
                      fontWeight: 600,
                      fontSize: "1rem",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Show form only if not loading, not error, not thank you */}
          {!paymentThankYou && paymentStatus !== "verifying" && paymentStatus !== "error" && (
            <div>
              <h3 style={{ marginTop: "2rem", marginBottom: "1rem", textAlign: "center" }}>
                Registration Payment
              </h3>
              <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "1.2rem", marginBottom: "1rem" }}>
                To register for this event, you need to pay a registration fee of Rs. 500.00/-
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem" }}>
                <button
                  type="button"
                  className="next-button"
                  disabled={isSubmittingRegistration}
                  onClick={handlePayNow}
                  style={{
                    background: "#800000",
                    color: "white",
                    border: "none",
                    borderRadius: "25px",
                    padding: "0.8rem 1.5rem",
                    fontWeight: 600,
                    fontSize: "1rem",
                    cursor: isSubmittingRegistration ? "not-allowed" : "pointer",
                    transition: "background 0.2s",
                    opacity: isSubmittingRegistration ? 0.7 : 1,
                  }}
                >
                  {isSubmittingRegistration ? "Processing..." : "Pay Now"}
                </button>
                {paymentStatus === "paid" && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", padding: "2rem 1rem" }}>
                    <div style={{ background: "#e8f5e9", border: "1px solid #43a047", borderRadius: "12px", padding: "2rem 2.5rem", textAlign: "center", boxShadow: "0 2px 8px rgba(67,160,71,0.07)" }}>
                      <div style={{ fontSize: "2rem", color: "#43a047", marginBottom: "1rem" }}>&#10003;</div>
                      <h2 style={{ color: "#2e7d32", marginBottom: "0.5rem" }}>Thank you for your registration!</h2>
                      <div style={{ fontSize: "1.1rem", color: "#333", marginBottom: "1.5rem" }}>
                        We have received your payment and details.<br />We will contact you with more information soon.
                      </div>
                      <button onClick={handleAddAnotherResponse} style={{ background: "#43a047", color: "white", border: "none", borderRadius: "25px", padding: "0.8rem 1.5rem", fontWeight: 600, fontSize: "1rem", cursor: "pointer", transition: "background 0.2s" }}>
                        Add Another Response
                      </button>
                    </div>
                  </div>
                )}
                {paymentLinkError && <div style={{ color: "red", marginTop: 8 }}>{paymentLinkError}</div>}
                <div style={{ marginTop: 12, color: "#333", fontSize: "1.05rem", textAlign: "center" }}>
                  <b>Total to pay: ₹500</b>
                </div>
                <div style={{ marginTop: "1rem", color: "#888", fontSize: "0.95rem", textAlign: "center" }}>
                  You will be redirected to Razorpay to complete your payment securely.
                </div>
              </div>
              <button
                type="button"
                className="back-button-yatra"
                onClick={prevStep}
                disabled={isSubmittingRegistration}
              >
                Back
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default YatrikForm2025; 