import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import './Home.css'; // Create a new CSS file for styling
import Footer from '../components/Footer'; // Import the Footer component
import Breadcrumb from '../components/Breadcrumb';
import events from '../data/events'; 

const images = [
  '/images/bapji.jpg',
  '/images/bhadra.jpg',
  '/images/guru.jpg',
  '/images/guru2.jpg',
];

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const upcomingEvents = events.filter(event => event.type === 'upcoming'); // Filter upcoming events

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <>
      <div className="home-container">
        <div className="image-section">
          <img src={images[currentImageIndex]} alt="Description" />
        </div>
        <div className="text-section">
          <h1>નમો નમઃ શાશ્વત પરિવાર</h1>
          <h3> યૌવન એટલે શું? વીજળીનો તણખો, <br />
            જો ઝબકે તો અજવાળુ, નહિંતર ભડકો.. <br /></h3>
          <div style={{textAlign:"justify"}}>
          <p>
          સ્વાર્થી દુનિયાની વચ્ચે રહી નિ:સ્વાર્થતાના મીઠડા ઘુંટ પીવા અને પીવડાવવા માટે દુર્લભ મનુષ્યભવને પ્રત્યેક ક્ષણે ચિરંજીવ બનાવી દેવા માટે પરમાત્મા મહાવીર સ્વામી કથિત શાશ્વત સુખનું લક્ષ અને આત્માના પક્ષને નજર સમક્ષ રાખી ક્ષણે ક્ષણને જીવંત બનાવવા માટે જેઓ સતત પ્રયત્નશીલ છે, જેઓ હંમેશા શાસનને સમર્પિત છે, એવા સત્ત્વશાળી યુવાનોની મજબુત સાંકળ એટલે,</p> <p style={{textAlign:"center"}}> <b> નમો નમઃ શાશ્વત પરિવાર.</b></p>
          </div>
        </div>
        <div className="quick-links">
          <h2>Our Activities</h2>
          <ul style={{ listStyleType: 'disc', padding: 0 }}>
            <li style={{color:'red'}}>
              <Link to="/RSSM">Rushabh Samrajya Sanskar Mission ("#Giriraj500misalgiri")</Link>
            </li>
            <li>Chauvihar Chhath kari Giriraj Ni 7 Yatra</li>
            <li>Shetrunjay Nadi Nahi Ne Anusthan</li>
            <li>Giriraj Nav-tunk Pratimaji Ashtprakari Puja</li>
            <li>Palkhi Yatra</li>
            <li>Guru Bhagwant Vaiyavach</li>
            <li>Shasan Prabhavna</li>
            <li>Sadharmik Bhakti</li>
            <li>Anukampa</li>
            <li>Jivdaya</li>
            <li>& more</li>
          </ul>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="upcoming-events">
        <h2>Upcoming Events</h2>
        <div className="events-grid">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map(event => (
              <div key={event.id} className="event-card">
                <Link to={`/events/${event.id}`}>
                  <div className="event-card-image">
                    <img src={event.image} alt={event.title} loading="lazy" />
                    <div className="event-badge">Upcoming</div>
                  </div>
                  <div className="event-card-content">
                    <h3>{event.title}</h3>
                    <p>{event.date}</p>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <p>No upcoming events available.</p>
          )}
        </div>
      </div>

      <div>
        <Footer /> {/* Add the Footer component here */}
      </div>
    </>
  );
};

export default Home;
