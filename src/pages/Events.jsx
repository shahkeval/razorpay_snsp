import React, { useState } from 'react';
import {  useLocation, useNavigate } from 'react-router-dom';
import events from '../data/events';
import './Events.css';
import DateRangeIcon from '@mui/icons-material/DateRange';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import Footer from '../components/Footer';

const Events = ({flag}) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [activeType, setActiveType] = useState(params.get('type') || 'upcoming');
  const navigate = useNavigate();

  const handleTypeChange = (type) => {
    setActiveType(type);
  };

  const filteredEvents = events.filter(event => event.type === activeType && (!flag || event.flag === flag) );

  return (
    <>
    <div className="events-container">
      <div className="events-header">
        <h1 style={{marginTop: "0px"}}>Our Events</h1>
        <p>Join us at our upcoming events or explore our past gatherings</p>
      </div>

      <div className="events-tabs">
        <button 
          className={`tab-button ${activeType === 'upcoming' ? 'active' : ''}`}
          onClick={() => handleTypeChange('upcoming')}
        >
          Upcoming Events
        </button>
        <button 
          className={`tab-button ${activeType === 'past' ? 'active' : ''}`}
          onClick={() => handleTypeChange('past')}
        >
          Events
        </button>
      </div>

      <div className="events-grid">
        {filteredEvents.length ? (
          filteredEvents.map(event => (
              <div key={event.id} className="event-card" onClick={() => navigate(`/events/${event.id}`)}>
                <div className="event-card-image">
                  <img src={event.image} alt={event.title} loading="lazy" />
                  {event.type === 'upcoming' && (
                    <div className="event-badge">Upcoming</div>
                  )}
                </div>
                <div className="event-card-content">
                  <h3 style={{textAlign:'start'}}>{event.title}</h3>
                  <div className="event-meta">
                    <div className="meta-item">
                      <DateRangeIcon/>
                      <p style={{textAlign:'start'}}>{event.date ? event.date : 'Date TBA'}</p>
                    </div>
                    {event.location && (
                      <div className="meta-item">
                        <LocationPinIcon/>
                        <p>{event.location}</p>
                      </div>
                    )}
                  </div>
                  <p className="event-description-text" style={{textAlign:'justify'}}>
                    {event.description.split('\\n').map((line, idx) => (
                      <React.Fragment key={idx}>
                        {line}
                      </React.Fragment>
                    ))}
                  </p>
                  <button className="view-details-btn">View Details</button>
                </div>
              </div>
          ))
        ) : (
          <div className="no-events">
            <h3>No events found</h3>
            <p>There are currently no events scheduled. Please check back after some time.🙏</p>
          </div>
        )}
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default Events;