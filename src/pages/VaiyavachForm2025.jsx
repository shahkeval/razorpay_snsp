import React, { useState, useEffect } from "react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import imageCompression from 'browser-image-compression';
import { useLocation } from "react-router-dom";

const VaiyavachForm2025 = ({ event, onComplete }) => {
  // State
  const [vaiyavachForm, setVaiyavachForm] = useState({
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
  const [vaiyavachCurrentStep, setVaiyavachCurrentStep] = useState(1);
  const [vaiyavachPhotoPreview, setVaiyavachPhotoPreview] = useState(null);
  const [vaiyavachTransactionNumber, setVaiyavachTransactionNumber] = useState("");
  const [vaiyavachPaymentThankYou, setVaiyavachPaymentThankYou] = useState(false);
  const [vaiyavachErrors, setVaiyavachErrors] = useState({});
  const [vaiyavachTypeCounts, setVaiyavachTypeCounts] = useState({});
  const [loadingTypeCounts, setLoadingTypeCounts] = useState(false);
  const location = useLocation();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentError, setPaymentError] = useState("");
  const [polling, setPolling] = useState(false);
  const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false);
  const [paymentLinkError, setPaymentLinkError] = useState("");
  // Add state for payment polling
  const [paymentThankYou, setPaymentThankYou] = useState(false);

  // Extract vaiyavachiNo from URL if present
  // Remove: const query = new URLSearchParams(location.search); const vaiyavachiNoFromUrl = query.get("vaiyavachiNo");
  // Add state for payment polling
  // Remove the second declaration of paymentThankYou and setPaymentThankYou

  useEffect(() => {
    // Check for Razorpay payment params in URL (like Yatrik)
    const params = new URLSearchParams(location.search);
    const paymentLinkId = params.get('razorpay_payment_link_id');
    if (paymentLinkId) {
      setPaymentStatus('verifying');
      let pollCount = 0;
      const poll = setInterval(async () => {
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/vaiyavach/verifyPayment?orderId=${paymentLinkId}`);
          if (res.data.status === 'paid') {
            setPaymentStatus('paid');
            setPaymentThankYou(true);
            clearInterval(poll);
          } else if (pollCount > 15) { // Timeout after ~1min
            setPaymentStatus('error');
            setPaymentError('Payment verification failed. Please refresh or contact support.');
            clearInterval(poll);
          }
        } catch (err) {
          setPaymentStatus('error');
          setPaymentError('Payment verification failed. Please refresh or contact support.');
          clearInterval(poll);
        }
        pollCount++;
      }, 4000);
      return () => clearInterval(poll);
    }
  }, [location.search]);

  // Restore: Fetch type-counts on mount and when step 4 is reached
  useEffect(() => {
    if (vaiyavachCurrentStep === 4) {
      setLoadingTypeCounts(true);
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/vaiyavach/type-counts`)
        .then(res => {
          setVaiyavachTypeCounts(res.data || {});
        })
        .catch(() => setVaiyavachTypeCounts({}))
        .finally(() => setLoadingTypeCounts(false));
    }
  }, [vaiyavachCurrentStep]);

  // Data
  const states = require("../data/IN-states.json");
  const cities = require("../data/IN-cities.json");
  const vaiyavachFilteredCities = cities.filter((city) => city.stateCode === vaiyavachForm.state);

  // Handlers
  // Add per-step validation
  const validateStep = (step) => {
    let errors = {};
    if (step === 1) {
      // Step 1: Photo, Name, Mobile, WhatsApp
      if (!vaiyavachForm.vaiyavachiPhoto) errors.vaiyavachiPhoto = "Profile photo is required.";
      if (!vaiyavachForm.vaiyavachiName.trim()) errors.vaiyavachiName = "Name is required.";
      if (!vaiyavachForm.mobileNumber || vaiyavachForm.mobileNumber.length !== 10) errors.mobileNumber = "Must be exactly 10 digits.";
      if (!vaiyavachForm.whatsappNumber || vaiyavachForm.whatsappNumber.length !== 10) errors.whatsappNumber = "Must be exactly 10 digits.";
    } else if (step === 2) {
      // Step 2: Email, Education, Religious, Weight, Height, DOB, Address, State, City
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(vaiyavachForm.email)) errors.email = "Please enter a valid email address.";
      if (!vaiyavachForm.education.trim()) errors.education = "Education is required.";
      if (!vaiyavachForm.religiousEducation.trim()) errors.religiousEducation = "Religious education is required.";
      if (!vaiyavachForm.weight || isNaN(vaiyavachForm.weight) || parseInt(vaiyavachForm.weight) < 1) errors.weight = "Enter a valid positive number.";
      if (!vaiyavachForm.height || isNaN(vaiyavachForm.height) || parseInt(vaiyavachForm.height) < 1) errors.height = "Enter a valid positive number.";
      if (!vaiyavachForm.dateOfBirth) {
        errors.dateOfBirth = "Date of birth is required.";
      } else {
        const today = new Date();
        const dob = new Date(vaiyavachForm.dateOfBirth);
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        if (age <= 10) {
          errors.dateOfBirth = "Age must be greater than 10 years.";
        }
      }
      if (!vaiyavachForm.address || vaiyavachForm.address.length > 200) errors.address = "Address cannot exceed 200 characters.";
      if (!vaiyavachForm.state) errors.state = "State is required.";
      if (!vaiyavachForm.city) errors.city = "City is required.";
    } else if (step === 3) {
      // Step 3: Family details
      if (!vaiyavachForm.familyMemberName.trim()) errors.familyMemberName = "Family member name is required.";
      if (!vaiyavachForm.familyMemberRelation.trim()) errors.familyMemberRelation = "Relation is required.";
      if (!vaiyavachForm.familyMemberWhatsapp || vaiyavachForm.familyMemberWhatsapp.length !== 10) errors.familyMemberWhatsapp = "Must be exactly 10 digits.";
      if (!vaiyavachForm.emergencyNumber || vaiyavachForm.emergencyNumber.length !== 10) errors.emergencyNumber = "Must be exactly 10 digits.";
    } else if (step === 4) {
      // Step 4: Radio groups
      if (!vaiyavachForm.done7YatraEarlier) errors.done7YatraEarlier = "Required.";
      if (!vaiyavachForm.doneVaiyavachEarlier) errors.doneVaiyavachEarlier = "Required.";
      if (!vaiyavachForm.howToReachPalitana) errors.howToReachPalitana = "Required.";
      if (!vaiyavachForm.howManyDaysJoin) errors.howManyDaysJoin = "Required.";
      if (!vaiyavachForm.typeOfVaiyavach) errors.typeOfVaiyavach = "Required.";
      if (!vaiyavachForm.vaiyavachTypeValue) errors.vaiyavachTypeValue = "Required.";
      if (!vaiyavachForm.vaiyavachiConfirmation) errors.vaiyavachiConfirmation = "Required.";
      if (!vaiyavachForm.familyConfirmation) errors.familyConfirmation = "Required.";
    }
    setVaiyavachErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const vaiyavachNextStep = (e) => {
    e.preventDefault();
    if (validateStep(vaiyavachCurrentStep)) {
      setVaiyavachCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };
  const vaiyavachPrevStep = () => setVaiyavachCurrentStep((prev) => Math.max(prev - 1, 1));
  const handleVaiyavachChange = async (e) => {
    const { name, value, files, type } = e.target;
    let errors = { ...vaiyavachErrors };
    // Image size validation and compression
    if (name === "vaiyavachiPhoto" && files) {
      const file = files[0];
      if (file && file.size > 5 * 1024 * 1024) {
        errors.vaiyavachiPhoto = "Image size must be less than 5MB.";
        setVaiyavachErrors(errors);
        setVaiyavachPhotoPreview(null);
        setVaiyavachForm((prev) => ({ ...prev, [name]: null }));
        return;
      } else {
        delete errors.vaiyavachiPhoto;
        setVaiyavachErrors(errors);
        // Compress the image before converting to base64
        try {
          const compressedFile = await imageCompression(file, {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
          });
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result;
            setVaiyavachForm((prev) => ({ ...prev, [name]: base64String }));
            setVaiyavachPhotoPreview(base64String);
          };
          reader.readAsDataURL(compressedFile);
        } catch (err) {
          errors.vaiyavachiPhoto = "Image compression failed. Please try another image.";
          setVaiyavachErrors(errors);
          setVaiyavachPhotoPreview(null);
          setVaiyavachForm((prev) => ({ ...prev, [name]: null }));
        }
        return;
      }
    }
    // Mobile number validation
    if (["mobileNumber", "whatsappNumber", "familyMemberWhatsapp", "emergencyNumber"].includes(name)) {
      // Only allow digits
      const digitValue = value.replace(/\D/g, "").slice(0, 10);
      if (digitValue.length !== value.length) {
        errors[name] = "Only digits allowed.";
      } else {
        delete errors[name];
      }
      setVaiyavachErrors(errors);
      setVaiyavachForm((prev) => ({ ...prev, [name]: digitValue }));
      return;
    }
    // Height/Weight validation
    if (["height", "weight"].includes(name)) {
      let num = value.replace(/[^\d]/g, "");
      if (num === "" || parseInt(num) < 1) {
        errors[name] = "Enter a valid positive number.";
      } else {
        delete errors[name];
      }
      setVaiyavachErrors(errors);
      setVaiyavachForm((prev) => ({ ...prev, [name]: num }));
      return;
    }
    // Email validation (on blur)
    if (name === "email") {
      setVaiyavachForm((prev) => ({ ...prev, [name]: value }));
      // Don't validate on every keystroke
      return;
    }
    // Address length validation
    if (name === "address") {
      if (value.length > 200) {
        errors.address = "Address cannot exceed 200 characters.";
      } else {
        delete errors.address;
      }
      setVaiyavachErrors(errors);
      setVaiyavachForm((prev) => ({ ...prev, [name]: value.slice(0, 200) }));
      return;
    }
    // Date of Birth validation (age > 10)
    if (name === "dateOfBirth") {
      setVaiyavachForm((prev) => ({ ...prev, [name]: value }));
      if (value) {
        const today = new Date();
        const dob = new Date(value);
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        if (age <= 10) {
          errors.dateOfBirth = "Age must be greater than 10 years.";
        } else {
          delete errors.dateOfBirth;
        }
        setVaiyavachErrors(errors);
      }
      return;
    }
    // Default
    setVaiyavachForm((prev) => ({ ...prev, [name]: value }));
  };

  // Email validation on blur
  const handleEmailBlur = (e) => {
    const value = e.target.value;
    let errors = { ...vaiyavachErrors };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      errors.email = "Please enter a valid email address.";
    } else {
      delete errors.email;
    }
    setVaiyavachErrors(errors);
  };

  // Final validation before submit
  const validateBeforeSubmit = () => {
    let errors = {};
    // Image
    if (!vaiyavachForm.vaiyavachiPhoto) errors.vaiyavachiPhoto = "Profile photo is required.";
    // Mobile numbers
    ["mobileNumber", "whatsappNumber", "familyMemberWhatsapp", "emergencyNumber"].forEach((field) => {
      if (!vaiyavachForm[field] || vaiyavachForm[field].length !== 10) {
        errors[field] = "Must be exactly 10 digits.";
      }
    });
    // Height/Weight
    ["height", "weight"].forEach((field) => {
      if (!vaiyavachForm[field] || isNaN(vaiyavachForm[field]) || parseInt(vaiyavachForm[field]) < 1) {
        errors[field] = "Enter a valid positive number.";
      }
    });
    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(vaiyavachForm.email)) {
      errors.email = "Please enter a valid email address.";
    }
    // Address
    if (!vaiyavachForm.address || vaiyavachForm.address.length > 200) {
      errors.address = "Address cannot exceed 200 characters.";
    }
    // DOB
    if (vaiyavachForm.dateOfBirth) {
      const today = new Date();
      const dob = new Date(vaiyavachForm.dateOfBirth);
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      if (age <= 10) {
        errors.dateOfBirth = "Age must be greater than 10 years.";
      }
    } else {
      errors.dateOfBirth = "Date of birth is required.";
    }
    setVaiyavachErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleVaiyavachRegistrationSubmit = async (e) => {
    e.preventDefault();
    if (!validateBeforeSubmit()) return;
    setIsSubmittingRegistration(true);
    try {
      const payload = {
        vaiyavachiImage: vaiyavachForm.vaiyavachiPhoto, // base64 string
        name: vaiyavachForm.vaiyavachiName,
        mobileNumber: vaiyavachForm.mobileNumber,
        whatsappNumber: vaiyavachForm.whatsappNumber,
        emailAddress: vaiyavachForm.email,
        education: vaiyavachForm.education,
        religiousEducation: vaiyavachForm.religiousEducation,
        weight: vaiyavachForm.weight,
        height: vaiyavachForm.height,
        dob: vaiyavachForm.dateOfBirth,
        address: vaiyavachForm.address,
        state: vaiyavachForm.state,
        city: vaiyavachForm.city,
        familyMemberName: vaiyavachForm.familyMemberName,
        relation: vaiyavachForm.familyMemberRelation,
        familyMemberWANumber: vaiyavachForm.familyMemberWhatsapp,
        emergencyNumber: vaiyavachForm.emergencyNumber,
        is7YatraDoneEarlier: vaiyavachForm.done7YatraEarlier,
        haveYouDoneVaiyavachEarlier: vaiyavachForm.doneVaiyavachEarlier,
        howToReachPalitana: vaiyavachForm.howToReachPalitana,
        howManyDaysJoin: vaiyavachForm.howManyDaysJoin,
        typeOfVaiyavach: vaiyavachForm.typeOfVaiyavach,
        valueOfVaiyavach: vaiyavachForm.vaiyavachTypeValue,
        vaiyavachiConfirmation: vaiyavachForm.vaiyavachiConfirmation,
        familyConfirmation: vaiyavachForm.familyConfirmation,
        transactionNumber: vaiyavachTransactionNumber,
      };
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/vaiyavach/createPaymentLink`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      const { paymentLink, vaiyavachiNo, orderId } = res.data;
      sessionStorage.setItem('vaiyavachiNo', vaiyavachiNo);
      sessionStorage.setItem('orderId', orderId);
      window.location.href = paymentLink;
    } catch (err) {
      setPaymentLinkError("Registration failed. Please try again.");
      setIsSubmittingRegistration(false);
    }
  };

  // Helper for seat limits
  const getSeatLimit = (type) => {
    if (type === "spot") return 8;
    if (type === "roamming") return 10;
    if (type === "chaityavandan") return 5;
    return 0;
  };
  const getSeatsLeft = (type, value) => {
    const used = (vaiyavachTypeCounts[type] && vaiyavachTypeCounts[type][value]) || 0;
    return getSeatLimit(type) - used;
  };

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

  // Return the full multi-step Vaiyavach registration form JSX (same as in EventDetails.jsx)
  // ... (Paste the JSX for the Vaiyavach form here, using the above state/handlers)
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
        <span style={{ fontSize: "2rem", marginRight: "0.5rem", lineHeight: 1 }}>&larr;</span>
        <span style={{ fontSize: "1rem", fontWeight: 500 }}></span>
      </button>
      <h2>Vaiyavach Registration</h2>
      <div className="progress-bar">
        <div
          className="progress"
          style={{
            width: `${vaiyavachCurrentStep === 5 || vaiyavachPaymentThankYou ? 100 : ((vaiyavachCurrentStep - 1) / 5) * 100}%`,
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
            {vaiyavachErrors.vaiyavachiPhoto && (
              <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.vaiyavachiPhoto}</div>
            )}
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
            {vaiyavachErrors.vaiyavachiName && (
              <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.vaiyavachiName}</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="mobileNumber">Mobile Number*</label>
            <input
              type="tel"
              id="mobileNumber"
              name="mobileNumber"
              value={vaiyavachForm.mobileNumber}
              onChange={handleVaiyavachChange}
              maxLength={10}
              required
            />
            {vaiyavachErrors.mobileNumber && (
              <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.mobileNumber}</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="whatsappNumber">WhatsApp Number*</label>
            <input
              type="tel"
              id="whatsappNumber"
              name="whatsappNumber"
              value={vaiyavachForm.whatsappNumber}
              onChange={handleVaiyavachChange}
              maxLength={10}
              required
            />
            {vaiyavachErrors.whatsappNumber && (
              <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.whatsappNumber}</div>
            )}
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
              onBlur={handleEmailBlur}
              required
            />
            {vaiyavachErrors.email && (
              <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.email}</div>
            )}
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
            {vaiyavachErrors.education && (
              <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.education}</div>
            )}
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
            {vaiyavachErrors.religiousEducation && (
              <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.religiousEducation}</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="weight">Weight (in kg)*</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={vaiyavachForm.weight}
              onChange={handleVaiyavachChange}
              min={1}
              required
            />
            {vaiyavachErrors.weight && (
              <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.weight}</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="height">Height (in cm)*</label>
            <input
              type="number"
              id="height"
              name="height"
              value={vaiyavachForm.height}
              onChange={handleVaiyavachChange}
              min={1}
              required
            />
            {vaiyavachErrors.height && (
              <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.height}</div>
            )}
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
            {vaiyavachErrors.dateOfBirth && (
              <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.dateOfBirth}</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="address">Address*</label>
            <input
              type="text"
              id="address"
              name="address"
              value={vaiyavachForm.address}
              onChange={handleVaiyavachChange}
              maxLength={200}
              required
            />
            <div style={{ fontSize: "0.85rem", color: vaiyavachForm.address.length > 200 ? "#b71c1c" : "#888" }}>
              {vaiyavachForm.address.length}/200 characters
            </div>
            {vaiyavachErrors.address && (
              <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.address}</div>
            )}
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
            {vaiyavachErrors.state && (
              <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.state}</div>
            )}
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
            {vaiyavachErrors.city && (
              <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.city}</div>
            )}
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
            {vaiyavachErrors.familyMemberName && (
              <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.familyMemberName}</div>
            )}
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
            {vaiyavachErrors.familyMemberRelation && (
              <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.familyMemberRelation}</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="familyMemberWhatsapp">Family Member WhatsApp Number*</label>
            <input
              type="tel"
              id="familyMemberWhatsapp"
              name="familyMemberWhatsapp"
              value={vaiyavachForm.familyMemberWhatsapp}
              onChange={handleVaiyavachChange}
              maxLength={10}
              required
            />
            {vaiyavachErrors.familyMemberWhatsapp && (
              <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.familyMemberWhatsapp}</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="emergencyNumber">Emergency Number*</label>
            <input
              type="tel"
              id="emergencyNumber"
              name="emergencyNumber"
              value={vaiyavachForm.emergencyNumber}
              onChange={handleVaiyavachChange}
              maxLength={10}
              required
            />
            {vaiyavachErrors.emergencyNumber && (
              <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.emergencyNumber}</div>
            )}
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
            {vaiyavachErrors.done7YatraEarlier && (
              <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.done7YatraEarlier}</div>
            )}
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
            {vaiyavachErrors.doneVaiyavachEarlier && (
              <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.doneVaiyavachEarlier}</div>
            )}
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
            {vaiyavachErrors.howToReachPalitana && (
              <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.howToReachPalitana}</div>
            )}
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
            {vaiyavachErrors.howManyDaysJoin && (
              <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.howManyDaysJoin}</div>
            )}
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
            {vaiyavachErrors.typeOfVaiyavach && (
              <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.typeOfVaiyavach}</div>
            )}
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
                disabled={loadingTypeCounts}
              >
                <option value="">Select</option>
                {[
                  "સ્પોટ નંબર ૧ : ધેટી ના પગલા",
                  "સ્પોટ નંબર 2",
                  "સ્પોટ નંબર 3",
                  "સ્પોટ નંબર 4",
                  "સ્પોટ નંબર ૫ : ખોડીયાર માતા ની પરબ",
                  "સ્પોટ નંબર 6",
                  "સ્પોટ નંબર 7",
                  "સ્પોટ નંબર 8",
                  "સ્પોટ નંબર 9",
                  "સ્પોટ નંબર ૧૦ : રામપોળ (નવટુક જવાના રસ્તે)"
                ].map((spot) => {
                  const seatsLeft = getSeatsLeft("spot", spot);
                  return (
                    <option key={spot} value={spot} disabled={seatsLeft <= 0}>
                      {spot} ({seatsLeft > 0 ? `${seatsLeft} seats left` : "Full"})
                    </option>
                  );
                })}
              </select>
              {vaiyavachErrors.vaiyavachTypeValue && (
                <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.vaiyavachTypeValue}</div>
              )}
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
                disabled={loadingTypeCounts}
              >
                <option value="">Select</option>
                {["1-2", "2-3", "3-4", "4-5", "5-6", "6-7", "7-8", "8-9", "9-10"].map((r) => {
                  const seatsLeft = getSeatsLeft("roamming", r);
                  return (
                    <option key={r} value={r} disabled={seatsLeft <= 0}>
                      {r} ({seatsLeft > 0 ? `${seatsLeft} seats left` : "Full"})
                    </option>
                  );
                })}
              </select>
              {vaiyavachErrors.vaiyavachTypeValue && (
                <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.vaiyavachTypeValue}</div>
              )}
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
                disabled={loadingTypeCounts}
              >
                <option value="">Select</option>
                {["ચૈત્ય વંદન શ્રી આદિનાથ પ્રભુ ના રંગ મંડપમાં", "ચૈત્ય વંદન શ્રી રાયણ પગલાં", "ચૈત્ય વંદન શ્રી પુંડરીકસ્વામી ભગવાન પાસે", "ચૈત્ય વંદન શ્રી શાંતિનાથ ભગવાન", "ચૈત્ય વંદન  ધેટી ના પગલે"].map((c) => {
                  const seatsLeft = getSeatsLeft("chaityavandan", c);
                  return (
                    <option key={c} value={c} disabled={seatsLeft <= 0}>
                      {c} ({seatsLeft > 0 ? `${seatsLeft} seats left` : "Full"})
                    </option>
                  );
                })}
              </select>
              {vaiyavachErrors.vaiyavachTypeValue && (
                <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.vaiyavachTypeValue}</div>
              )}
            </div>
          )}
          <div className="form-group">
            <label>Vaiyavachhi Confirmation</label>
            <div style={{ display: "flex", gap: "2rem", margin: "0.5rem 0 1rem 0" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input
                  type="radio"
                  name="vaiyavachiConfirmation"
                  value="yes"
                  checked={vaiyavachForm.vaiyavachiConfirmation === "yes"}
                  onChange={handleVaiyavachChange}
                  required
                />{" "}
                Yes
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input
                  type="radio"
                  name="vaiyavachiConfirmation"
                  value="no"
                  checked={vaiyavachForm.vaiyavachiConfirmation === "no"}
                  onChange={handleVaiyavachChange}
                  required
                />{" "}
                No
              </label>
            </div>
            {vaiyavachErrors.vaiyavachiConfirmation && (
              <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.vaiyavachiConfirmation}</div>
            )}
          </div>
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
                />{" "}
                Yes
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input
                  type="radio"
                  name="familyConfirmation"
                  value="no"
                  checked={vaiyavachForm.familyConfirmation === "no"}
                  onChange={handleVaiyavachChange}
                  required
                />{" "}
                No
              </label>
            </div>
            {vaiyavachErrors.familyConfirmation && (
              <div style={{ color: "#b71c1c", fontSize: "0.95rem", marginTop: "0.2rem" }}>{vaiyavachErrors.familyConfirmation}</div>
            )}
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
      {vaiyavachCurrentStep === 5 && (
        <>
          {/* Loader Overlay (like Yatrik) */}
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
          {/* Thank You Message (like Yatrik) */}
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
                  onClick={() => window.location.reload()}
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
          {/* Error Message (like Yatrik) */}
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
                  background: "#ffebee",
                  border: "1px solid #e53935",
                  borderRadius: "12px",
                  padding: "2rem 2.5rem",
                  textAlign: "center",
                  boxShadow: "0 2px 8px rgba(229,57,53,0.07)",
                }}
              >
                <div style={{ fontSize: "2rem", color: "#e53935", marginBottom: "1rem" }}>&#10007;</div>
                <h2 style={{ color: "#b71c1c", marginBottom: "0.5rem" }}>Payment Verification Failed</h2>
                <div style={{ fontSize: "1.1rem", color: "#b71c1c", marginBottom: "1.5rem" }}>
                  {paymentError || 'Payment verification failed. Please try again or contact support.'}
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
                  onClick={handleVaiyavachRegistrationSubmit}
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
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VaiyavachForm2025; 