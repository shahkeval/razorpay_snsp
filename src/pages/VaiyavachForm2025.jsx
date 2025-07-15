import React, { useState, useEffect } from "react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import imageCompression from 'browser-image-compression';

const VaiyavachForm2025 = ({ event, onComplete }) => {
  // State
  const [vaiyavachForm, setVaiyavachForm] = useState({
    vaiyavachiPhoto: null,
    vaiyavachiName: "keval",
    mobileNumber: "7383120787",
    whatsappNumber: "7383120787",
    email: "shahkeval7383@gmail.com",
    education: "demo",
    religiousEducation: "demo",
    weight: "15",
    height: "15",
    dateOfBirth: "2025-07-17T00:00:00.000Z", 
    address: "demojnj",
    state: "GJ",
    city: "Ahmedabad",
    familyMemberName: "kaushal",
    familyMemberRelation: "father",
    familyMemberWhatsapp: "7383120787",
    emergencyNumber: "7383120787",
    done7YatraEarlier: "yes",
    doneVaiyavachEarlier: "yes",
    howToReachPalitana: "with_us",
    howManyDaysJoin: "2",
    typeOfVaiyavach: "spot",
    vaiyavachTypeValue: "2",
    vaiyavachiConfirmation: "yes",
    familyConfirmation: "yes",
    progress: 0,
  });
  const [vaiyavachCurrentStep, setVaiyavachCurrentStep] = useState(1);
  const [vaiyavachPhotoPreview, setVaiyavachPhotoPreview] = useState(null);
  const [vaiyavachTransactionNumber, setVaiyavachTransactionNumber] = useState("");
  const [vaiyavachCaptchaValue, setVaiyavachCaptchaValue] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());
  const [vaiyavachCaptchaInput, setVaiyavachCaptchaInput] = useState("");
  const [vaiyavachPaymentThankYou, setVaiyavachPaymentThankYou] = useState(false);
  // Add state for payment
  const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false);
  const [paymentLinkError, setPaymentLinkError] = useState("");
  const [vaiyavachErrors, setVaiyavachErrors] = useState({});
  const [typeValueCounts, setTypeValueCounts] = useState({});

  // Data
  const states = require("../data/IN-states.json");
  const cities = require("../data/IN-cities.json");
  const vaiyavachFilteredCities = cities.filter((city) => city.stateCode === vaiyavachForm.state);

  useEffect(() => {
    if (vaiyavachCurrentStep === 4) {
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/vaiyavach/type-value-counts`)
        .then(res => setTypeValueCounts(res.data || {}))
        .catch(() => setTypeValueCounts({}));
    }
  }, [vaiyavachCurrentStep]);

  // Handlers
  const validateField = (name, value) => {
    let error = '';
    if (["mobileNumber", "whatsappNumber", "familyMemberWhatsapp", "emergencyNumber"].includes(name)) {
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
    if (name === "dateOfBirth") {
      if (value) {
        const age = Math.floor((Date.now() - new Date(value)) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < 12) error = 'Age must be at least 12';
      }
    }
    if (name === "address") {
      if (value.length > 255) error = 'Address cannot exceed 255 characters';
    }
    return error;
  };
  const handleVaiyavachChange = async (e) => {
    const { name, value, files } = e.target;
    let fieldValue = value;
    if (files) {
      const file = files[0];
      try {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result;
          setVaiyavachForm((prev) => ({ ...prev, [name]: base64String }));
          setVaiyavachPhotoPreview(base64String);
        };
        reader.readAsDataURL(compressedFile);
      } catch (err) {
        alert('Image compression failed. Please try another image.');
      }
      return;
    }
    // For mobile fields, allow only digits and max 10
    if (["mobileNumber", "whatsappNumber", "familyMemberWhatsapp", "emergencyNumber"].includes(name)) {
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
    setVaiyavachForm((prev) => ({ ...prev, [name]: fieldValue }));
    setVaiyavachErrors((prev) => ({ ...prev, [name]: validateField(name, fieldValue) }));
  };
  const validateStep = (step) => {
    let errors = {};
    if (step === 1) {
      ["vaiyavachiPhoto", "vaiyavachiName", "mobileNumber", "whatsappNumber"].forEach((f) => {
        const err = validateField(f, vaiyavachForm[f] || '');
        if (err) errors[f] = err;
      });
    }
    if (step === 2) {
      ["email", "education", "religiousEducation", "weight", "height", "dateOfBirth", "address", "state", "city"].forEach((f) => {
        const err = validateField(f, vaiyavachForm[f] || '');
        if (err) errors[f] = err;
      });
    }
    if (step === 3) {
      ["familyMemberName", "familyMemberRelation", "familyMemberWhatsapp", "emergencyNumber"].forEach((f) => {
        const err = validateField(f, vaiyavachForm[f] || '');
        if (err) errors[f] = err;
      });
    }
    if (step === 4) {
      // No special validation, just required fields
    }
    return errors;
  };
  const vaiyavachNextStep = (e) => {
    e.preventDefault();
    const errors = validateStep(vaiyavachCurrentStep);
    setVaiyavachErrors(errors);
    if (Object.values(errors).some(Boolean)) return;
    setVaiyavachCurrentStep((prev) => Math.min(prev + 1, 5));
  };
  const vaiyavachPrevStep = () => {
    setVaiyavachCurrentStep((prev) => Math.max(prev - 1, 1));
  };
  const handleVaiyavachRegistrationSubmit = async (e) => {
    e.preventDefault();
    if (vaiyavachCaptchaInput !== vaiyavachCaptchaValue) {
      alert("Captcha does not match. Please try again.");
      setVaiyavachCaptchaValue(Math.random().toString(36).substring(2, 8).toUpperCase());
      setVaiyavachCaptchaInput("");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("vaiyavachiImage", vaiyavachForm.vaiyavachiPhoto);
      formData.append("name", vaiyavachForm.vaiyavachiName);
      formData.append("mobileNumber", vaiyavachForm.mobileNumber);
      formData.append("whatsappNumber", vaiyavachForm.whatsappNumber);
      formData.append("emailAddress", vaiyavachForm.email);
      formData.append("education", vaiyavachForm.education);
      formData.append("religiousEducation", vaiyavachForm.religiousEducation);
      formData.append("weight", vaiyavachForm.weight);
      formData.append("height", vaiyavachForm.height);
      formData.append("dob", vaiyavachForm.dateOfBirth);
      formData.append("address", vaiyavachForm.address);
      formData.append("state", vaiyavachForm.state);
      formData.append("city", vaiyavachForm.city);
      formData.append("familyMemberName", vaiyavachForm.familyMemberName);
      formData.append("relation", vaiyavachForm.familyMemberRelation);
      formData.append("familyMemberWANumber", vaiyavachForm.familyMemberWhatsapp);
      formData.append("emergencyNumber", vaiyavachForm.emergencyNumber);
      formData.append("is7YatraDoneEarlier", vaiyavachForm.done7YatraEarlier);
      formData.append("haveYouDoneVaiyavachEarlier", vaiyavachForm.doneVaiyavachEarlier);
      formData.append("howToReachPalitana", vaiyavachForm.howToReachPalitana);
      formData.append("howManyDaysJoin", vaiyavachForm.howManyDaysJoin);
      formData.append("typeOfVaiyavach", vaiyavachForm.typeOfVaiyavach);
      formData.append("valueOfVaiyavach", vaiyavachForm.vaiyavachTypeValue);
      formData.append("vaiyavachiConfirmation", vaiyavachForm.vaiyavachiConfirmation);
      formData.append("familyConfirmation", vaiyavachForm.familyConfirmation);
      formData.append("transactionNumber", vaiyavachTransactionNumber);
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/vaiyavach/createvaiyavachi`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setVaiyavachPaymentThankYou(true);
    } catch (err) {
      alert("Registration failed. Please try again.");
    }
  };

  // Payment handler (step 5)
  const handlePayNow = async (e) => {
    e.preventDefault();
    setIsSubmittingRegistration(true);
    setPaymentLinkError("");
    try {
      const formData = new FormData();
      formData.append("vaiyavachiImage", vaiyavachForm.vaiyavachiPhoto);
      formData.append("name", vaiyavachForm.vaiyavachiName);
      formData.append("mobileNumber", vaiyavachForm.mobileNumber);
      formData.append("whatsappNumber", vaiyavachForm.whatsappNumber);
      formData.append("emailAddress", vaiyavachForm.email);
      formData.append("education", vaiyavachForm.education);
      formData.append("religiousEducation", vaiyavachForm.religiousEducation);
      formData.append("weight", vaiyavachForm.weight);
      formData.append("height", vaiyavachForm.height);
      formData.append("dob", vaiyavachForm.dateOfBirth);
      formData.append("address", vaiyavachForm.address);
      formData.append("state", vaiyavachForm.state);
      formData.append("city", vaiyavachForm.city);
      formData.append("familyMemberName", vaiyavachForm.familyMemberName);
      formData.append("relation", vaiyavachForm.familyMemberRelation);
      formData.append("familyMemberWANumber", vaiyavachForm.familyMemberWhatsapp);
      formData.append("emergencyNumber", vaiyavachForm.emergencyNumber);
      formData.append("is7YatraDoneEarlier", vaiyavachForm.done7YatraEarlier);
      formData.append("haveYouDoneVaiyavachEarlier", vaiyavachForm.doneVaiyavachEarlier);
      formData.append("howToReachPalitana", vaiyavachForm.howToReachPalitana);
      formData.append("howManyDaysJoin", vaiyavachForm.howManyDaysJoin);
      formData.append("typeOfVaiyavach", vaiyavachForm.typeOfVaiyavach);
      formData.append("valueOfVaiyavach", vaiyavachForm.vaiyavachTypeValue);
      formData.append("vaiyavachiConfirmation", vaiyavachForm.vaiyavachiConfirmation);
      formData.append("familyConfirmation", vaiyavachForm.familyConfirmation);
      // Send to backend to create payment link
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
      const res = await axios.post(`${API_BASE_URL}/api/vaiyavach/createvaiyavachpayment`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const { paymentLink, vaiyavachNo, orderId } = res.data;
      sessionStorage.setItem('vaiyavachNo', vaiyavachNo);
      sessionStorage.setItem('orderId', orderId);
      console.log(paymentLink)
      // window.open(paymentLink, '_blank');
      window.location.href = paymentLink;
    } catch (err) {
      console.error('Payment link error:', err);
      let errorMsg = 'Failed to initiate payment. Please try again.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMsg = err.response.data.message;
      }
      setPaymentLinkError(errorMsg);
      setIsSubmittingRegistration(false);
    }
  };

  // Return the full multi-step Vaiyavach registration form JSX (same as in EventDetails.jsx)
  // ... (Paste the JSX for the Vaiyavach form here, using the above state/handlers)
  return (
    <div>
      {/* Back arrow to go back to radio selection */}
      <button
        type="button"
        onClick={() => {
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
        <span style={{ fontSize: "2rem", marginRight: "0.5rem", lineHeight: 1 }}>&larr;</span>
        <span style={{ fontSize: "1rem", fontWeight: 500 }}></span>
      </button>
      <h2>Vaiyavach Registration</h2>
      <div className="progress-bar">
        <div
          className="progress"
          style={{
            width: `${vaiyavachPaymentThankYou ? 100 : ((vaiyavachCurrentStep - 1) / 5) * 100}%`,
          }}
        ></div>
      </div>
      {/* Step 1 */}
      {vaiyavachCurrentStep === 1 && (
        <form onSubmit={vaiyavachNextStep}>
          <div className="form-group">
            <label htmlFor="vaiyavachiPhoto">Vaiyavachi Profile Photo*</label>
            <input
              type="file"
              id="vaiyavachiPhoto"
              name="vaiyavachiPhoto"
              accept="image/*"
              onChange={handleVaiyavachChange}
              required
            />
            {vaiyavachErrors.vaiyavachiPhoto && <div className="error-message">{vaiyavachErrors.vaiyavachiPhoto}</div>}
          </div>
          {vaiyavachPhotoPreview && (
            <img
              src={vaiyavachPhotoPreview}
              alt="Vaiyavachi Preview"
              style={{ width: "100px", height: "100px", marginTop: "10px" }}
            />
          )}
          <div className="form-group">
            <label htmlFor="vaiyavachiName">Vaiyavachi Name*</label>
            <input
              type="text"
              id="vaiyavachiName"
              name="vaiyavachiName"
              value={vaiyavachForm.vaiyavachiName}
              onChange={handleVaiyavachChange}
              required
            />
            {vaiyavachErrors.vaiyavachiName && <div className="error-message">{vaiyavachErrors.vaiyavachiName}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="mobileNumber">Mobile Number*</label>
            <input
              type="tel"
              id="mobileNumber"
              name="mobileNumber"
              value={vaiyavachForm.mobileNumber}
              onChange={handleVaiyavachChange}
              required
            />
            {vaiyavachErrors.mobileNumber && <div className="error-message">{vaiyavachErrors.mobileNumber}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="whatsappNumber">WhatsApp Number*</label>
            <input
              type="tel"
              id="whatsappNumber"
              name="whatsappNumber"
              value={vaiyavachForm.whatsappNumber}
              onChange={handleVaiyavachChange}
              required
            />
            {vaiyavachErrors.whatsappNumber && <div className="error-message">{vaiyavachErrors.whatsappNumber}</div>}
          </div>
          <button type="submit" className="next-button">Next</button>
        </form>
      )}
      {/* Step 2 */}
      {vaiyavachCurrentStep === 2 && (
        <form onSubmit={vaiyavachNextStep}>
          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={vaiyavachForm.email}
              onChange={handleVaiyavachChange}
              required
            />
            {vaiyavachErrors.email && <div className="error-message">{vaiyavachErrors.email}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="education">Education*</label>
            <input
              type="text"
              id="education"
              name="education"
              value={vaiyavachForm.education}
              onChange={handleVaiyavachChange}
              required
            />
            {vaiyavachErrors.education && <div className="error-message">{vaiyavachErrors.education}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="religiousEducation">Religious Education*</label>
            <input
              type="text"
              id="religiousEducation"
              name="religiousEducation"
              value={vaiyavachForm.religiousEducation}
              onChange={handleVaiyavachChange}
              required
            />
            {vaiyavachErrors.religiousEducation && <div className="error-message">{vaiyavachErrors.religiousEducation}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="weight">Weight (in kg)*</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={vaiyavachForm.weight}
              onChange={handleVaiyavachChange}
              required
            />
            {vaiyavachErrors.weight && <div className="error-message">{vaiyavachErrors.weight}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="height">Height (in cm)*</label>
            <input
              type="number"
              id="height"
              name="height"
              value={vaiyavachForm.height}
              onChange={handleVaiyavachChange}
              required
            />
            {vaiyavachErrors.height && <div className="error-message">{vaiyavachErrors.height}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth*</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={vaiyavachForm.dateOfBirth}
              onChange={handleVaiyavachChange}
              required
            />
            {vaiyavachErrors.dateOfBirth && <div className="error-message">{vaiyavachErrors.dateOfBirth}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="address">Address*</label>
            <input
              type="text"
              id="address"
              name="address"
              value={vaiyavachForm.address}
              onChange={handleVaiyavachChange}
              required
            />
            {vaiyavachErrors.address && <div className="error-message">{vaiyavachErrors.address}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="state">State*</label>
            <select
              id="state"
              name="state"
              value={vaiyavachForm.state}
              onChange={handleVaiyavachChange}
              required
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state.isoCode} value={state.isoCode}>
                  {state.name}
                </option>
              ))}
            </select>
            {vaiyavachErrors.state && <div className="error-message">{vaiyavachErrors.state}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="city">City*</label>
            <select
              id="city"
              name="city"
              value={vaiyavachForm.city}
              onChange={handleVaiyavachChange}
              required
            >
              <option value="">Select City</option>
              {vaiyavachFilteredCities.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
            {vaiyavachErrors.city && <div className="error-message">{vaiyavachErrors.city}</div>}
          </div>
          <button type="button" className="back-button-yatra" onClick={vaiyavachPrevStep}>Back</button>
          <button type="submit" className="next-button">Next</button>
        </form>
      )}
      {/* Step 3 */}
      {vaiyavachCurrentStep === 3 && (
        <form onSubmit={vaiyavachNextStep}>
          <h3 style={{ marginTop: "2rem", marginBottom: "1rem" }}>Family Details</h3>
          <div className="form-group">
            <label htmlFor="familyMemberName">Family Member Name*</label>
            <input
              type="text"
              id="familyMemberName"
              name="familyMemberName"
              value={vaiyavachForm.familyMemberName}
              onChange={handleVaiyavachChange}
              required
            />
            {vaiyavachErrors.familyMemberName && <div className="error-message">{vaiyavachErrors.familyMemberName}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="familyMemberRelation">Relation*</label>
            <input
              type="text"
              id="familyMemberRelation"
              name="familyMemberRelation"
              value={vaiyavachForm.familyMemberRelation}
              onChange={handleVaiyavachChange}
              required
            />
            {vaiyavachErrors.familyMemberRelation && <div className="error-message">{vaiyavachErrors.familyMemberRelation}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="familyMemberWhatsapp">Family Member WhatsApp Number*</label>
            <input
              type="tel"
              id="familyMemberWhatsapp"
              name="familyMemberWhatsapp"
              value={vaiyavachForm.familyMemberWhatsapp}
              onChange={handleVaiyavachChange}
              required
            />
            {vaiyavachErrors.familyMemberWhatsapp && <div className="error-message">{vaiyavachErrors.familyMemberWhatsapp}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="emergencyNumber">Emergency Number*</label>
            <input
              type="tel"
              id="emergencyNumber"
              name="emergencyNumber"
              value={vaiyavachForm.emergencyNumber}
              onChange={handleVaiyavachChange}
              required
            />
            {vaiyavachErrors.emergencyNumber && <div className="error-message">{vaiyavachErrors.emergencyNumber}</div>}
          </div>
          <button type="button" className="back-button-yatra" onClick={vaiyavachPrevStep}>Back</button>
          <button type="submit" className="next-button">Next</button>
        </form>
      )}
      {/* Step 4 */}
      {vaiyavachCurrentStep === 4 && (
        <form onSubmit={vaiyavachNextStep}>
          <div className="form-group">
            <label>Have you done 7 yatra earlier?</label>
            <div style={{ display: "flex", gap: "2rem", margin: "0.5rem 0 1rem 0" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input
                  type="radio"
                  name="done7YatraEarlier"
                  value="yes"
                  checked={vaiyavachForm.done7YatraEarlier === "yes"}
                  onChange={handleVaiyavachChange}
                  required
                />{" "}
                Yes
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input
                  type="radio"
                  name="done7YatraEarlier"
                  value="no"
                  checked={vaiyavachForm.done7YatraEarlier === "no"}
                  onChange={handleVaiyavachChange}
                  required
                />{" "}
                No
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>Have you done Vaiyavach earlier?</label>
            <div style={{ display: "flex", gap: "2rem", margin: "0.5rem 0 1rem 0" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input
                  type="radio"
                  name="doneVaiyavachEarlier"
                  value="yes"
                  checked={vaiyavachForm.doneVaiyavachEarlier === "yes"}
                  onChange={handleVaiyavachChange}
                  required
                />{" "}
                Yes
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input
                  type="radio"
                  name="doneVaiyavachEarlier"
                  value="no"
                  checked={vaiyavachForm.doneVaiyavachEarlier === "no"}
                  onChange={handleVaiyavachChange}
                  required
                />{" "}
                No
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>How to reach palitana?</label>
            <div style={{ display: "flex", gap: "2rem", margin: "0.5rem 0 1rem 0" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input
                  type="radio"
                  name="howToReachPalitana"
                  value="with_us"
                  checked={vaiyavachForm.howToReachPalitana === "with_us"}
                  onChange={handleVaiyavachChange}
                  required
                />{" "}
                With Us
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input
                  type="radio"
                  name="howToReachPalitana"
                  value="direct_palitana"
                  checked={vaiyavachForm.howToReachPalitana === "direct_palitana"}
                  onChange={handleVaiyavachChange}
                  required
                />{" "}
                Direct Palitana
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>How many days you join with us?</label>
            <div style={{ display: "flex", gap: "2rem", margin: "0.5rem 0 1rem 0" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input
                  type="radio"
                  name="howManyDaysJoin"
                  value="2"
                  checked={vaiyavachForm.howManyDaysJoin === "2"}
                  onChange={handleVaiyavachChange}
                  required
                />{" "}
                2 days
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input
                  type="radio"
                  name="howManyDaysJoin"
                  value="4"
                  checked={vaiyavachForm.howManyDaysJoin === "4"}
                  onChange={handleVaiyavachChange}
                  required
                />{" "}
                4 days
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>Which type of vaiyavach you do?</label>
            <div style={{ display: "flex", gap: "2rem", margin: "0.5rem 0 1rem 0" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input
                  type="radio"
                  name="typeOfVaiyavach"
                  value="spot"
                  checked={vaiyavachForm.typeOfVaiyavach === "spot"}
                  onChange={handleVaiyavachChange}
                  required
                />{" "}
                Spot
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input
                  type="radio"
                  name="typeOfVaiyavach"
                  value="roamming"
                  checked={vaiyavachForm.typeOfVaiyavach === "roamming"}
                  onChange={handleVaiyavachChange}
                  required
                />{" "}
                Roamming
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input
                  type="radio"
                  name="typeOfVaiyavach"
                  value="chaityavandan"
                  checked={vaiyavachForm.typeOfVaiyavach === "chaityavandan"}
                  onChange={handleVaiyavachChange}
                  required
                />{" "}
                Chaityavandan
              </label>
            </div>
          </div>
          {/* Conditional dropdown for vaiyavach type value */}
          {vaiyavachForm.typeOfVaiyavach === "spot" && (
            <div className="form-group">
              <label htmlFor="vaiyavachTypeValue">Spot</label>
              <select
                id="vaiyavachTypeValue"
                name="vaiyavachTypeValue"
                value={vaiyavachForm.vaiyavachTypeValue}
                onChange={handleVaiyavachChange}
                required
              >
                <option value="">Select</option>
                {[
                  { value: "સ્પોટ નંબર 1 : ધેટી ના પગલાં", label: "સ્પોટ નંબર 1 : ધેટી ના પગલાં" },
                  { value: "સ્પોટ નંબર 2", label: "સ્પોટ નંબર 2" },
                  { value: "સ્પોટ નંબર 3", label: "સ્પોટ નંબર 3" },
                  { value: "સ્પોટ નંબર 4", label: "સ્પોટ નંબર 4" },
                  { value: "સ્પોટ નંબર 5 : ખોડીયાર માતા ની પરબ", label: "સ્પોટ નંબર 5 : ખોડીયાર માતા ની પરબ" },
                  { value: "સ્પોટ નંબર 6", label: "સ્પોટ નંબર 6" },
                  { value: "સ્પોટ નંબર 7", label: "સ્પોટ નંબર 7" },
                  { value: "સ્પોટ નંબર 8", label: "સ્પોટ નંબર 8" },
                  { value: "સ્પોટ નંબર 9", label: "સ્પોટ નંબર 9" },
                  { value: "સ્પોટ નંબર 10 : રામપોળ (નવટુક જવાના રસ્તે)", label: "સ્પોટ નંબર 10 : રામપોળ (નવટુક જવાના રસ્તે)" },
                ].map(opt => {
                  const count = (typeValueCounts.spot && typeValueCounts.spot[opt.value]) || 0;
                  const remaining = 8 - count;
                  return (
                    <option key={opt.value} value={opt.value} disabled={remaining <= 0}>
                      {opt.label} {`(${remaining} seats left)`}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
          {vaiyavachForm.typeOfVaiyavach === "roamming" && (
            <div className="form-group">
              <label htmlFor="vaiyavachTypeValue">Roamming</label>
              <select
                id="vaiyavachTypeValue"
                name="vaiyavachTypeValue"
                value={vaiyavachForm.vaiyavachTypeValue}
                onChange={handleVaiyavachChange}
                required
              >
                <option value="">Select</option>
                {[
                  { value: "1-2", label: "1-2" },
                  { value: "2-3", label: "2-3" },
                  { value: "3-4", label: "3-4" },
                  { value: "4-5", label: "4-5" },
                  { value: "5-6", label: "5-6" },
                  { value: "6-7", label: "6-7" },
                  { value: "7-8", label: "7-8" },
                  { value: "8-9", label: "8-9" },
                  { value: "9-10", label: "9-10" },
                ].map(opt => {
                  const count = (typeValueCounts.roamming && typeValueCounts.roamming[opt.value]) || 0;
                  const remaining = 12 - count;
                  return (
                    <option key={opt.value} value={opt.value} disabled={remaining <= 0}>
                      {opt.label} {`(${remaining} seats left)`}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
          {vaiyavachForm.typeOfVaiyavach === "chaityavandan" && (
            <div className="form-group">
              <label htmlFor="vaiyavachTypeValue">Chaityavandan</label>
              <select
                id="vaiyavachTypeValue"
                name="vaiyavachTypeValue"
                value={vaiyavachForm.vaiyavachTypeValue}
                onChange={handleVaiyavachChange}
                required
              >
                <option value="">Select</option>
                {[
                  { value: "ચૈત્ય વંદન શ્રી આદિનાથ પ્રભુ ના રંગ મંડપમાં", label: "ચૈત્ય વંદન શ્રી આદિનાથ પ્રભુ ના રંગ મંડપમાં" },
                  { value: "ચૈત્ય વંદન શ્રી પુંડરીકસ્વામી ભગવાન પાસે", label: "ચૈત્ય વંદન શ્રી પુંડરીકસ્વામી ભગવાન પાસે" },
                  { value: "ચૈત્ય વંદન શ્રી રાયણ પગલાં", label: "ચૈત્ય વંદન શ્રી રાયણ પગલાં" },
                  { value: "ચૈત્ય વંદન શ્રી શાંતિનાથ ભગવાન", label: "ચૈત્ય વંદન શ્રી શાંતિનાથ ભગવાન" },
                  { value: "ચૈત્ય વંદન  ધેટી ના પગલે", label: "ચૈત્ય વંદન  ધેટી ના પગલે" },
                ].map(opt => {
                  const count = (typeValueCounts.chaityavandan && typeValueCounts.chaityavandan[opt.value]) || 0;
                  const remaining = 5 - count;
                  return (
                    <option key={opt.value} value={opt.value} disabled={remaining <= 0}>
                      {opt.label} {`(${remaining} seats left)`}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
          {/* Vaiyavachi Confirmation radio group */}
          <div className="form-group">
            <label>Vaiyavachi Confirmation</label>
            <div style={{ display: "flex", gap: "2rem", margin: "0.5rem 0 1rem 0" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input
                  type="radio"
                  name="vaiyavachiConfirmation"
                  value="yes"
                  checked={vaiyavachForm.vaiyavachiConfirmation === "yes"}
                  onChange={handleVaiyavachChange}
                  required
                /> Yes
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input
                  type="radio"
                  name="vaiyavachiConfirmation"
                  value="no"
                  checked={vaiyavachForm.vaiyavachiConfirmation === "no"}
                  onChange={handleVaiyavachChange}
                  required
                /> No
              </label>
            </div>
            {vaiyavachForm.vaiyavachiConfirmation !== 'yes' && <div className="error-message">Vaiyavachi Confirmation is required.</div>}
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
                  checked={vaiyavachForm.familyConfirmation === "yes"}
                  onChange={handleVaiyavachChange}
                  required
                /> Yes
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input
                  type="radio"
                  name="familyConfirmation"
                  value="no"
                  checked={vaiyavachForm.familyConfirmation === "no"}
                  onChange={handleVaiyavachChange}
                  required
                /> No
              </label>
            </div>
            {vaiyavachForm.familyConfirmation !== 'yes' && <div className="error-message">Family Confirmation is required.</div>}
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
          <button type="button" className="back-button-yatra" onClick={vaiyavachPrevStep}>Back</button>
          <button type="submit" className="next-button">Next</button>
        </form>
      )}
      {/* Step 5: Payment */}
      {vaiyavachCurrentStep === 5 && !vaiyavachPaymentThankYou && (
        <div>
          <h3 style={{ marginTop: "2rem", marginBottom: "1rem", textAlign: "center" }}>Registration Payment</h3>
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
            onClick={vaiyavachPrevStep}
            disabled={isSubmittingRegistration}
          >
            Back
          </button>
        </div>
      )}
      {/* Thank You Message */}
      {vaiyavachCurrentStep === 5 && vaiyavachPaymentThankYou && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", padding: "2rem 1rem" }}>
          <div style={{ background: "#e8f5e9", border: "1px solid #43a047", borderRadius: "12px", padding: "2rem 2.5rem", textAlign: "center", boxShadow: "0 2px 8px rgba(67,160,71,0.07)" }}>
            <div style={{ fontSize: "2rem", color: "#43a047", marginBottom: "1rem" }}>&#10003;</div>
            <h2 style={{ color: "#2e7d32", marginBottom: "0.5rem" }}>Thank you for your registration!</h2>
            <div style={{ fontSize: "1.1rem", color: "#333", marginBottom: "1.5rem" }}>
              We have received your payment and details.<br />We will contact you with more information soon.
            </div>
            <button
              onClick={() => {
                setVaiyavachCurrentStep(1);
                setVaiyavachForm({
                  vaiyavachiPhoto: null,
                  vaiyavachiName: "",
                  mobileNumber: "",
                  whatsappNumber: "",
                  email: "",
                  education: "",
                  religiousEducation: "",
                  weight: "",
                  height: "",
                  dateOfBirth: "",
                  address: "",
                  state: "",
                  city: "",
                  familyMemberName: "",
                  familyMemberRelation: "",
                  familyMemberWhatsapp: "",
                  emergencyNumber: "",
                  done7YatraEarlier: "",
                  doneVaiyavachEarlier: "",
                  howToReachPalitana: "",
                  howManyDaysJoin: "",
                  typeOfVaiyavach: "",
                  vaiyavachTypeValue: "",
                  vaiyavachiConfirmation: "",
                  familyConfirmation: "",
                  progress: 0,
                });
                setVaiyavachPhotoPreview(null);
                setVaiyavachTransactionNumber("");
                setVaiyavachCaptchaValue(Math.random().toString(36).substring(2, 8).toUpperCase());
                setVaiyavachCaptchaInput("");
                setVaiyavachPaymentThankYou(false);
                if (onComplete) onComplete();
              }}
              style={{ background: "#43a047", color: "white", border: "none", borderRadius: "25px", padding: "0.8rem 1.5rem", fontWeight: 600, fontSize: "1rem", cursor: "pointer", transition: "background 0.2s" }}
            >
              Add Another Response
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaiyavachForm2025; 