import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import events from "../data/events";
import "./EventDetails.css";
import DateRangeIcon from "@mui/icons-material/DateRange";
import LocationPinIcon from "@mui/icons-material/LocationPin";
import PeopleIcon from "@mui/icons-material/People";
import { QRCodeSVG } from "qrcode.react";
import Footer from "../components/Footer";
import emailjs from "emailjs-com"; // Import EmailJS
import axios from "axios";
import YatrikForm2025 from "./YatrikForm2025";
import VaiyavachForm2025 from "./VaiyavachForm2025";

const EventDetails = () => {
  const { id } = useParams();
  const event = events.find((e) => e.id === id);

  // Separate state for donation form
  const [donationFormData, setDonationFormData] = useState({
    name: "",
    email: "",
    category: event.title,
    phone: "",
    message: "",
    amount: "",
  });

  // Separate state for custom registration form
  const [customRegistrationData, setCustomRegistrationData] = useState({
    fullName: "",
    city: "",
    area: "",
    birthdate: "",
    gender: "",
    profession: "",
    whatsapp: "",
    sangh: "",
    category: "",
  });

  // Separate state for default registration form
  const [defaultRegistrationData, setDefaultRegistrationData] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);
  const [isSubmittingRegistration, setIsSubmittingRegistration] =
    useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [timer, setTimer] = useState(10); // Timer for QR code expiration
  const [error, setError] = useState("");
  const [showThankYouMessage, setShowThankYouMessage] = useState(false);
  const [formType, setFormType] = useState("default"); // 'custom' or 'default'

  const [yatraRegistrationData, setYatraRegistrationData] = useState({
    fullName: "keval",
    email: "shahkeval7383@gmail.com",
    education: "demo",
    religiousEducation: "demo",
    phone: "1234567890",
    whatsappNumber: "1236547890",
    address: "wdw",
    city: "Ahmedabad",
    state: "GJ",
    weight: "15",
    height: "12",
    dateOfBirth: "12-07-2025",
    progress: 0,
    familyMemberName: "kaushal",
    familyMemberRelation: "father",
    familyMemberWhatsapp: "7894561230",
    emergencyNumber: "7894561230",
    done7YatraEarlier: "yes",
    howManyTimes: "1",
    howToReachPalitana: "With_Us",
    yatrikConfirmation: "yes",
    familyConfirmation: "yes",
  });

  const [currentStep, setCurrentStep] = useState(1);

  const [yatrikPhotoPreview, setYatrikPhotoPreview] = useState(null);

  // Load states and cities data
  const states = require("../data/IN-states.json");
  const cities = require("../data/IN-cities.json");

  // Filter cities based on selected state
  const filteredCities = cities.filter(
    (city) => city.stateCode === yatraRegistrationData.state
  );

  // Vaiyavach filtered cities (must be after vaiyavachForm is defined)
  const [vaiyavachCurrentStep, setVaiyavachCurrentStep] = useState(1);
  const [vaiyavachPhotoPreview, setVaiyavachPhotoPreview] = useState(null);
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
  const vaiyavachFilteredCities = cities.filter(
    (city) => city.stateCode === vaiyavachForm.state
  );

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`; // Format as MM:SS
  };

  const [captchaValue, setCaptchaValue] = useState(() =>
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );
  const [captchaInput, setCaptchaInput] = useState("");
  // New state for payment thank you
  const [paymentThankYou, setPaymentThankYou] = useState(false);

  // Add state for initial registration and type selection
  const [registrationType, setRegistrationType] = useState(""); // 'yatrik' or 'vaiyavach'

  // Vaiyavach payment step state
  const [vaiyavachTransactionNumber, setVaiyavachTransactionNumber] =
    useState("");
  const [vaiyavachCaptchaValue, setVaiyavachCaptchaValue] = useState(() =>
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );
  const [vaiyavachCaptchaInput, setVaiyavachCaptchaInput] = useState("");
  const [vaiyavachPaymentThankYou, setVaiyavachPaymentThankYou] =
    useState(false);

  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [razorpayError, setRazorpayError] = useState("");
  const [orderFeeDetails, setOrderFeeDetails] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle | verifying | success | error
  const [paymentError, setPaymentError] = useState("");

  // Add state for payment link
  const [paymentLink, setPaymentLink] = useState(null);
  const [paymentLinkLoading, setPaymentLinkLoading] = useState(false);
  const [paymentLinkError, setPaymentLinkError] = useState("");
  const [paymentLinkId, setPaymentLinkId] = useState(null);

  const location = useLocation();

  // Helper to parse query params
  function getQueryParams(search) {
    return Object.fromEntries(new URLSearchParams(search));
  }

  // Add at the top of the component, after other useState declarations
  const [paymentStatusDialog, setPaymentStatusDialog] = useState(null);

  // Enum-like object for payment status types
  const PaymentStatusType = {
    PAID: 'paid',
    CANCELLED: 'cancelled',
    FAILED: 'failed',
  };

  // useEffect to check payment status from Razorpay query param
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paymentStatus = searchParams.get('razorpay_payment_link_status');
    if (paymentStatus) {
      if (paymentStatus === PaymentStatusType.PAID) {
        setPaymentStatusDialog(PaymentStatusType.PAID);
      } else if (
        paymentStatus === PaymentStatusType.CANCELLED ||
        paymentStatus === PaymentStatusType.FAILED
      ) {
        setPaymentStatusDialog(PaymentStatusType.CANCELLED);
      } else {
        setPaymentStatusDialog(PaymentStatusType.FAILED);
      }
    }
  }, []);

  useEffect(() => {
    // Check for Razorpay payment params in URL
    const params = getQueryParams(location.search);
    if (
      params.razorpay_payment_id &&
      params.razorpay_payment_link_id &&
      params.razorpay_signature &&
      params.razorpay_payment_link_status
    ) {
      setPaymentStatus('verifying');
      // Call backend to verify payment using payment_link_id
      const paymentLinkId = params.razorpay_payment_link_id;
      let pollCount = 0;
      const poll = setInterval(async () => {
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/yatriks/verify-payment?orderId=${paymentLinkId}`);
          if (res.data.status === 'paid') {
            setPaymentStatus('paid');
            setPaymentThankYou(true);
            clearInterval(poll);
          } else if (pollCount > 15) { // Timeout after ~1min
            setPaymentStatus('error');
            setPaymentError('Payment verification failed. Please refresh or Please contact support. Phone:-7383120787');
            clearInterval(poll);
          }
        } catch (err) {
          setPaymentStatus('error');
          setPaymentError('Payment verification failed. Please refresh or Please contact support. Phone:-7383120787');
          clearInterval(poll);
        }
        pollCount++;
      }, 4000);
      return () => clearInterval(poll);
    }
  }, [location.search]);

  // Vaiyavach payment status polling (identical to Yatrik, but for Vaiyavach)
  useEffect(() => {
    // Check for Razorpay payment params in URL
    const params = getQueryParams(location.search);
    // Only run if user came from Vaiyavach payment (sessionStorage or param)
    const isVaiyavach = sessionStorage.getItem('vaiyavachNo') || params.vaiyavach === '1';
    if (
      isVaiyavach &&
      params.razorpay_payment_id &&
      params.razorpay_payment_link_id &&
      params.razorpay_signature &&
      params.razorpay_payment_link_status
    ) {
      setPaymentStatus('verifying');
      let pollCount = 0;
      const poll = setInterval(async () => {
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/vaiyavach/verifyvaiyavachpayment?orderId=${params.razorpay_payment_link_id}`);
          if (res.data.status === 'paid') {
            setPaymentStatus('paid');
            setVaiyavachPaymentThankYou(true);
            clearInterval(poll);
          } else if (pollCount > 15) { // Timeout after ~1min
            setPaymentStatus('error');
            setPaymentError('Payment verification failed. Please refresh or Please contact support. Phone:-7383120787');
            clearInterval(poll);
          }
        } catch (err) {
          setPaymentStatus('error');
          setPaymentError('Payment verification failed. Please refresh or Please contact support. Phone:-7383120787');
          clearInterval(poll);
        }
        pollCount++;
      }, 4000);
      return () => clearInterval(poll);
    }
  }, [location.search]);

  useEffect(() => {
    if (timer > 0 && qrData) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setQrData(null); // Close QR code section
      setError("QR Code has expired. Please resubmit the form.");
      setTimeout(() => setError(""), 3000); // Clear error after 3 seconds
    }
  }, [timer, qrData]);

  useEffect(() => {
    // Dynamically load Razorpay script if not already present
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

  // 1. Store registration data and image in localStorage as user fills form
  useEffect(() => {
    localStorage.setItem('yatrikRegistrationData', JSON.stringify(yatraRegistrationData));
  }, [yatraRegistrationData]);
  useEffect(() => {
    if (yatraRegistrationData.yatrikPhoto) {
      localStorage.setItem('yatrikPhoto', yatraRegistrationData.yatrikPhoto);
    }
  }, [yatraRegistrationData.yatrikPhoto]);

  // Place this useEffect at the top level, not inside any condition
  useEffect(() => {
    // Only run polling if on the callback page
    if (window.location.pathname.includes('yatrik-payment-callback')) {
      setPaymentStatus('verifying');
      const yatrikNo = sessionStorage.getItem('yatrikNo');
      const orderId = sessionStorage.getItem('orderId');
      let pollCount = 0;
      const poll = setInterval(async () => {
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/yatriks/verify-payment?yatrikNo=${yatrikNo}&orderId=${orderId}`);
          if (res.data.status === 'paid') {
            setPaymentStatus('paid');
            setPaymentThankYou(true);
            clearInterval(poll);
          } else if (pollCount > 15) { // Timeout after ~1min
            setPaymentStatus('error');
            setPaymentError('Payment verification timed out. Please contact support.');
            clearInterval(poll);
          }
        } catch (err) {
          setPaymentStatus('error');
          setPaymentError('Payment verification failed. Please contact support.');
          clearInterval(poll);
        }
        pollCount++;
      }, 4000);
      return () => clearInterval(poll);
    }
  }, []);

  if (!event) {
    return (
      <div className="event-not-found">
        <h2>Event Not Found</h2>
        <p>The event you're looking for doesn't exist or has been removed.</p>
        <Link to="/events" className="back-to-events">
          Back to Events
        </Link>
      </div>
    );
  }

  const handleDonationChange = (e) => {
    const { name, value } = e.target;
    setDonationFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCustomRegistrationChange = (e) => {
    const { name, value } = e.target;
    setCustomRegistrationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDefaultRegistrationChange = (e) => {
    const { name, value } = e.target;
    setDefaultRegistrationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDonationSubmit = (e) => {
    e.preventDefault();
    setIsSubmittingDonation(true);
    emailjs.sendForm(
      "service_264rxjp",
      "template_7oremm9",
      e.target, // Sends form data to the template
      "7vYFlUx2o5N3Cv3Ll"
    );

    const qrString = `upi://pay?pa=namonamahshashwatcha.62486048@hdfcbank&pn=${donationFormData.fullName}&am=${donationFormData.amount}&cu=INR&tn=${donationFormData.message}`;
    setQrData(qrString);
    setTimer(300); // Reset timer on new submission
    setIsSubmittingDonation(false);
    setDonationFormData({
      name: "",
      email: "",
      category: event.title,
      phone: "",
      message: "",
      amount: "",
    });
  };

  const handleCustomRegistrationSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingRegistration(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/rssmsu`,
        customRegistrationData
      );
      // Reset form data
      setCustomRegistrationData({
        fullName: "",
        city: "",
        area: "",
        birthdate: "",
        gender: "",
        profession: "",
        whatsapp: "",
        sangh: "",
        category: "",
      });
      setShowThankYouMessage(true);
      setFormType("custom"); // Set form type to custom
    } catch (err) {
      alert("Registration failed. Please try again.");
    } finally {
      setIsSubmittingRegistration(false);
    }
  };

  const handleDefaultRegistrationSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingRegistration(true);
    try {
      await emailjs.sendForm(
        "service_k2tcpcx",
        "template_u2l34q6",
        e.target,
        "Mc-t84_MrpngejBH_"
      );
      // Reset default form data
      setDefaultRegistrationData({
        fullName: "",
        email: "",
        phone: "",
        message: "",
      });
      setShowThankYouMessage(true);
      setFormType("default"); // Set form type to default
    } catch (err) {
      alert("Registration failed. Please try again.");
    } finally {
      setIsSubmittingRegistration(false);
    }
  };

  const handleSubmitAnotherForm = () => {
    setShowThankYouMessage(false); // Hide thank you message
    setRegistrationType(""); // Go back to radio selection
    // Reset form data if needed
    // Optionally, you can also reset the form fields here
  };

  const toggleDonationForm = () => {
    setShowDonationForm(!showDonationForm);
  };

  const handleBack = () => {
    setShowDonationForm(false);
    setQrData(null);
    setError("");
  };

  const handleYatraRegistrationChange = (e) => {
    const { name, value } = e.target;
    setYatraRegistrationData((prev) => ({ ...prev, [name]: value }));
  };

  const handleYatraRegistrationSubmit = async (e) => {
    e.preventDefault();
    // Captcha check for step 5
    if (currentStep === 5 && captchaInput !== captchaValue) {
      alert("Captcha does not match. Please try again.");
      setCaptchaValue(Math.random().toString(36).substring(2, 8).toUpperCase());
      setCaptchaInput("");
      return;
    }
    // Show thank you message for payment step
    if (currentStep === 5) {
      // Only for 7-YATRA-2025, submit to backend
      if (event.id === "7-YATRA-2025") {
        try {
          const formData = new FormData();
          formData.append("yatrikPhoto", yatraRegistrationData.yatrikPhoto);
          formData.append("yatrikName", yatraRegistrationData.fullName);
          formData.append("mobileNumber", yatraRegistrationData.phone);
          formData.append(
            "whatsappNumber",
            yatraRegistrationData.whatsappNumber
          );
          formData.append("email", yatraRegistrationData.email);
          formData.append("education", yatraRegistrationData.education);
          formData.append(
            "religiousEducation",
            yatraRegistrationData.religiousEducation
          );
          formData.append("weight", yatraRegistrationData.weight);
          formData.append("height", yatraRegistrationData.height);
          formData.append("dateOfBirth", yatraRegistrationData.dateOfBirth);
          formData.append("address", yatraRegistrationData.address);
          formData.append("state", yatraRegistrationData.state);
          formData.append("city", yatraRegistrationData.city);
          formData.append(
            "familyMemberName",
            yatraRegistrationData.familyMemberName
          );
          formData.append(
            "familyMemberRelation",
            yatraRegistrationData.familyMemberRelation
          );
          formData.append(
            "familyMemberWhatsapp",
            yatraRegistrationData.familyMemberWhatsapp
          );
          formData.append(
            "emergencyNumber",
            yatraRegistrationData.emergencyNumber
          );
          formData.append(
            "done7YatraEarlier",
            yatraRegistrationData.done7YatraEarlier
          );
          formData.append("howManyTimes", yatraRegistrationData.howManyTimes);
          formData.append(
            "howToReachPalitana",
            yatraRegistrationData.howToReachPalitana
          );
          formData.append(
            "yatrikConfirmation",
            yatraRegistrationData.yatrikConfirmation
          );
          formData.append(
            "familyConfirmation",
            yatraRegistrationData.familyConfirmation
          );
          formData.append(
            "transactionNumber",
            yatraRegistrationData.transactionNumber
          );

          await axios.post(
            `${process.env.REACT_APP_API_BASE_URL}/api/yatriks/createyatrik`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
          setPaymentThankYou(true);
        } catch (err) {
          alert("Registration failed. Please try again.");
        }
        return;
      }
      setPaymentThankYou(true);
      return;
    }
    // Handle submission logic here
  };

  // Handler for add another response
  const handleAddAnotherResponse = () => {
    // Remove Razorpay query params and reload the page to the same event
    const url = window.location.pathname + window.location.hash;
    window.location.replace(url);
    // Optionally, reset all form state if not reloading
    // setShowThankYouMessage(false);
    // setCurrentStep(1);
    // setYatraRegistrationData({ ...initialYatraRegistrationData });
    // setYatrikPhotoPreview(null);
    // setPaymentThankYou(false);
    // setRegistrationType("");
    // setPaymentStatusDialog(null);
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5));
    setYatraRegistrationData((prev) => ({
      ...prev,
      progress: prev.progress + 25,
    }));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setYatraRegistrationData((prev) => ({
      ...prev,
      progress: prev.progress - 25,
    }));
  };

  // Deadline for RSSM-સુલેખન કળા registration
  const sulekhDeadline = new Date("2025-06-26T12:00:00+05:30");
  const isSulekhDeadlinePassed = new Date() > sulekhDeadline;

  // Vaiyavach handlers
  const handleVaiyavachChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setVaiyavachForm((prev) => ({ ...prev, [name]: files[0] }));
      setVaiyavachPhotoPreview(URL.createObjectURL(files[0]));
    } else {
      setVaiyavachForm((prev) => ({ ...prev, [name]: value }));
    }
  };
  const vaiyavachNextStep = (e) => {
    e.preventDefault();
    setVaiyavachCurrentStep((prev) => Math.min(prev + 1, 5));
  };
  const vaiyavachPrevStep = () =>
    setVaiyavachCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleVaiyavachRegistrationSubmit = async (e) => {
    e.preventDefault();
    if (vaiyavachCaptchaInput !== vaiyavachCaptchaValue) {
      alert("Captcha does not match. Please try again.");
      setVaiyavachCaptchaValue(
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );
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
      formData.append(
        "familyMemberWANumber",
        vaiyavachForm.familyMemberWhatsapp
      );
      formData.append("emergencyNumber", vaiyavachForm.emergencyNumber);
      formData.append("is7YatraDoneEarlier", vaiyavachForm.done7YatraEarlier);
      formData.append(
        "haveYouDoneVaiyavachEarlier",
        vaiyavachForm.doneVaiyavachEarlier
      );
      formData.append("howToReachPalitana", vaiyavachForm.howToReachPalitana);
      formData.append("howManyDaysJoin", vaiyavachForm.howManyDaysJoin);
      formData.append("typeOfVaiyavach", vaiyavachForm.typeOfVaiyavach);
      formData.append("valueOfVaiyavach", vaiyavachForm.vaiyavachTypeValue);
      formData.append(
        "vaiyavachiConfirmation",
        vaiyavachForm.vaiyavachiConfirmation
      );
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

  // Add this near the top of the component
  // console.log('Render: paymentThankYou', paymentThankYou);

  // Add modal overlay styles
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

  // 2. Pay Now handler (new flow)
  const handlePayNow = async (e) => {
    e.preventDefault();
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
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/yatriks/create-payment-link`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const { paymentLink, yatrikNo, orderId } = res.data;
      // Store yatrikNo/orderId in session for callback polling
      sessionStorage.setItem('yatrikNo', yatrikNo);
      sessionStorage.setItem('orderId', orderId);
      // Redirect to payment link
      window.location.href = paymentLink;
    } catch (err) {
      alert('Failed to initiate payment. Please try again.');
      setIsSubmittingRegistration(false);
    }
  };

  return (
    <>
      <div className="event-details-container">
        <div className="breadcrumb">
          <Link to="/events">Events</Link> / <span>{event.title}</span>
        </div>

        <div className="event-details-content">
          <div className="event-info">
            <div className="event-header">
              <h1>{event.title}</h1>
            </div>

            <div className="event-image-container">
              <img
                src={event.image}
                alt={event.title}
                className="event-feature-image fit-image"
              />
            </div>

            <div className="event-meta-info">
              <div className="meta-item">
                <DateRangeIcon />
                <div>
                  <h4>Date & Time</h4>
                  <p style={{ textAlign: "start" }}>{event.date}</p>
                  {event.time && <p>{event.time}</p>}
                </div>
              </div>

              {event.location && (
                <div className="meta-item">
                  <LocationPinIcon />
                  <div>
                    <h4>Location</h4>
                    <p>{event.location}</p>
                  </div>
                </div>
              )}

              {event.organizer && (
                <div className="meta-item">
                  <PeopleIcon />
                  <div>
                    <h4>Organizer</h4>
                    <p>{event.organizer}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="event-description-full">
              <h2>About This Event</h2>
              <p
                className="event-description-text"
                style={{ textAlign: "left" }}
              >
                {event.description.split("\\n").map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </p>
              {event.schedule && (
                <div className="event-schedule">
                  <h3>Event Schedule</h3>
                  <ul>
                    {event.schedule.map((item, index) => (
                      <li key={index}>
                        <span className="schedule-time">{item.time}</span>
                        <span className="schedule-activity">
                          {item.activity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Donation Button */}
            {/* <button className="donation-button" onClick={toggleDonationForm}>
            Donation
          </button> */}

            {/* Donation Form */}
            {/* {showDonationForm && (
            <div className="donation-form-wrapper">
              <h2>Donation Form</h2>
              <form onSubmit={handleDonationSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={donationFormData.name}
                  onChange={handleDonationChange}
                  required
                />
                <input
                  type="text"
                  name="category"
                  value={donationFormData.category}
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={donationFormData.phone}
                  onChange={handleDonationChange}
                  required
                />
                <input
                  type="text"
                  name="amount"
                  placeholder="Amount"
                  value={donationFormData.amount}
                  onChange={handleDonationChange}
                  required
                />
                <textarea
                  name="message"
                  placeholder="Message (optional)"
                  value={donationFormData.message}
                  onChange={handleDonationChange}
                />
                <button type="submit" disabled={isSubmittingDonation}>
                  {isSubmittingDonation ? 'Submitting...' : 'Submit'}
                </button>
              </form>
              {error && <p className="error-message">{error}</p>}
              {qrData && (
                <div className="qr-section">
                  <p>Scan the QR code below to complete your donation:</p>
                  <QRCodeSVG value={qrData} size={256} />
                  <p>QR Code expires in: {formatTime(timer)}</p>
                  <button className="back-button-yatra" onClick={handleBack}>Back</button>
                </div>
              )}
            </div>
          )} */}

            {event.images && event.images.length > 0 && (
              <div className="event-gallery">
                <h3>Event Gallery</h3>
                <div className="gallery-grid">
                  {event.images.map((img, index) => (
                    <div key={index} className="gallery-item">
                      <img
                        src={img}
                        alt={`${event.title} - image ${index + 1}`}
                        className="fit-image"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="registration-container">
            <div className="registration-child">
              {/* Show only one of: loader, dialog, or form */}
              {paymentStatus === 'verifying' ? (
                // Loader for payment verification
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', padding: '2rem 1rem' }}>
                  <div style={{ background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: '12px', padding: '2rem 2.5rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(7,94,84,0.07)' }}>
                    <span className="loader" style={{ marginRight: 12, verticalAlign: 'middle' }}></span>
                    We are verifying your payment, please wait...
                  </div>
                </div>
              ) : paymentStatus === 'paid' ? (
                // Thank you dialog (only if paymentStatus is 'paid')
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', padding: '2rem 1rem' }}>
                  <div style={{ background: '#e8f5e9', border: '1px solid #43a047', borderRadius: '12px', padding: '2rem 2.5rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(67,160,71,0.07)' }}>
                    <div style={{ fontSize: '2rem', color: '#43a047', marginBottom: '1rem' }}>&#10003;</div>
                    <h2 style={{ color: '#2e7d32', marginBottom: '0.5rem' }}>Thank you for your registration!</h2>
                    <div style={{ fontSize: '1.1rem', color: '#333', marginBottom: '1.5rem' }}>
                      We have received your payment and details.<br />We will contact you with more information soon.
                    </div>
                    <button onClick={handleAddAnotherResponse} style={{ background: '#43a047', color: 'white', border: 'none', borderRadius: '25px', padding: '0.8rem 1.5rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', transition: 'background 0.2s' }}>
                      Add Another Response
                    </button>
                  </div>
                </div>
              ) : paymentStatus === 'error' ? (
                // Error dialog (only if paymentStatus is 'error')
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', padding: '2rem 1rem' }}>
                  <div style={{ background: '#ffebee', border: '1px solid #e53935', borderRadius: '12px', padding: '2rem 2.5rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(229,57,53,0.07)' }}>
                    <div style={{ fontSize: '2rem', color: '#e53935', marginBottom: '1rem' }}>&#10007;</div>
                    <h2 style={{ color: '#b71c1c', marginBottom: '0.5rem' }}>Payment Verification Failed</h2>
                    <div style={{ fontSize: '1.1rem', color: '#b71c1c', marginBottom: '1.5rem' }}>
                      {paymentError || 'Payment verification failed. Please try again or contact support.'}
                    </div>
                  </div>
                </div>
              ) : (
                // Registration form and all other logic
                <>
                  {showThankYouMessage ? (
                    <div className="success-message">
                      <i className="icon-check"></i>
                      <h3>Thank You!</h3>
                      <p>
                        Your registration has been submitted successfully. We will
                        contact you with more details soon.
                      </p>
                      <button
                        onClick={handleSubmitAnotherForm}
                        className="submit-another-form-btn"
                      >
                        Submit Another Form
                      </button>
                    </div>
                  ) : (
                    <>
                      {event.id === "RSSM-સુલેખન કળા" ? (
                        <>
                          {isSulekhDeadlinePassed ? (
                            <div
                              className="registration-closed-message"
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#fff8e1",
                                border: "1px solid #ffe082",
                                borderRadius: "16px",
                                padding: "32px 16px",
                                margin: "32px 0",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                              }}
                            >
                              <h3
                                style={{
                                  color: "#b71c1c",
                                  marginBottom: 12,
                                  fontWeight: 700,
                                  fontSize: "2rem",
                                  textAlign: "center",
                                }}
                              >
                                Registration Closed
                              </h3>
                              <p
                                style={{
                                  color: "#333",
                                  fontSize: "1.1rem",
                                  textAlign: "center",
                                  marginBottom: 12,
                                  maxWidth: 400,
                                }}
                              >
                                Thank you for your interest!
                                <br />
                                Registration for this event is now closed.
                                <br />
                                <span style={{ color: "#075e54", fontWeight: 600 }}>
                                  Want updates on our next events?
                                </span>
                                <br />
                                Join our WhatsApp group below to stay informed and
                                connected.
                              </p>
                              <p
                                style={{
                                  color: "#333",
                                  fontSize: "1.1rem",
                                  textAlign: "center",
                                  marginBottom: 24,
                                  maxWidth: 400,
                                  fontFamily:
                                    "Noto Sans Gujarati, Arial, sans-serif",
                                }}
                              >
                                તમારી રુચિ બદલ આભાર!
                                <br />
                                આ કાર્યક્રમ માટે નોંધણી હવે બંધ છે.
                                <br />
                                <span style={{ color: "#075e54", fontWeight: 600 }}>
                                  શું તમે અમારી આગામી કાર્યક્રમો વિશે અપડેટ્સ મેળવવા
                                  માંગો છો?
                                </span>
                                <br />
                                માહિતી અને સંપર્કમાં રહેવા માટે નીચે આપેલા અમારા
                                WhatsApp ગ્રુપમાં જોડાઓ.
                              </p>
                              <a
                                href="https://chat.whatsapp.com/J2jj56NdGw4LUD4WYkRkVt"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  textDecoration: "none",
                                }}
                              >
                                <QRCodeSVG
                                  value="https://chat.whatsapp.com/J2jj56NdGw4LUD4WYkRkVt"
                                  size={160}
                                  style={{
                                    border: "4px solid #25d366",
                                    borderRadius: 12,
                                    background: "#fff",
                                    cursor: "pointer",
                                    marginBottom: 8,
                                    transition: "box-shadow 0.2s",
                                    boxShadow: "0 2px 8px rgba(37,211,102,0.15)",
                                  }}
                                />
                                <span
                                  style={{
                                    color: "#075e54",
                                    fontWeight: 600,
                                    fontSize: "1rem",
                                    marginTop: 4,
                                    textAlign: "center",
                                  }}
                                >
                                  Tap QR or click here to join WhatsApp group
                                </span>
                              </a>
                            </div>
                          ) : (
                            <div> demo further form is for rssm event </div>
                            //   <form onSubmit={handleCustomRegistrationSubmit}>
                            //    <div className="rules-note">
                            //   <p>For rules and regulations:- <br></br><button className="rules-button" onClick={() => window.open('https://docs.google.com/document/d/1-XkmbqGijcaajrGBQVT-NH8UigUnG1Z89T_2Wp1HxkQ/edit?usp=sharing', '_blank')}>click here</button></p>
                            // </div>
                            //     <div className="form-group">
                            //       <label htmlFor="fullName">Full Name*</label>
                            //       <input
                            //         type="text"
                            //         id="fullName"
                            //         name="fullName"
                            //         placeholder="Enter your full name"
                            //         value={customRegistrationData.fullName}
                            //         onChange={(e) => setCustomRegistrationData({ ...customRegistrationData, fullName: e.target.value })}
                            //         required
                            //       />
                            //     </div>
                            //     <br></br>
                            //     <div className="form-group">
                            //       <label htmlFor="city">City*</label>
                            //       <input
                            //         type="text"
                            //         id="city"
                            //         name="city"
                            //         placeholder="Enter your city"
                            //         value={customRegistrationData.city || ''}
                            //         onChange={(e) => setCustomRegistrationData({ ...customRegistrationData, city: e.target.value })}
                            //         required
                            //       />
                            //     </div>
                            //     <br></br>
                            //     <div className="form-group">
                            //       <label htmlFor="area">Area*</label>
                            //       <input
                            //         type="text"
                            //         id="area"
                            //         name="area"
                            //         placeholder="Enter your area"
                            //         value={customRegistrationData.area || ''}
                            //         onChange={(e) => setCustomRegistrationData({ ...customRegistrationData, area: e.target.value })}
                            //         required
                            //       />
                            //     </div>
                            //     <br></br>
                            //     <div className="form-group">
                            //       <label htmlFor="birthdate">Birth date*</label>
                            //       <input
                            //         type="date"
                            //         id="birthdate"
                            //         name="birthdate"
                            //         value={customRegistrationData.birthdate || ''}
                            //         onChange={(e) => setCustomRegistrationData({ ...customRegistrationData, birthdate: e.target.value })}
                            //         required
                            //       />
                            //     </div>
                            //     <br></br>
                            //     <div className="form-group">
                            //       <label htmlFor="gender">Gender*</label>
                            //       <div>
                            //         <label>
                            //           <input
                            //             type="radio"
                            //             name="gender"
                            //             value="Male"
                            //             checked={customRegistrationData.gender === 'Male'}
                            //             onChange={(e) => setCustomRegistrationData({ ...customRegistrationData, gender: e.target.value })}
                            //             required
                            //           />
                            //           Male
                            //         </label>
                            //         <label>
                            //           <input
                            //             type="radio"
                            //             name="gender"
                            //             value="Female"
                            //             checked={customRegistrationData.gender === 'Female'}
                            //             onChange={(e) => setCustomRegistrationData({ ...customRegistrationData, gender: e.target.value })}
                            //             required
                            //           />
                            //           Female
                            //         </label>
                            //       </div>
                            //     </div>
                            //     <br></br>
                            //     <div className="form-group">
                            //       <label htmlFor="profession">Profession*</label>
                            //       <input
                            //         type="text"
                            //         id="profession"
                            //         name="profession"
                            //         placeholder="Enter your profession"
                            //         value={customRegistrationData.profession || ''}
                            //         onChange={(e) => setCustomRegistrationData({ ...customRegistrationData, profession: e.target.value })}
                            //         required
                            //       />
                            //     </div>
                            //     <br></br>
                            //     <div className="form-group">
                            //       <label htmlFor="whatsapp">Whatsapp number*</label>
                            //       <input
                            //         type="tel"
                            //         id="whatsapp"
                            //         name="whatsapp"
                            //         placeholder="Enter your Whatsapp number"
                            //         value={customRegistrationData.whatsapp || ''}
                            //         onChange={(e) => setCustomRegistrationData({ ...customRegistrationData, whatsapp: e.target.value })}
                            //         required
                            //       />
                            //     </div>
                            //     <br></br>
                            //     <div className="form-group">
                            //       <label htmlFor="sangh">Sangh name*</label>
                            //       <input
                            //         type="text"
                            //         id="sangh"
                            //         name="sangh"
                            //         placeholder="Enter your Sangh name"
                            //         value={customRegistrationData.sangh || ''}
                            //         onChange={(e) => setCustomRegistrationData({ ...customRegistrationData, sangh: e.target.value })}
                            //         required
                            //       />
                            //     </div>
                            //     <br></br>
                            //     <div className="form-group">
                            //       <label htmlFor="category">Category*</label>
                            //       <select
                            //         id="category"
                            //         name="category"
                            //         value={customRegistrationData.category || ''}
                            //         onChange={(e) => setCustomRegistrationData({ ...customRegistrationData, category: e.target.value })}
                            //         required
                            //       >
                            //         <option value="">Select Category</option>
                            //         <option value="6-12 yrs">Category 1: 6-12 yrs</option>
                            //         <option value="12-18 yrs">Category 2: 12-18 yrs</option>
                            //         <option value="18-30 yrs">Category 3: 18-30 yrs</option>
                            //         <option value="30-45 yrs">Category 4: 30-45 yrs</option>
                            //         <option value="45+ yrs">Category 5: 45+ yrs</option>
                            //       </select>
                            //     </div>
                            //     <button
                            //       type="submit"
                            //       className="submit-btn"
                            //       disabled={isSubmittingRegistration}
                            //     >
                            //       {isSubmittingRegistration ? 'Submitting...' : 'Register Now'}
                            //     </button>
                            //   </form>
                            //   )}
                          )}
                        </>
                      ) : (
                        <>
                          {event.id === "7-YATRA-2025" ? (
                            <div>
                              {/* Step 1: Type Selection */}
                              {registrationType === "" && (
                                <div
                                  style={{
                                    marginTop: "1.5rem",
                                    marginBottom: "1.5rem",
                                  }}
                                >
                                  <h1
                                    style={{
                                      fontSize: "1.6rem",
                                      fontWeight: 700,
                                      marginBottom: "1rem",
                                      color: "#800000",
                                      textAlign: "center",
                                    }}
                                  >
                                    Which type you want to register
                                  </h1>
                                  <div
                                    style={{
                                      fontSize: "1.1rem",
                                      fontWeight: 600,
                                      marginBottom: "0.7rem",
                                      color: "#333",
                                      textAlign: "center",
                                      letterSpacing: "0.5px",
                                    }}
                                  >
                                    Register as:
                                  </div>
                                  <div className="form-group">
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: "2rem",
                                        margin: "0.5rem 0 1rem 0",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <label
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "0.3rem",
                                        }}
                                      >
                                        <input
                                          type="radio"
                                          name="registrationType"
                                          value="yatrik"
                                          checked={registrationType === "yatrik"}
                                          onChange={() =>
                                            setRegistrationType("yatrik")
                                          }
                                        />{" "}
                                        Yatrik
                                      </label>
                                      <label
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "0.3rem",
                                        }}
                                      >
                                        <input
                                          type="radio"
                                          name="registrationType"
                                          value="vaiyavach"
                                          checked={registrationType === "vaiyavach"}
                                          onChange={() =>
                                            setRegistrationType("vaiyavach")
                                          }
                                        />{" "}
                                        Vaiyavach
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {/* Step 2: Yatrik or Vaiyavach Form */}
                              {registrationType === "yatrik" && (
                                <YatrikForm2025 event={event} onComplete={() => setRegistrationType("")} />
                              )}
                              {registrationType === "vaiyavach" && (
                                <VaiyavachForm2025 event={event} onComplete={() => setRegistrationType("")} />
                              )}
                            </div>
                          ) : (
                            <form onSubmit={handleDefaultRegistrationSubmit}>
                              <div className="form-group">
                                <label htmlFor="fullName">Full Name*</label>
                                <input
                                  type="text"
                                  id="fullName"
                                  name="fullName"
                                  placeholder="Enter your full name"
                                  value={defaultRegistrationData.fullName}
                                  onChange={(e) =>
                                    setDefaultRegistrationData({
                                      ...defaultRegistrationData,
                                      fullName: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label htmlFor="email">Email Address*</label>
                                <input
                                  type="email"
                                  id="email"
                                  name="email"
                                  placeholder="Enter your email address"
                                  value={defaultRegistrationData.email}
                                  onChange={(e) =>
                                    setDefaultRegistrationData({
                                      ...defaultRegistrationData,
                                      email: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label htmlFor="phone">Phone Number*</label>
                                <input
                                  type="tel"
                                  id="phone"
                                  name="phone"
                                  placeholder="Enter your phone number"
                                  value={defaultRegistrationData.phone}
                                  onChange={(e) =>
                                    setDefaultRegistrationData({
                                      ...defaultRegistrationData,
                                      phone: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label htmlFor="message">Additional Message</label>
                                <textarea
                                  id="message"
                                  name="message"
                                  placeholder="Any specific requirements or questions..."
                                  rows="4"
                                  style={{ maxWidth: "316px" }}
                                  value={defaultRegistrationData.message}
                                  onChange={(e) =>
                                    setDefaultRegistrationData({
                                      ...defaultRegistrationData,
                                      message: e.target.value,
                                    })
                                  }
                                ></textarea>
                              </div>
                              <button
                                type="submit"
                                className="submit-btn"
                                disabled={isSubmittingRegistration}
                              >
                                {isSubmittingRegistration
                                  ? "Submitting..."
                                  : "Register Now"}
                              </button>
                              {isSubmittingRegistration && (
                                <div>Submitting your registration...</div>
                              )}
                            </form>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}

              <div className="contact-info">
                <p>For inquiries, please contact us:</p>
                {/* <a href="tel:9426364451">+91 9426364451</a> */}
                <a href="mailto:namonamahshaswatparivar9@gmail.com">
                  namonamahshaswatparivar9@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EventDetails;
