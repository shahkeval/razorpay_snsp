import React, { useState, useEffect } from "react";
import emailjs from "emailjs-com"; // Import EmailJS
import './Contact.css'; // Create a new CSS file for styling
import Footer from "../components/Footer";

const Contact = () => {
  const [emailSent, setEmailSent] = useState(null); // Change to null for better handling
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_phone: '',
    user_address: '',
    message: ''
  });

  const sendEmail = (e) => {
    e.preventDefault();

    // Send form data to EmailJS
    emailjs
      .sendForm(
        "service_264rxjp",
        "template_fcem8gh",
        e.target, // Sends form data to the template
        "7vYFlUx2o5N3Cv3Ll"
      )
      .then(
        (result) => {
          console.log(result.text);
          setEmailSent(true); // Email sent successfully
          setFormData({ // Reset form data
            user_name: '',
            user_email: '',
            user_phone: '',
            user_address: '',
            message: ''
          });
        },
        (error) => {
          console.log(error.text);
          setEmailSent(false); // Email failed to send
        }
      );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Auto-dismiss message after 3 seconds
  useEffect(() => {
    if (emailSent !== null) {
      const timer = setTimeout(() => {
        setEmailSent(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [emailSent]);

  return (
    <>
    <div className="contact row mx-0 px-md-5 px-2">
      <div className="col-12 text-center">
        <h1 style={{marginTop: "0px"}}>Contact Us</h1>
      </div>
      <div className="col-12 mt-3 d-flex">
        <div className="form-container">
          <form onSubmit={sendEmail}>
            <label>Name:</label>
            <input
              type="text"
              name="user_name"
              placeholder="Your Name"
              value={formData.user_name}
              onChange={handleChange}
              required
            />

            <label>Email:</label>
            <input
              type="email"
              name="user_email"
              placeholder="Your Email"
              value={formData.user_email}
              onChange={handleChange}
              required
            />

            <label>Contact:</label>
            <input
              type="tel"
              name="user_phone"
              placeholder="Your Contact Number"
              value={formData.user_phone}
              onChange={handleChange}
              required
            />

            <label>Address:</label>
            <input
              type="text"
              name="user_address"
              placeholder="Your Address"
              value={formData.user_address}
              onChange={handleChange}
              required
            />

            <label>Message:</label>
            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>

            <button type="submit">Submit</button>
            
          </form>
          {emailSent === true ? (
            <p className="text-center w-100 mt-3">Request Submitted Successfully!</p>
          ) : emailSent === false ? (
            <p className="text-center w-100 mt-3">There was an error sending the email.</p>
          ) : null}
          
        </div>
       
      </div>
    </div>
<Footer/>
</>
  );
};

export default Contact;
