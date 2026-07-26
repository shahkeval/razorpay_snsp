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
import AstaprakariPujaForm26 from "./astaprakariPujaForm26";
import MaintenancePage, { MaintenanceCard } from "./maintenance_page";
import PaintingCompitationRSSM from "./painting_compitation_RSSM";

const EventDetails = () => {
  // Expanded image modal state and handlers for event gallery
  const [showEventImageModal, setShowEventImageModal] = useState(false);
  const [eventImageIndex, setEventImageIndex] = useState(0);

  const openEventImageModal = (img, idx) => {
    setEventImageIndex(idx);
    setShowEventImageModal(true);
  };

  const closeEventImageModal = () => {
    setShowEventImageModal(false);
  };

  // Keyboard navigation for modal
  // useEffect(() => {
  //   if (!showEventImageModal) return;
  //   const handleKeyDown = (e) => {
  //     if (e.key === "Escape") closeEventImageModal();
  //     else if (e.key === "ArrowRight") nextEventImage();
  //     else if (e.key === "ArrowLeft") prevEventImage();
  //   };
  //   window.addEventListener("keydown", handleKeyDown);
  //   return () => window.removeEventListener("keydown", handleKeyDown);
  // }, [showEventImageModal, eventImageIndex, events]);
  const { id } = useParams();
  const event = events.find((e) => e.id === id);

  // // Separate state for donation form
  // const [donationFormData, setDonationFormData] = useState({
  //   name: "",
  //   email: "",
  //   category: event.title,
  //   phone: "",
  //   message: "",
  //   amount: "",
  // });

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

  const [chaturmasikForm, setChaturmasikForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    state: "",
    city: "",
    sanghName: "",
    samayik: "",
    navkar: "",
    swadhyay: false,
    brahmacharya: false,
    brahmacharyaPartnerName: "",
    dateOfBirth: "",
  });

  const [chaturmasikStep, setChaturmasikStep] = useState(1);
  const [chaturmasikRedirectCountdown, setChaturmasikRedirectCountdown] = useState(7);
  const [submittedChaturmasikData, setSubmittedChaturmasikData] = useState(null);

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
  const [paymentStatus, setPaymentStatus] = useState("idle"); // idle | verifying | success | error
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
    PAID: "paid",
    CANCELLED: "cancelled",
    FAILED: "failed",
  };

  // useEffect to check payment status from Razorpay query param
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    const paymentStatus = searchParams.get("razorpay_payment_link_status");
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

  // State to hold registration number from backend
  const [registrationNumber, setRegistrationNumber] = useState(null);

  // Dedicated polling for Astaprakari payments
  useEffect(() => {
    const params = getQueryParams(location.search);
    const isAstaprakari =
      !!sessionStorage.getItem("astaprakari") || params.astaprakari === "1";

    if (
      isAstaprakari &&
      params.razorpay_payment_id &&
      params.razorpay_payment_link_id &&
      params.razorpay_signature &&
      params.razorpay_payment_link_status
    ) {
      setPaymentStatus("verifying");
      const paymentLinkId = params.razorpay_payment_link_id;
      let pollCount = 0;
      const MAX_POLLS = 15;

      const poll = setInterval(async () => {
        const element = document.getElementById("thankTop");
        if (element)
          element.scrollIntoView({ behavior: "smooth", block: "start" });

        // count this attempt first so timeout works even when requests fail (network/server errors)
        pollCount++;

        try {
          const res = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/api/astaprakari/verify-payment?orderId=${paymentLinkId}`
          );

          // Handle various statuses explicitly
          if (res.data.status === "paid") {
            setPaymentStatus("paid");
            setPaymentThankYou(true);
            // Accept multiple possible number fields returned by backend
            const no =
              res.data.No ||
              res.data.yatrikNo ||
              res.data.registrationNo ||
              res.data.astaprakariNo;
            if (no) setRegistrationNumber(no);
            sessionStorage.removeItem("astaprakari");
            clearInterval(poll);
            return;
          }

          if (res.data.status === "cancelled" || res.data.status === "failed") {
            setPaymentStatus("error");
            setPaymentError(
              "Payment was cancelled or failed. Please contact support."
            );
            sessionStorage.removeItem("astaprakari");
            clearInterval(poll);
            return;
          }

          // timeout check even when the response doesn't indicate failure or success
          if (pollCount > MAX_POLLS) {
            setPaymentStatus("error");
            setPaymentError(
              "Payment verification timed out. Please refresh or contact support. Phone:-7383120787"
            );
            sessionStorage.removeItem("astaprakari");
            clearInterval(poll);
            return;
          }
        } catch (err) {
          if (!err.response) {
            console.warn(
              "Astaprakari verify network error, attempt",
              pollCount
            );
            setPaymentError("Server unavailable — retrying verification...");
            // if we've exceeded retries, time out
            if (pollCount > MAX_POLLS) {
              setPaymentStatus("error");
              setPaymentError(
                "Payment verification timed out. Please refresh or contact support. Phone:-7383120787"
              );
              sessionStorage.removeItem("astaprakari");
              clearInterval(poll);
              return;
            }
            // otherwise keep polling
          } else {
            setPaymentStatus("error");
            setPaymentError(
              "Payment verification failed. Please refresh or contact support. Phone:-7383120787"
            );
            sessionStorage.removeItem("astaprakari");
            clearInterval(poll);
            return;
          }
        }
      }, 4000);

      return () => clearInterval(poll);
    }
  }, [location.search]);

  // Polling for non-Astaprakari (Yatrik / general) payments
  useEffect(() => {
    const params = getQueryParams(location.search);
    const isAstaprakari =
      !!sessionStorage.getItem("astaprakari") || params.astaprakari === "1";

    if (
      !isAstaprakari &&
      params.razorpay_payment_id &&
      params.razorpay_payment_link_id &&
      params.razorpay_signature &&
      params.razorpay_payment_link_status
    ) {
      setPaymentStatus("verifying");

      const paymentLinkId = params.razorpay_payment_link_id;
      let pollCount = 0;
      const MAX_POLLS = 15;

      const poll = setInterval(async () => {
        const element = document.getElementById("thankTop");
        if (element)
          element.scrollIntoView({ behavior: "smooth", block: "start" });

        pollCount++;

        try {
          const res = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/api/yatriks/verify-payment?orderId=${paymentLinkId}`
          );

          if (res.data.status === "paid") {
            setPaymentStatus("paid");
            setPaymentThankYou(true);
            const no =
              res.data.No || res.data.yatrikNo || res.data.registrationNo;
            if (no) setRegistrationNumber(no);
            clearInterval(poll);
            return;
          }

          if (res.data.status === "cancelled" || res.data.status === "failed") {
            setPaymentStatus("error");
            setPaymentError(
              "Payment was cancelled or failed. Please contact support."
            );
            clearInterval(poll);
            return;
          }

          if (pollCount > MAX_POLLS) {
            setPaymentStatus("error");
            setPaymentError(
              "Payment verification timed out. Please refresh or contact support. Phone:-7383120787"
            );
            clearInterval(poll);
            return;
          }
        } catch (err) {
          if (!err.response) {
            console.warn("Yatrik verify network error, attempt", pollCount);
            setPaymentError("Server unavailable — retrying verification...");
            if (pollCount > MAX_POLLS) {
              setPaymentStatus("error");
              setPaymentError(
                "Payment verification timed out. Please refresh or contact support. Phone:-7383120787"
              );
              clearInterval(poll);
              return;
            }
            // keep polling until timeout
          } else {
            setPaymentStatus("error");
            setPaymentError(
              "Payment verification failed. Please refresh or contact support. Phone:-7383120787"
            );
            clearInterval(poll);
            return;
          }
        }
      }, 4000);

      return () => clearInterval(poll);
    }
  }, [location.search]);

  // Vaiyavach payment status polling (identical to Yatrik, but for Vaiyavach)
  useEffect(() => {
    // Check for Razorpay payment params in URL
    const params = getQueryParams(location.search);
    // Only run if user came from Vaiyavach payment (sessionStorage or param)
    const isVaiyavach =
      sessionStorage.getItem("vaiyavachNo") || params.vaiyavach === "1";
    if (
      isVaiyavach &&
      params.razorpay_payment_id &&
      params.razorpay_payment_link_id &&
      params.razorpay_signature &&
      params.razorpay_payment_link_status
    ) {
      setPaymentStatus("verifying");
      let pollCount = 0;
      const MAX_POLLS = 15;
      const poll = setInterval(async () => {
        pollCount++;
        try {
          const res = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/api/vaiyavach/verifyvaiyavachpayment?orderId=${params.razorpay_payment_link_id}`
          );
          if (res.data.status === "paid") {
            setPaymentStatus("paid");
            setVaiyavachPaymentThankYou(true);
            if (res.data.No) {
              setRegistrationNumber(res.data.No);
            }
            clearInterval(poll);
            return;
          }

          if (pollCount > MAX_POLLS) {
            // Timeout after ~1min
            setPaymentStatus("error");
            setPaymentError(
              "Payment verification failed. Please refresh or Please contact support. Phone:-7383120787"
            );
            clearInterval(poll);
            return;
          }
        } catch (err) {
          if (!err.response) {
            console.warn("Vaiyavach verify network error, attempt", pollCount);
            setPaymentError("Server unavailable — retrying verification...");
            if (pollCount > MAX_POLLS) {
              setPaymentStatus("error");
              setPaymentError(
                "Payment verification failed. Please refresh or Please contact support. Phone:-7383120787"
              );
              clearInterval(poll);
              return;
            }
          } else {
            setPaymentStatus("error");
            setPaymentError(
              "Payment verification failed. Please refresh or Please contact support. Phone:-7383120787"
            );
            clearInterval(poll);
            return;
          }
        }
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
    localStorage.setItem(
      "yatrikRegistrationData",
      JSON.stringify(yatraRegistrationData)
    );
  }, [yatraRegistrationData]);
  useEffect(() => {
    if (yatraRegistrationData.yatrikPhoto) {
      localStorage.setItem("yatrikPhoto", yatraRegistrationData.yatrikPhoto);
    }
  }, [yatraRegistrationData.yatrikPhoto]);

  // Place this useEffect at the top level, not inside any condition
  useEffect(() => {
    // Only run polling if on the callback page
    if (window.location.pathname.includes("yatrik-payment-callback")) {
      setPaymentStatus("verifying");
      const yatrikNo = sessionStorage.getItem("yatrikNo");
      const orderId = sessionStorage.getItem("orderId");
      let pollCount = 0;
      const poll = setInterval(async () => {
        try {
          const res = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/api/yatriks/verify-payment?yatrikNo=${yatrikNo}&orderId=${orderId}`
          );
          if (res.data.status === "paid") {
            setPaymentStatus("paid");
            setPaymentThankYou(true);
            clearInterval(poll);
          } else if (pollCount > 15) {
            // Timeout after ~1min
            setPaymentStatus("error");
            setPaymentError(
              "Payment verification timed out. Please contact support."
            );
            clearInterval(poll);
          }
        } catch (err) {
          setPaymentStatus("error");
          setPaymentError(
            "Payment verification failed. Please contact support."
          );
          clearInterval(poll);
        }
        pollCount++;
      }, 4000);
      return () => clearInterval(poll);
    }
  }, []);

  const handleChaturmasikSkipBrahmacharya = () => {
    setChaturmasikForm((prev) => ({
      ...prev,
      brahmacharya: false,
      brahmacharyaPartnerName: "",
    }));
    setChaturmasikStep(6);
  };

  const getChaturmasikAge = () => {
    if (!chaturmasikForm.dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(chaturmasikForm.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    let interval;
    if (chaturmasikStep === 5) {
      const age = getChaturmasikAge();
      const isEligible = age >= 25 && age <= 50;
      if (!isEligible) {
        setChaturmasikRedirectCountdown(7);
        interval = setInterval(() => {
          setChaturmasikRedirectCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              handleChaturmasikSkipBrahmacharya();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [chaturmasikStep, chaturmasikForm.dateOfBirth]);

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

  // If this event is under maintenance, render the maintenance page only
  if (event && event.mode === "maintenance") {
    return <MaintenancePage />;
  }

  // const handleDonationChange = (e) => {
  //   const { name, value } = e.target;
  //   setDonationFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

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

  const handleChaturmasikChange = (e) => {
    const { name, value, type, checked } = e.target;
    setChaturmasikForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleChaturmasikSubmit = (e) => {
    e.preventDefault();
    if (chaturmasikStep === 1) {
      setChaturmasikStep(2);
    } else if (chaturmasikStep === 2) {
      setChaturmasikStep(3);
    } else if (chaturmasikStep === 3) {
      setChaturmasikStep(4);
    } else if (chaturmasikStep === 4) {
      setChaturmasikStep(5);
    } else if (chaturmasikStep === 5) {
      setChaturmasikStep(6);
    }
  };

  const handleChaturmasikSkip = () => {
    setChaturmasikForm((prev) => ({
      ...prev,
      samayik: "", // Skip doesn't select a value or keeps it blank
    }));
    setChaturmasikStep(3);
  };

  const handleChaturmasikSkipNavkar = () => {
    setChaturmasikForm((prev) => ({
      ...prev,
      navkar: "", // Skip doesn't select a value or keeps it blank
    }));
    setChaturmasikStep(4);
  };

  const handleChaturmasikSkipSwadhyay = () => {
    setChaturmasikForm((prev) => ({
      ...prev,
      swadhyay: false,
    }));
    setChaturmasikStep(5);
  };




  const handleChaturmasikBack = () => {
    setChaturmasikStep((prev) => Math.max(prev - 1, 1));
  };

  const handleChaturmasikFinalSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingRegistration(true);
    try {
      const payload = {
        name: chaturmasikForm.fullName,
        phone: chaturmasikForm.phone,
        dateOfBirth: chaturmasikForm.dateOfBirth,
        address: chaturmasikForm.address,
        state: "Gujarat",
        city: "Ahmedabad",
        sanghName: chaturmasikForm.sanghName,
        samayik: chaturmasikForm.samayik || "",
        navkar: chaturmasikForm.navkar || "",
        swadhyay: !!chaturmasikForm.swadhyay,
        brahmacharya: !!chaturmasikForm.brahmacharya,
        brahmacharyaPartnerName: chaturmasikForm.brahmacharyaPartnerName || "",
      };

      console.log("Submitting Chaturmasik Form payload:", payload);
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/chaturmasik`,
        payload
      );

      setSubmittedChaturmasikData(response.data);

      setShowThankYouMessage(true);
      setFormType("chaturmasik");
    } catch (err) {
      console.error("Submission failed:", err);
      alert(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setIsSubmittingRegistration(false);
    }
  };

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) { resolve(); return; }
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  };

  const handleDownloadIdCard = async () => {
    if (!submittedChaturmasikData) return;
    try {
      // Load dom-to-image-more (uses SVG foreignObject = perfect Gujarati text)
      // Load jsPDF for direct PDF download
      await loadScript("https://cdn.jsdelivr.net/npm/dom-to-image-more@3/dist/dom-to-image-more.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");

      const element = document.getElementById("chaturmasik-id-card-pdf-template");
      if (!element) return;

      const scale = 3;
      const w = element.offsetWidth;
      const h = element.offsetHeight;

      // Capture as high-res PNG using dom-to-image (SVG foreignObject preserves native text rendering)
      const dataUrl = await window.domtoimage.toPng(element, {
        width: w * scale,
        height: h * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: w + "px",
          height: h + "px",
        },
      });

      // Create PDF and auto-download
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: [3.5, 5.5],
      });

      pdf.addImage(dataUrl, "PNG", 0, 0, 3.5, 5.5);
      pdf.save(`${submittedChaturmasikData.chaturmasikNo}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  // const handleDonationSubmit = (e) => {
  //   e.preventDefault();
  //   setIsSubmittingDonation(true);
  //   emailjs.sendForm(
  //     "service_264rxjp",
  //     "template_7oremm9",
  //     e.target, // Sends form data to the template
  //     "7vYFlUx2o5N3Cv3Ll"
  //   );

  //   const qrString = `upi://pay?pa=namonamahshashwatcha.62486048@hdfcbank&pn=${donationFormData.fullName}&am=${donationFormData.amount}&cu=INR&tn=${donationFormData.message}`;
  //   setQrData(qrString);
  //   setTimer(300); // Reset timer on new submission
  //   setIsSubmittingDonation(false);
  //   setDonationFormData({
  //     name: "",
  //     email: "",
  //     category: event.title,
  //     phone: "",
  //     message: "",
  //     amount: "",
  //   });
  // };

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
    setChaturmasikStep(1);
    setSubmittedChaturmasikData(null);
    setChaturmasikForm({
      fullName: "",
      phone: "",
      address: "",
      state: "",
      city: "",
      sanghName: "",
      samayik: "",
      navkar: "",
      swadhyay: false,
      brahmacharya: false,
      brahmacharyaPartnerName: "",
      dateOfBirth: "",
    });
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
      if (event.id === "7-YATRA-2026") {
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
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(255,255,255,0.85)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  // 2. Pay Now handler (new flow)
  const handlePayNow = async (e) => {
    e.preventDefault();
    setIsSubmittingRegistration(true);
    try {
      const formData = new FormData();
      formData.append("yatrikPhoto", yatraRegistrationData.yatrikPhoto);
      formData.append("name", yatraRegistrationData.fullName);
      formData.append("mobileNumber", yatraRegistrationData.phone);
      formData.append("whatsappNumber", yatraRegistrationData.whatsappNumber);
      formData.append("emailAddress", yatraRegistrationData.email);
      formData.append("education", yatraRegistrationData.education);
      formData.append(
        "religiousEducation",
        yatraRegistrationData.religiousEducation
      );
      formData.append("weight", yatraRegistrationData.weight);
      formData.append("height", yatraRegistrationData.height);
      formData.append("dob", yatraRegistrationData.dateOfBirth);
      formData.append("address", yatraRegistrationData.address);
      formData.append("city", yatraRegistrationData.city);
      formData.append("state", yatraRegistrationData.state);
      formData.append(
        "familyMemberName",
        yatraRegistrationData.familyMemberName
      );
      formData.append("relation", yatraRegistrationData.familyMemberRelation);
      formData.append(
        "familyMemberWANumber",
        yatraRegistrationData.familyMemberWhatsapp
      );
      formData.append("emergencyNumber", yatraRegistrationData.emergencyNumber);
      formData.append(
        "is7YatraDoneEarlier",
        yatraRegistrationData.done7YatraEarlier
      );
      formData.append(
        "earlier7YatraCounts",
        yatraRegistrationData.howManyTimes
      );
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
      // Send to backend to create payment link
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/yatriks/create-payment-link`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const { paymentLink, yatrikNo, orderId } = res.data;
      // Store yatrikNo/orderId in session for callback polling
      sessionStorage.setItem("yatrikNo", yatrikNo);
      sessionStorage.setItem("orderId", orderId);
      // Redirect to payment link
      window.location.href = paymentLink;
    } catch (err) {
      alert("Failed to initiate payment. Please try again.");
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
                  <p style={{ textAlign: "start", color: "#4a4a4a" }}>
                    {event.date}
                  </p>
                  {event.time && <p>{event.time}</p>}
                </div>
              </div>

              {event.end_date && (
                <div className="meta-item">
                  <DateRangeIcon />
                  <div>
                    <h4>End Date</h4>
                    <p style={{ textAlign: "start", color: "#4a4a4a" }}>
                      {event.end_date}
                    </p>
                  </div>
                </div>
              )}

              {event.location && (
                <div className="meta-item">
                  <LocationPinIcon />
                  <div>
                    <h4>Location</h4>
                    <p style={{ color: "#4a4a4a" }}>{event.location}</p>
                  </div>
                </div>
              )}

              {event.organizer && (
                <div className="meta-item">
                  <PeopleIcon />
                  <div>
                    <h4>Organizer</h4>
                    <p style={{ color: "#4a4a4a" }}>{event.organizer}</p>
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
              <>
                <div className="event-gallery">
                  <h3>Event Winners</h3>
                  <div className="gallery-grid">
                    {event.images.map((img, index) => (
                      <div
                        key={index}
                        className="gallery-item"
                        onClick={() => openEventImageModal(img, index)}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={img}
                          alt={`${event.title} - image ${index + 1}`}
                          className="fit-image"
                        />
                        <div className="overlay">
                          <span>View</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Modal for expanded image view */}
                {showEventImageModal && (
                  <div className="modal-overlay" onClick={closeEventImageModal}>
                    <div
                      className="modal-content"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="modal-header">
                        <h3>{`${event.title} - image ${eventImageIndex + 1
                          }`}</h3>
                        <button
                          className="close-btn"
                          onClick={closeEventImageModal}
                        >
                          ×
                        </button>
                      </div>
                      <div className="modal-body">
                        <img
                          src={event.images[eventImageIndex]}
                          alt={`${event.title} - image ${eventImageIndex + 1}`}
                          className="modal-image"
                        />
                        {/* No navigation or counter, just image and close button */}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="registration-container" id="thankTop">
            <div className="registration-child">
              {/* Show only one of: loader, dialog, or form */}
              {paymentStatus === "verifying" ? (
                // Loader for payment verification
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
                      background: "#e3f2fd",
                      border: "1px solid #90caf9",
                      borderRadius: "12px",
                      padding: "2rem 2.5rem",
                      textAlign: "center",
                      boxShadow: "0 2px 8px rgba(7,94,84,0.07)",
                    }}
                  >
                    <span
                      className="loader"
                      style={{ marginRight: 12, verticalAlign: "middle" }}
                    ></span>
                    We are verifying your payment, please wait...
                  </div>
                </div>
              ) : paymentStatus === "paid" ? (
                // Thank you dialog (only if paymentStatus is 'paid')
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
                    <div
                      style={{
                        fontSize: "2rem",
                        color: "#43a047",
                        marginBottom: "1rem",
                      }}
                    >
                      &#10003;
                    </div>
                    <h2 style={{ color: "#2e7d32", marginBottom: "0.5rem" }}>
                      Thank you for your registration!
                    </h2>
                    <div
                      style={{
                        fontSize: "1.1rem",
                        color: "#333",
                        marginBottom: registrationNumber ? "0.5rem" : "1.5rem",
                      }}
                    >
                      We have received your payment and details.
                      <br />
                      We will contact you with more information soon.
                    </div>
                    {registrationNumber && (
                      <div
                        style={{
                          background: "#fffde7",
                          border: "1px solid #ffd600",
                          borderRadius: "8px",
                          padding: "1rem 1.5rem",
                          marginBottom: "1.2rem",
                          color: "#795548",
                          fontWeight: 600,
                          fontSize: "1.15rem",
                          boxShadow: "0 1px 4px rgba(255,214,0,0.08)",
                          display: "inline-block",
                        }}
                      >
                        This is your Registration number:
                        <br />
                        <span
                          style={{
                            fontSize: "1.5rem",
                            color: "#ff6f00",
                            fontWeight: 700,
                            letterSpacing: "1px",
                            display: "block",
                            marginTop: "0.3rem",
                          }}
                        >
                          {registrationNumber}
                        </span>
                      </div>
                    )}
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
              ) : paymentStatus === "error" ? (
                // Error dialog (only if paymentStatus is 'error')
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
                    <div
                      style={{
                        fontSize: "2rem",
                        color: "#e53935",
                        marginBottom: "1rem",
                      }}
                    >
                      &#10007;
                    </div>
                    <h2 style={{ color: "#b71c1c", marginBottom: "0.5rem" }}>
                      Payment Verification Failed
                    </h2>
                    <div
                      style={{
                        fontSize: "1.1rem",
                        color: "#b71c1c",
                        marginBottom: "1.5rem",
                      }}
                    >
                      {paymentError ||
                        "Payment verification failed. Please try again or contact support."}
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
                        Your registration has been submitted successfully. We
                        will contact you with more details soon.
                      </p>

                      {formType === "chaturmasik" && submittedChaturmasikData && (
                        <div style={{ display: "flex", justifyContent: "center", margin: "20px auto" }}>
                          <div
                            id="chaturmasik-id-card-pdf-template"
                            style={{
                              width: "336px",
                              height: "528px",
                              padding: "6px",
                              background: "#fff8f0",
                              border: "3px solid #700b0b",
                              borderRadius: "12px",
                              fontFamily: "'Noto Sans Gujarati', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                              boxSizing: "border-box",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              textAlign: "left",
                              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                            }}
                          >
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                border: "1px solid #700b0b",
                                borderRadius: "8px",
                                padding: "12px",
                                boxSizing: "border-box",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                              }}
                            >
                              <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "10px", color: "#700b0b", fontWeight: "bold", marginBottom: "2px" }}>
                                  || શ્રી આદિનાથાય નમઃ ||
                                </div>
                                <div style={{ fontSize: "7px", color: "#333", fontWeight: "600", marginBottom: "2px", lineHeight: "1.3" }}>
                                  !! ૐ હ્રીં શ્રી સિદ્ધિ-મેઘ-મનોહર-ભદ્રંકરસુરી-રવિપ્રભવિજય સદ્ ગુરૂભ્યો નમ: !!
                                </div>
                                <div
                                  style={{
                                    fontSize: "8px",          // Increased text size
                                    color: "#700b0b",
                                    fontWeight: "700",
                                    background: "#fdf2e9",
                                    border: "1px solid #ffd8b3",
                                    borderRadius: "6px",
                                    padding: "6px 12px",      // Increased box height & width
                                    marginBottom: "10px",
                                    lineHeight: "1.6",
                                    display: "inline-block",
                                    width: "100%",            // Makes the box wider
                                    maxWidth: "100%",
                                    boxSizing: "border-box",
                                    textAlign: "center",      // Optional: Center the text
                                  }}
                                >
                                  પ્રેરણા :- <strong>બાપજી મહારાજ ના સમુદાયના ગચ્છાધિપતિ આચાર્ય ભગવંત શ્રી નરરત્નસૂરીશ્વરજી મ સા</strong>
                                </div>
                                <h4 style={{ margin: "0 0 8px 0", color: "#700b0b", fontSize: "14px", fontWeight: "bold", letterSpacing: "0.5px" }}>
                                  આયોજક :- નામો નમઃ શાશ્વત પરિવાર
                                </h4>
                                <h3 style={{ margin: "0 0 10px 0", color: "#333", fontSize: "16px", borderBottom: "2px solid #700b0b", paddingBottom: "6px" }}>
                                  ચાતુર્માસિક આરાધના ૨૦૨૬
                                </h3>

                                <div style={{ background: "#700b0b", color: "white", padding: "5px 10px", borderRadius: "20px", display: "inline-block", fontWeight: "bold", fontSize: "11px", marginBottom: "12px", whiteSpace: "nowrap" }}>
                                  આરાધક ક્રમાંક: {submittedChaturmasikData.chaturmasikNo}
                                </div>

                                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px", color: "#333", marginBottom: "12px" }}>
                                  <tbody>
                                    <tr>
                                      <td style={{ padding: "3px 0", fontWeight: "bold", width: "40%" }}>નામ (Name):</td>
                                      <td style={{ padding: "3px 0" }}>{submittedChaturmasikData.name}</td>
                                    </tr>
                                    <tr>
                                      <td style={{ padding: "3px 0", fontWeight: "bold" }}>ફોન (Phone):</td>
                                      <td style={{ padding: "3px 0" }}>{submittedChaturmasikData.phone}</td>
                                    </tr>
                                    <tr>
                                      <td style={{ padding: "3px 0", fontWeight: "bold" }}>જન્મ તારીખ:</td>
                                      <td style={{ padding: "3px 0" }}>
                                        {new Date(submittedChaturmasikData.dateOfBirth).toLocaleDateString("en-GB")}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style={{ padding: "3px 0", fontWeight: "bold" }}>શહેર (City):</td>
                                      <td style={{ padding: "3px 0" }}>{submittedChaturmasikData.city}</td>
                                    </tr>
                                    <tr>
                                      <td style={{ padding: "3px 0", fontWeight: "bold" }}>સંઘનું નામ:</td>
                                      <td style={{ padding: "3px 0" }}>{submittedChaturmasikData.sanghName}</td>
                                    </tr>
                                  </tbody>
                                </table>

                                <h4 style={{ margin: "3px 0 6px 0", color: "#700b0b", fontSize: "13px", borderBottom: "1px dashed #700b0b", paddingBottom: "3px", textAlign: "center", fontWeight: "bold" }}>
                                  આરાધના સંકલ્પ (Goals)
                                </h4>

                                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px", color: "#333" }}>
                                  <tbody>
                                    <tr>
                                      <td style={{ padding: "3px 0", fontWeight: "bold", width: "50%" }}>૧. સામાયિક:</td>
                                      <td style={{ padding: "3px 0", color: "#700b0b", fontWeight: "bold" }}>
                                        {submittedChaturmasikData.samayik ? `${submittedChaturmasikData.samayik} સામાયિક` : "લાગુ પડતું નથી"}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style={{ padding: "3px 0", fontWeight: "bold" }}>૨. નવકાર મંત્ર:</td>
                                      <td style={{ padding: "3px 0", color: "#700b0b", fontWeight: "bold" }}>
                                        {submittedChaturmasikData.navkar ? `${submittedChaturmasikData.navkar} માળા (રોજ)` : "લાગુ પડતું નથી"}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style={{ padding: "3px 0", fontWeight: "bold" }}>૩. સ્વાધ્યાય:</td>
                                      <td style={{ padding: "3px 0", color: "#700b0b", fontWeight: "bold" }}>
                                        {submittedChaturmasikData.swadhyay ? "અરિહંત વંદનાવલી" : "લાગુ પડતું નથી"}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style={{ padding: "3px 0", fontWeight: "bold" }}>૪. બ્રહ્મચર્ય:</td>
                                      <td style={{ padding: "3px 0", color: "#700b0b", fontWeight: "bold" }}>
                                        {submittedChaturmasikData.brahmacharya ? "સજોડે વ્રત" : "લાગુ પડતું નથી"}
                                      </td>
                                    </tr>
                                    {submittedChaturmasikData.brahmacharya && (
                                      <tr>
                                        <td style={{ padding: "1px 0 3px 15px", fontSize: "11px", color: "#666" }} colSpan="2">
                                          └ સાથીદાર: <span style={{ color: "#700b0b", fontWeight: "bold" }}>{submittedChaturmasikData.brahmacharyaPartnerName}</span>
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>

                              <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid #ddd", paddingTop: "6px" }}>
                                <div style={{ fontSize: "9px", color: "#666", textAlign: "left", maxWidth: "60%", lineHeight: "1.2" }}>
                                  * આ આરાધના કાર્ડ ૧૦૦ દિવસ પૂર્ણ થયા બાદ જમા કરાવવાનું રહેશે.
                                </div>
                                <div style={{ textAlign: "center" }}>
                                  <div style={{ width: "70px", borderBottom: "1px solid #700b0b", marginBottom: "3px" }}></div>
                                  <div style={{ fontSize: "9px", color: "#700b0b", fontWeight: "bold" }}>આયોજક સહી</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center", marginTop: "15px" }}>
                        {formType === "chaturmasik" && submittedChaturmasikData && (
                          <button
                            onClick={handleDownloadIdCard}
                            className="submit-another-form-btn"
                            style={{ margin: 0, width: "200px", backgroundColor: "#075e54" }}
                          >
                            Download ID Card
                          </button>
                        )}
                        <button
                          onClick={handleSubmitAnotherForm}
                          className="submit-another-form-btn"
                          style={{ margin: 0, width: "200px" }}
                        >
                          Submit Another Form
                        </button>
                      </div>
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
                                <span
                                  style={{ color: "#075e54", fontWeight: 600 }}
                                >
                                  Want updates on our next events?
                                </span>
                                <br />
                                Join our WhatsApp group below to stay informed
                                and connected.
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
                                <span
                                  style={{ color: "#075e54", fontWeight: 600 }}
                                >
                                  શું તમે અમારી આગામી કાર્યક્રમો વિશે અપડેટ્સ
                                  મેળવવા માંગો છો?
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
                                    boxShadow:
                                      "0 2px 8px rgba(37,211,102,0.15)",
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
                          {event.id === "AstPrakariPuja-2026" ||
                            event.id === "7-YATRA-2026" ? (
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
                                <span
                                  style={{ color: "#075e54", fontWeight: 600 }}
                                >
                                  Want updates on our next events?
                                </span>
                                <br />
                                Join our WhatsApp group below to stay informed
                                and connected.
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
                                <span
                                  style={{ color: "#075e54", fontWeight: 600 }}
                                >
                                  શું તમે અમારી આગામી કાર્યક્રમો વિશે અપડેટ્સ
                                  મેળવવા માંગો છો?
                                </span>
                                <br />
                                માહિતી અને સંપર્કમાં રહેવા માટે નીચે આપેલા અમારા
                                WhatsApp ગ્રુપમાં જોડાઓ.
                              </p>
                              <a
                                href="https://chat.whatsapp.com/DdNY8vdh03K0cPouuBZupT"
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
                                    boxShadow:
                                      "0 2px 8px rgba(37,211,102,0.15)",
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
                          ) : event.id === "drawing-competition" ? (
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
                                <span
                                  style={{ color: "#075e54", fontWeight: 600 }}
                                >
                                  Want updates on our next events?
                                </span>
                                <br />
                                Join our WhatsApp group below to stay informed
                                and connected.
                                <p style={{ color: "red", fontWeight: 600 }}>
                                  Phone Numbers:- +91 79845 47655 , +91 96249
                                  72659
                                </p>
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
                                <span
                                  style={{ color: "#075e54", fontWeight: 600 }}
                                >
                                  શું તમે અમારી આગામી કાર્યક્રમો વિશે અપડેટ્સ
                                  મેળવવા માંગો છો?
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
                                    boxShadow:
                                      "0 2px 8px rgba(37,211,102,0.15)",
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
                          ) : event.id === "chaturmashik_aradhna_2026" ? (
                            <>
                              <h2>Chaturmasik Registration</h2>
                              <div className="progress-bar">
                                <div
                                  className="progress"
                                  style={{
                                    width: `${((chaturmasikStep - 1) / 5) * 100}%`,
                                  }}
                                ></div>
                              </div>

                              {chaturmasikStep === 1 && (
                                <form onSubmit={handleChaturmasikSubmit}>
                                  <div className="form-group">
                                    <label htmlFor="chaturmasikFullName">Name*</label>
                                    <input
                                      type="text"
                                      id="chaturmasikFullName"
                                      name="fullName"
                                      placeholder="Enter your full name"
                                      value={chaturmasikForm.fullName}
                                      onChange={handleChaturmasikChange}
                                      required
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label htmlFor="chaturmasikPhone">Phone Number*</label>
                                    <input
                                      type="tel"
                                      id="chaturmasikPhone"
                                      name="phone"
                                      placeholder="Enter your phone number"
                                      value={chaturmasikForm.phone}
                                      onChange={handleChaturmasikChange}
                                      required
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label htmlFor="chaturmasikDateOfBirth">Date of Birth*</label>
                                    <input
                                      type="date"
                                      id="chaturmasikDateOfBirth"
                                      name="dateOfBirth"
                                      value={chaturmasikForm.dateOfBirth}
                                      onChange={handleChaturmasikChange}
                                      required
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label htmlFor="chaturmasikAddress">Address*</label>
                                    <textarea
                                      id="chaturmasikAddress"
                                      name="address"
                                      placeholder="Enter your address"
                                      rows="3"
                                      style={{ maxWidth: "316px" }}
                                      value={chaturmasikForm.address}
                                      onChange={handleChaturmasikChange}
                                      required
                                    ></textarea>
                                  </div>
                                  <div className="form-group">
                                    <label htmlFor="chaturmasikState">State*</label>
                                    <input
                                      type="text"
                                      id="chaturmasikState"
                                      name="state"
                                      value="Gujarat"
                                      readOnly
                                      required
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label htmlFor="chaturmasikCity">City*</label>
                                    <input
                                      type="text"
                                      id="chaturmasikCity"
                                      name="city"
                                      value="Ahmedabad"
                                      readOnly
                                      required
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label htmlFor="chaturmasikSanghName">Sangh Name*</label>
                                    <input
                                      type="text"
                                      id="chaturmasikSanghName"
                                      name="sanghName"
                                      placeholder="Enter your Sangh name"
                                      value={chaturmasikForm.sanghName}
                                      onChange={handleChaturmasikChange}
                                      required
                                    />
                                  </div>
                                  <button
                                    type="submit"
                                    className="next-button"
                                  >
                                    Next
                                  </button>
                                </form>
                              )}

                              {chaturmasikStep === 2 && (
                                <form onSubmit={handleChaturmasikSubmit}>
                                  <h3 style={{ textAlign: "center", color: "#075e54", marginBottom: "15px" }}>
                                    સામાયિક
                                  </h3>

                                  <div className="rules-note" style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: "8px", padding: "10px", marginBottom: "15px" }}>
                                    <p style={{ margin: 0, color: "#b71c1c", fontWeight: "bold", fontSize: "0.95rem" }}>
                                      Note: This is for only boys.
                                    </p>
                                    <p style={{ margin: "5px 0 0 0", color: "#333", fontSize: "0.9rem" }}>
                                      Total days: 100 days.
                                    </p>
                                  </div>

                                  <div className="form-group">
                                    <label style={{ fontWeight: "bold", display: "block", marginBottom: "10px" }}>
                                      Select Samayik Target:
                                    </label>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingLeft: "5px" }}>
                                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                        <input
                                          type="radio"
                                          name="samayik"
                                          value="99"
                                          checked={chaturmasikForm.samayik === "99"}
                                          onChange={handleChaturmasikChange}
                                        />
                                        99 Samayik
                                      </label>
                                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                        <input
                                          type="radio"
                                          name="samayik"
                                          value="72"
                                          checked={chaturmasikForm.samayik === "72"}
                                          onChange={handleChaturmasikChange}
                                        />
                                        72 Samayik
                                      </label>
                                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                        <input
                                          type="radio"
                                          name="samayik"
                                          value="54"
                                          checked={chaturmasikForm.samayik === "54"}
                                          onChange={handleChaturmasikChange}
                                        />
                                        54 Samayik
                                      </label>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    className="back-button-yatra"
                                    onClick={handleChaturmasikBack}
                                  >
                                    Back
                                  </button>
                                  <button
                                    type="button"
                                    className="back-button-yatra"
                                    style={{ background: "#e0e0e0", color: "#333" }}
                                    onClick={handleChaturmasikSkip}
                                  >
                                    Skip
                                  </button>
                                  <button
                                    type="submit"
                                    className="next-button"
                                    disabled={!chaturmasikForm.samayik}
                                  >
                                    Next
                                  </button>
                                </form>
                              )}

                              {chaturmasikStep === 3 && (
                                <form onSubmit={handleChaturmasikSubmit}>
                                  <h3 style={{ textAlign: "center", color: "#075e54", marginBottom: "15px" }}>
                                    નવકાર મંત્ર
                                  </h3>

                                  <div className="rules-note" style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: "8px", padding: "10px", marginBottom: "15px" }}>
                                    <p style={{ margin: 0, color: "#333", fontSize: "0.95rem" }}>
                                      Total days: 100 days.
                                    </p>
                                  </div>

                                  <div className="form-group">
                                    <label style={{ fontWeight: "bold", display: "block", marginBottom: "10px" }}>
                                      Select daily Navkar Mantra target:
                                    </label>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingLeft: "5px" }}>
                                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                        <input
                                          type="radio"
                                          name="navkar"
                                          value="10"
                                          checked={chaturmasikForm.navkar === "10"}
                                          onChange={handleChaturmasikChange}
                                        />
                                        10 Mala everyday
                                      </label>
                                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                        <input
                                          type="radio"
                                          name="navkar"
                                          value="5"
                                          checked={chaturmasikForm.navkar === "5"}
                                          onChange={handleChaturmasikChange}
                                        />
                                        5 Mala everyday
                                      </label>
                                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                        <input
                                          type="radio"
                                          name="navkar"
                                          value="2"
                                          checked={chaturmasikForm.navkar === "2"}
                                          onChange={handleChaturmasikChange}
                                        />
                                        2 Mala everyday
                                      </label>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    className="back-button-yatra"
                                    onClick={handleChaturmasikBack}
                                  >
                                    Back
                                  </button>
                                  <button
                                    type="button"
                                    className="back-button-yatra"
                                    style={{ background: "#e0e0e0", color: "#333" }}
                                    onClick={handleChaturmasikSkipNavkar}
                                  >
                                    Skip
                                  </button>
                                  <button
                                    type="submit"
                                    className="next-button"
                                    disabled={!chaturmasikForm.navkar}
                                  >
                                    Next
                                  </button>
                                </form>
                              )}

                              {chaturmasikStep === 4 && (
                                <form onSubmit={handleChaturmasikSubmit}>
                                  <h3 style={{ textAlign: "center", color: "#075e54", marginBottom: "15px" }}>
                                    સ્વાધ્યાય
                                  </h3>

                                  <div className="rules-note" style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: "8px", padding: "10px", marginBottom: "15px" }}>
                                    <p style={{ margin: 0, color: "#333", fontSize: "0.95rem" }}>
                                      Total days: 100 days.
                                    </p>
                                  </div>

                                  <div className="form-group" style={{ marginBottom: "15px" }}>
                                    <label style={{ fontWeight: "bold", display: "block", marginBottom: "10px" }}>
                                      Topic: અરિહંત વંદનાવલી
                                    </label>
                                    <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", cursor: "pointer", fontSize: "0.95rem", lineHeight: "1.3" }}>
                                      <input
                                        type="checkbox"
                                        name="swadhyay"
                                        checked={chaturmasikForm.swadhyay}
                                        onChange={handleChaturmasikChange}
                                        style={{ marginTop: "3px" }}
                                      />
                                      <span>I agree to learn "અરિહંત વંદનાવલી" in 100 days.</span>
                                    </label>
                                  </div>

                                  <button
                                    type="button"
                                    className="back-button-yatra"
                                    onClick={handleChaturmasikBack}
                                  >
                                    Back
                                  </button>
                                  <button
                                    type="button"
                                    className="back-button-yatra"
                                    style={{ background: "#e0e0e0", color: "#333" }}
                                    onClick={handleChaturmasikSkipSwadhyay}
                                  >
                                    Skip
                                  </button>
                                  <button
                                    type="submit"
                                    className="next-button"
                                    disabled={!chaturmasikForm.swadhyay}
                                  >
                                    Next
                                  </button>
                                </form>
                              )}

                              {chaturmasikStep === 5 && (
                                <form onSubmit={handleChaturmasikSubmit}>
                                  {(() => {
                                    const age = getChaturmasikAge();
                                    const isEligible = age >= 25 && age <= 50;

                                    if (!isEligible) {
                                      return (
                                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                                          <style>{`
                                            @keyframes spin {
                                              0% { transform: rotate(0deg); }
                                              100% { transform: rotate(360deg); }
                                            }
                                          `}</style>
                                          <div className="rules-note" style={{ background: "#ffebee", border: "1px solid #ffcdd2", borderRadius: "8px", padding: "15px", marginBottom: "20px" }}>
                                            <p style={{ margin: "0 0 10px 0", color: "#c62828", fontWeight: "bold", fontSize: "1.1rem" }}>
                                              અયોગ્યતા સૂચના / અપત્રતા સૂચના
                                            </p>
                                            <p style={{ margin: "0 0 10px 0", color: "#333", fontSize: "1rem", lineHeight: "1.5" }}>
                                              સજોડે બ્રહ્મચર્ય વ્રત સ્વીકાર આરાધના માટે તમારી ઉંમર ૨૫ થી ૫૦ વર્ષની વચ્ચે હોવી જરૂરી છે. તેથી તમે આ આરાધના માટે પાત્ર નથી.
                                            </p>
                                            <p style={{ margin: 0, color: "#333", fontSize: "1rem", lineHeight: "1.5" }}>
                                              सजोड़े ब्रह्मचर्य व्रत स्वीकार आराधना के लिए आपकी आयु २५ से ५० वर्ष के बीच होनी चाहिए। इसलिए आप इस आराधना के लिए पात्र नहीं हैं।
                                            </p>
                                          </div>
                                          
                                          {/* Small loading spinner / indicator */}
                                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                                            <div className="loading-spinner-small" style={{
                                              width: "24px",
                                              height: "24px",
                                              border: "3px solid #f3f3f3",
                                              borderTop: "3px solid #b71c1c",
                                              borderRadius: "50%",
                                              animation: "spin 1s linear infinite"
                                            }}></div>
                                            <span style={{ fontSize: "0.85rem", color: "#666" }}>
                                              Redirecting in {chaturmasikRedirectCountdown} seconds...
                                            </span>
                                          </div>

                                          <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                                            <button
                                              type="button"
                                              className="back-button-yatra"
                                              onClick={handleChaturmasikBack}
                                            >
                                              Back
                                            </button>
                                            <button
                                              type="button"
                                              className="back-button-yatra"
                                              style={{ background: "#e0e0e0", color: "#333" }}
                                              onClick={handleChaturmasikSkipBrahmacharya}
                                            >
                                              Skip
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    }

                                    // Eligible view
                                    return (
                                      <>
                                        <h3 style={{ textAlign: "center", color: "#075e54", marginBottom: "15px" }}>
                                          સજોડે બ્રહ્મચર્ય વ્રત સ્વીકાર
                                        </h3>

                                        <div className="rules-note" style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: "8px", padding: "10px", marginBottom: "15px" }}>
                                          <p style={{ margin: 0, color: "#333", fontSize: "0.95rem" }}>
                                            આ આરાધના બે વ્યક્તિઓ (સજોડે) માટે છે. કૃપા કરીને સાથીદારનું નામ દાખલ કરો અને સંમતિ આપો.
                                          </p>
                                        </div>

                                        <div className="form-group" style={{ marginBottom: "15px" }}>
                                          <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", cursor: "pointer", fontSize: "0.95rem", lineHeight: "1.3", marginBottom: "15px" }}>
                                            <input
                                              type="checkbox"
                                              name="brahmacharya"
                                              checked={chaturmasikForm.brahmacharya}
                                              onChange={handleChaturmasikChange}
                                              style={{ marginTop: "3px" }}
                                            />
                                            <span>હું ૧૦૦ દિવસ સજોડે બ્રહ્મચર્ય વ્રત સ્વીકારવા માટે સંમત છું (I agree to do brahmacharya for 100 days)</span>
                                          </label>
                                        </div>

                                        {chaturmasikForm.brahmacharya && (
                                          <div className="form-group" style={{ marginBottom: "15px" }}>
                                            <label htmlFor="brahmacharyaPartnerName" style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
                                              સાથીદારનું નામ (Partner's Name)*
                                            </label>
                                            <input
                                              type="text"
                                              id="brahmacharyaPartnerName"
                                              name="brahmacharyaPartnerName"
                                              placeholder="Enter partner's full name"
                                              value={chaturmasikForm.brahmacharyaPartnerName}
                                              onChange={handleChaturmasikChange}
                                              required
                                              style={{
                                                width: "100%",
                                                padding: "8px 12px",
                                                border: "1px solid #ccc",
                                                borderRadius: "4px",
                                                fontSize: "0.95rem"
                                              }}
                                            />
                                          </div>
                                        )}

                                        <button
                                          type="button"
                                          className="back-button-yatra"
                                          onClick={handleChaturmasikBack}
                                        >
                                          Back
                                        </button>
                                        <button
                                          type="button"
                                          className="back-button-yatra"
                                          style={{ background: "#e0e0e0", color: "#333" }}
                                          onClick={handleChaturmasikSkipBrahmacharya}
                                        >
                                          Skip
                                        </button>
                                        <button
                                          type="submit"
                                          className="next-button"
                                          disabled={chaturmasikForm.brahmacharya && !chaturmasikForm.brahmacharyaPartnerName.trim()}
                                        >
                                          Next
                                        </button>
                                      </>
                                    );
                                  })()}
                                </form>
                              )}

                              {chaturmasikStep === 6 && (
                                <form onSubmit={handleChaturmasikFinalSubmit}>
                                  <h3 style={{ textAlign: "center", color: "#075e54", marginBottom: "15px" }}>
                                    વિગતો ચકાસો (Preview)
                                  </h3>

                                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", background: "#f9f9f9", border: "1px solid #ddd", borderRadius: "8px", padding: "15px", marginBottom: "20px", fontSize: "0.95rem", textAlign: "left" }}>
                                    <div>
                                      <strong>Name:</strong> <span style={{ float: "right" }}>{chaturmasikForm.fullName}</span>
                                    </div>
                                    <hr style={{ margin: "5px 0", border: 0, borderTop: "1px solid #eee" }} />
                                    <div>
                                      <strong>Phone:</strong> <span style={{ float: "right" }}>{chaturmasikForm.phone}</span>
                                    </div>
                                    <hr style={{ margin: "5px 0", border: 0, borderTop: "1px solid #eee" }} />
                                    <div>
                                      <strong>Date of Birth:</strong> <span style={{ float: "right" }}>{chaturmasikForm.dateOfBirth}</span>
                                    </div>
                                    <hr style={{ margin: "5px 0", border: 0, borderTop: "1px solid #eee" }} />
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                      <strong>Address:</strong> <span style={{ maxWidth: "60%", textAlign: "right" }}>{chaturmasikForm.address}</span>
                                    </div>
                                    <hr style={{ margin: "5px 0", border: 0, borderTop: "1px solid #eee" }} />
                                    <div>
                                      <strong>State:</strong> <span style={{ float: "right" }}>Gujarat</span>
                                    </div>
                                    <hr style={{ margin: "5px 0", border: 0, borderTop: "1px solid #eee" }} />
                                    <div>
                                      <strong>City:</strong> <span style={{ float: "right" }}>{chaturmasikForm.city}</span>
                                    </div>
                                    <hr style={{ margin: "5px 0", border: 0, borderTop: "1px solid #eee" }} />
                                    <div>
                                      <strong>Sangh Name:</strong> <span style={{ float: "right" }}>{chaturmasikForm.sanghName}</span>
                                    </div>
                                    <hr style={{ margin: "5px 0", border: 0, borderTop: "1px solid #eee" }} />
                                    <div>
                                      <strong>સામાયિક:</strong> <span style={{ float: "right", color: chaturmasikForm.samayik ? "#075e54" : "#b71c1c", fontWeight: "bold" }}>{chaturmasikForm.samayik ? `${chaturmasikForm.samayik} Samayik` : "Skipped"}</span>
                                    </div>
                                    <hr style={{ margin: "5px 0", border: 0, borderTop: "1px solid #eee" }} />
                                    <div>
                                      <strong>નવકાર મંત્ર:</strong> <span style={{ float: "right", color: chaturmasikForm.navkar ? "#075e54" : "#b71c1c", fontWeight: "bold" }}>{chaturmasikForm.navkar ? `${chaturmasikForm.navkar} Mala` : "Skipped"}</span>
                                    </div>
                                    <hr style={{ margin: "5px 0", border: 0, borderTop: "1px solid #eee" }} />
                                    <div>
                                      <strong>સ્વાધ્યાય (અરિહંત વંદનાવલી):</strong> <span style={{ float: "right", color: chaturmasikForm.swadhyay ? "#075e54" : "#b71c1c", fontWeight: "bold" }}>{chaturmasikForm.swadhyay ? "Learned" : "Skipped"}</span>
                                    </div>
                                    <hr style={{ margin: "5px 0", border: 0, borderTop: "1px solid #eee" }} />
                                    <div>
                                      <strong>સજોડે બ્રહ્મચર્ય વ્રત:</strong> <span style={{ float: "right", color: chaturmasikForm.brahmacharya ? "#075e54" : "#b71c1c", fontWeight: "bold" }}>{chaturmasikForm.brahmacharya ? "Accepted" : "Skipped"}</span>
                                      {chaturmasikForm.brahmacharya && (
                                        <div style={{ paddingLeft: "15px", fontSize: "0.85rem", color: "#555", marginTop: "4px" }}>
                                          └ સાથીદારનું નામ: <span style={{ float: "right", color: "#333", fontWeight: "normal" }}>{chaturmasikForm.brahmacharyaPartnerName}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    className="back-button-yatra"
                                    onClick={handleChaturmasikBack}
                                  >
                                    Back
                                  </button>
                                  <button
                                    type="submit"
                                    className="next-button"
                                    disabled={isSubmittingRegistration}
                                  >
                                    {isSubmittingRegistration ? "Submitting..." : "Submit"}
                                  </button>
                                </form>
                              )}
                            </>
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
                                <label htmlFor="message">
                                  Additional Message
                                </label>
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
      {/* <Footer /> */}
    </>
  );
};

export default EventDetails;
