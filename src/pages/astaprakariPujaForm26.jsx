import React, { useState, useEffect } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression";

const AstaprakariPujaForm26 = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    name: "",
    yatrikPhoto: "",
    mobileNumber: "",
    whatsappNumber: "",
    emailAddress: "",
    education: "",
    religiousEducation: "",
    weight: "",
    height: "",
    dob: "",
    address: "",
    city: "",
    state: "",
    familyMemberName: "",
    relation: "",
    familyMemberWANumber: "",
    emergencyNumber: "",
    howToReachPalitana: "with_us",
    progress: 0,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentLinkError, setPaymentLinkError] = useState("");
  const [errors, setErrors] = useState({});

  const states = require("../data/IN-states.json");
  const cities = require("../data/IN-cities.json");
  const filteredCities = cities.filter((c) => c.stateCode === formData.state);

  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
      return () => document.body.removeChild(script);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("astaprakariForm26", JSON.stringify(formData));
  }, [formData]);

  const validateField = (name, value, allValues = {}) => {
    let error = "";

    const isEmpty = (v) =>
      v === undefined ||
      v === null ||
      (typeof v === "string" && v.trim() === "");

    // Photo
    if (name === "yatrikPhoto") {
      if (
        !value ||
        (typeof value === "string" && !value.startsWith("data:image/"))
      )
        return "Photo is required";
      return "";
    }

    // Name
    if (name === "name") {
      if (isEmpty(value)) return "Name is required";
    }

    // Phone numbers
    if (
      [
        "mobileNumber",
        "whatsappNumber",
        "familyMemberWANumber",
        "emergencyNumber",
      ].includes(name)
    ) {
      if (isEmpty(value)) return "This field is required";
      if (!/^[0-9]{0,10}$/.test(value)) error = "Only digits allowed";
      else if (value.length !== 10) error = "Must be exactly 10 digits";
    }

    if (name === "emergencyNumber" && formData.mobileNumber === value)
      error = "Emergency number can't be same as mobile number";

    // Email
    if (name === "emailAddress") {
      if (isEmpty(value)) return "Email is required";
      if (!/^\S+@\S+\.\S+$/.test(value)) error = "Invalid email address";
    }

    // Education fields
    if (name === "education") {
      if (isEmpty(value)) return "Education is required";
    }
    if (name === "religiousEducation") {
      if (isEmpty(value)) return "Religious education is required";
    }

    // Measurements
    if (["weight", "height"].includes(name)) {
      if (isEmpty(value)) return "This field is required";
      if (!/^\d*\.?\d*$/.test(value)) error = "Only positive numbers allowed";
      else if (parseFloat(value) <= 0) error = "Must be a positive number";
    }

    // DOB
    if (name === "dob") {
      if (isEmpty(value)) return "Date of birth is required";
      const age = Math.floor(
        (Date.now() - new Date(value)) / (365.25 * 24 * 60 * 60 * 1000)
      );
      if (age < 15 || age > 60) return "Age must be between 15 and 60 years";
    }

    // Address
    if (name === "address") {
      if (isEmpty(value)) return "Address is required";
      if (value.length > 255) error = "Address cannot exceed 255 characters";
    }

    // State / City
    if (name === "state") {
      if (isEmpty(value)) return "State is required";
    }
    if (name === "city") {
      if (isEmpty(value)) return "City is required";
    }

    // Family info
    if (name === "familyMemberName") {
      if (isEmpty(value)) return "Family member name is required";
    }
    if (name === "relation") {
      if (isEmpty(value)) return "Relation is required";
    }

    if (name === "howToReachPalitana") {
      if (isEmpty(value)) return "Please select how to reach Palitana";
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (
      [
        "mobileNumber",
        "whatsappNumber",
        "familyMemberWANumber",
        "emergencyNumber",
      ].includes(name)
    ) {
      val = value.replace(/[^0-9]/g, "").slice(0, 10);
    }

    if (name === "address") val = value.slice(0, 255);

    setFormData((p) => ({ ...p, [name]: val }));
    setErrors((p) => ({
      ...p,
      [name]: validateField(name, val, { ...formData, [name]: val }),
    }));
  };

  const validateStep = (step) => {
    const errs = {};
    if (step === 1) {
      ["yatrikPhoto", "name", "mobileNumber", "whatsappNumber"].forEach((f) => {
        const err =
          f === "yatrikPhoto"
            ? formData.yatrikPhoto &&
              formData.yatrikPhoto.startsWith("data:image/")
              ? ""
              : "Photo is required"
            : validateField(f, formData[f] || "");
        if (err) errs[f] = err;
      });
    }
    if (step === 2) {
      [
        "emailAddress",
        "education",
        "religiousEducation",
        "weight",
        "height",
        "dob",
        "address",
        "state",
        "city",
      ].forEach((f) => {
        const err = validateField(f, formData[f] || "");
        if (err) errs[f] = err;
      });
    }
    if (step === 3) {
      [
        "familyMemberName",
        "relation",
        "familyMemberWANumber",
        "emergencyNumber",
        "howToReachPalitana",
      ].forEach((f) => {
        const err = validateField(f, formData[f] || "");
        if (err) errs[f] = err;
      });
    }
    return errs;
  };

  const nextStep = (e) => {
    if (e) e.preventDefault();
    const err = validateStep(currentStep);
    setErrors(err);
    if (Object.values(err).some(Boolean)) return;
    setCurrentStep((s) => Math.min(s + 1, 4));
    setFormData((p) => ({ ...p, progress: p.progress + 33 }));
    const el = document.getElementById("astatop");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const prevStep = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
    setFormData((p) => ({ ...p, progress: p.progress - 33 }));
    const el = document.getElementById("astatop");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const compressAndPreview = async (file) => {
    const options = {
      maxSizeMB: 0.4,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    const compressed = await imageCompression(file, options);
    const reader = new FileReader();
    reader.onload = function (e) {
      setFormData((p) => ({ ...p, yatrikPhoto: e.target.result }));
      setPhotoPreview(e.target.result);
    };
    reader.readAsDataURL(compressed);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await compressAndPreview(file);
  };

  const handleTakePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await compressAndPreview(file);
  };

  const handlePayNow = async (e) => {
    e.preventDefault();
    if (
      !formData.yatrikPhoto ||
      !formData.yatrikPhoto.startsWith("data:image/")
    ) {
      alert("Please select and upload a valid photo.");
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
      const fd = new FormData();
      fd.append("yatrikPhoto", formData.yatrikPhoto);
      fd.append("name", formData.name);
      fd.append("mobileNumber", formData.mobileNumber);
      fd.append("whatsappNumber", formData.whatsappNumber);
      fd.append("emailAddress", formData.emailAddress);
      fd.append("education", formData.education);
      fd.append("religiousEducation", formData.religiousEducation);
      fd.append("weight", formData.weight);
      fd.append("height", formData.height);
      fd.append("dob", formData.dob);
      fd.append("address", formData.address);
      fd.append("city", formData.city);
      fd.append("state", formData.state);
      fd.append("familyMemberName", formData.familyMemberName);
      fd.append("relation", formData.relation);
      fd.append("familyMemberWANumber", formData.familyMemberWANumber);
      fd.append("emergencyNumber", formData.emergencyNumber);
      fd.append("howToReachPalitana", formData.howToReachPalitana);

      const res = await axios.post(
        `${API_BASE_URL}/api/astaprakari/create-payment-link`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const { paymentLink, yatrikNo, orderId } = res.data;
      sessionStorage.setItem("yatrikNo", yatrikNo);
      sessionStorage.setItem("orderId", orderId);
      // Mark that user started an Astaprakari payment so EventDetails can poll the correct endpoint
      sessionStorage.setItem("astaprakari", "1");
      window.location.href = paymentLink;
    } catch (err) {
      alert("Failed to initiate payment. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div id="astatop">
      <h2>Astaprakari Puja Registration</h2>
      <div className="progress-bar">
        <div
          className="progress"
          style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
        ></div>
      </div>

      {currentStep === 1 && (
        <form onSubmit={nextStep}>
          <div className="form-group">
            <label htmlFor="yatrikPhoto">Profile Photo*</label>
            <input
              required
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
            />
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Astaprakari Preview"
                style={{ width: "100px", height: "100px", marginTop: "10px" }}
              />
            )}
            {errors.yatrikPhoto && (
              <div className="error-message">{errors.yatrikPhoto}</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="name">Name*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "input-error" : ""}
              required
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="mobileNumber">Mobile Number*</label>
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              className={errors.mobileNumber ? "input-error" : ""}
              required
            />
            {errors.mobileNumber && (
              <div className="error-message">{errors.mobileNumber}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="whatsappNumber">WhatsApp Number*</label>
            <input
              type="tel"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleChange}
              className={errors.whatsappNumber ? "input-error" : ""}
              required
            />
            {errors.whatsappNumber && (
              <div className="error-message">{errors.whatsappNumber}</div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "1rem",
            }}
          >
            <button type="button" className="next-button" onClick={nextStep}>
              Next
            </button>
          </div>
        </form>
      )}

      {currentStep === 2 && (
        <form onSubmit={nextStep}>
          <div className="form-group">
            <label htmlFor="emailAddress">Email*</label>
            <input
              required
              type="email"
              name="emailAddress"
              value={formData.emailAddress}
              onChange={handleChange}
              className={errors.emailAddress ? "input-error" : ""}
            />
            {errors.emailAddress && (
              <div className="error-message">{errors.emailAddress}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="education">Education*</label>
            <input
              required
              type="text"
              name="education"
              value={formData.education}
              onChange={handleChange}
              className={errors.education ? "input-error" : ""}
            />
            {errors.education && (
              <div className="error-message">{errors.education}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="religiousEducation">Religious Education*</label>
            <input
              required
              type="text"
              name="religiousEducation"
              value={formData.religiousEducation}
              onChange={handleChange}
              className={errors.religiousEducation ? "input-error" : ""}
            />
            {errors.religiousEducation && (
              <div className="error-message">{errors.religiousEducation}</div>
            )}
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
              <label htmlFor="weight">Weight (kg)</label>
              <input
                required
                type="number"
                step="any"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className={errors.weight ? "input-error" : ""}
              />
              {errors.weight && (
                <div className="error-message">{errors.weight}</div>
              )}
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
              <label htmlFor="height">Height (cm)</label>
              <input
                required
                type="number"
                step="any"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className={errors.height ? "input-error" : ""}
              />
              {errors.height && (
                <div className="error-message">{errors.height}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dob">Date of Birth</label>
            <input
              required
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className={errors.dob ? "input-error" : ""}
            />
            {errors.dob && <div className="error-message">{errors.dob}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              required
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={errors.address ? "input-error" : ""}
            ></textarea>
            {errors.address && (
              <div className="error-message">{errors.address}</div>
            )}
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div className="form-group" style={{ flex: 1, minWidth: 220 }}>
              <label htmlFor="state">State</label>
              <select
                required
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={errors.state ? "input-error" : ""}
              >
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s.isoCode} value={s.isoCode}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.state && (
                <div className="error-message">{errors.state}</div>
              )}
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 220 }}>
              <label htmlFor="city">City</label>
              <select
                required
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={errors.city ? "input-error" : ""}
              >
                <option value="">Select City</option>
                {filteredCities.map((c, idx) => (
                  <option key={`${c.name}-${idx}`} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.city && (
                <div className="error-message">{errors.city}</div>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "1rem",
            }}
          >
            <button
              type="button"
              className="back-button-yatra"
              onClick={prevStep}
            >
              Back
            </button>
            <button type="button" className="next-button" onClick={nextStep}>
              Next
            </button>
          </div>
        </form>
      )}

      {currentStep === 3 && (
        <form onSubmit={nextStep}>
          <div className="form-group">
            <label htmlFor="familyMemberName">Family Member Name*</label>
            <input
              required
              name="familyMemberName"
              value={formData.familyMemberName}
              onChange={handleChange}
              className={errors.familyMemberName ? "input-error" : ""}
            />
            {errors.familyMemberName && (
              <div className="error-message">{errors.familyMemberName}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="relation">Relation*</label>
            <input
              required
              name="relation"
              value={formData.relation}
              onChange={handleChange}
              className={errors.relation ? "input-error" : ""}
            />
            {errors.relation && (
              <div className="error-message">{errors.relation}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="familyMemberWANumber">Family Member WhatsApp</label>
            <input
              required
              type="tel"
              name="familyMemberWANumber"
              value={formData.familyMemberWANumber}
              onChange={handleChange}
              className={errors.familyMemberWANumber ? "input-error" : ""}
            />
            {errors.familyMemberWANumber && (
              <div className="error-message">{errors.familyMemberWANumber}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="emergencyNumber">Emergency Number</label>
            <input
              required
              type="tel"
              name="emergencyNumber"
              value={formData.emergencyNumber}
              onChange={handleChange}
              className={errors.emergencyNumber ? "input-error" : ""}
            />
            {errors.emergencyNumber && (
              <div className="error-message">{errors.emergencyNumber}</div>
            )}
          </div>

          <div className="form-group">
            <label>How to reach Palitana</label>
            <div
              role="radiogroup"
              aria-label="How to reach Palitana"
              style={{ display: "flex", gap: "1rem", alignItems: "center" }}
            >
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  required
                  type="radio"
                  name="howToReachPalitana"
                  value="with_us"
                  checked={formData.howToReachPalitana === "with_us"}
                  onChange={handleChange}
                />
                With Us
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="radio"
                  name="howToReachPalitana"
                  value="direct_palitana"
                  checked={formData.howToReachPalitana === "direct_palitana"}
                  onChange={handleChange}
                />
                Direct Palitana
              </label>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "1rem",
            }}
          >
            <button
              type="button"
              className="back-button-yatra"
              onClick={prevStep}
            >
              Back
            </button>
            <button type="button" className="next-button" onClick={nextStep}>
              Next
            </button>
          </div>
        </form>
      )}

      {currentStep === 4 && (
        <div>
          <h3>Registration Payment</h3>
          <div
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "1.05rem",
              marginBottom: "1rem",
            }}
          >
            To register for this event, you need to pay a registration fee of
            Rs. 200.00/-
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <button
              type="button"
              className="next-button"
              disabled={isSubmitting}
              onClick={handlePayNow}
              style={{
                background: "#800000",
                color: "white",
                border: "none",
                borderRadius: "25px",
                padding: "0.8rem 1.5rem",
                fontWeight: 600,
                fontSize: "1rem",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                transition: "background 0.2s",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? "Processing..." : "Pay Now"}
            </button>

            {paymentLinkError && (
              <div style={{ color: "red", marginTop: 8 }}>
                {paymentLinkError}
              </div>
            )}

            <div
              style={{
                marginTop: 12,
                color: "#333",
                fontSize: "1.05rem",
                textAlign: "center",
              }}
            >
              <div style={{ marginTop: 8 }}>
                You will be redirected to Razorpay to complete your payment
                securely.
              </div>
              <div
                style={{ marginTop: 16, color: "#777", fontSize: "0.95rem" }}
              >
                For inquiries, please contact us: <br />{" "}
                namonamahshashwatparivar9@gmail.com
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AstaprakariPujaForm26;
