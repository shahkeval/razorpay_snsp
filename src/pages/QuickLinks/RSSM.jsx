import './RSSM.css'; // Ensure you have the CSS file imported
import events from '../../data/rssmEvents.json'; // Import your events data
import { Link } from 'react-router-dom';
import { useState } from 'react';
import Events from '../Events';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import YouTubeIcon from '@mui/icons-material/YouTube';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const RSSM = () => {
    const [activeType, setActiveType] = useState('upcoming'); // State to manage event type

    // Filter events based on type
    const upcomingEvents = events.filter(event => event.type === 'upcoming');
    const pastEvents = events.filter(event => event.type === 'past');

    const handleTypeChange = (type) => {
        setActiveType(type);
    };

    return (
        <div className="rssm-container">
            {/* Other content of your RSSM page */}
            <h1 style={{textAlign:'center'}}>Rushabh Samrajya Sanskar Mission</h1>
            <div className="video-container">
                <iframe
                    width="100%"
                    height="500"
                    src="https://www.youtube.com/embed/S4Nv-6wEXI8"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
            <div className="event-message" style={{ textAlign: 'center', margin: '20px 0' }}>
                {/* <h2>View Our Upcoming Events</h2>
                <Link to="/events">
                    <button className="tab-button" style={{ padding: '10px 20px', fontSize: '16px' }}>
                        View Events
                    </button>
                </Link> */}
                <Events flag="1"/>
            </div>
            {/* Social Media Links Section */}
            <div className="rssm-social-links">
                    
                <div className="rssm-social-icons">
                    <a href="http://instagram.com/rushabh_samrajya_2087/?igsh=MTg1M2R6Y25iM3czNA%3D%3D#" target="_blank" rel="noopener noreferrer">
                        <InstagramIcon />
                    </a>
                    <a href="https://www.facebook.com/share/1CYf4DHHTU/" target="_blank" rel="noopener noreferrer">
                        <FacebookIcon />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default RSSM;
