import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './Popup.css'; // Create a CSS file for styling
import RSSME from '../assets/demo.jpg'
const Popup = ({ onClose }) => {
  const navigate = useNavigate(); // Get navigate function

  const handleVote = () => {
    navigate('/voting'); // Redirect to the voting page
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <img src={RSSME} alt="Event" className="popup-image" /><br></br>
        <button className="vote-button" onClick={handleVote}>Vote Now</button>
        <button className="close-button" onClick={onClose}>✖</button>
      </div>
    </div>
  );
};

export default Popup;
