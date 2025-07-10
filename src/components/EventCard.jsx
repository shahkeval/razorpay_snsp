import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EventCard.css';
import DateRangeIcon from '@mui/icons-material/DateRange';
import LocationPinIcon from '@mui/icons-material/LocationPin';
const EventCard = ({ event }) => {
  const navigate = useNavigate();
  
  // // Format date for better display
  // const formatDate = (dateString) => {
  //   const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  //   return new Date(dateString).toLocaleDateString(undefined, options);
  // };

  return (
    <div className="event-card" onClick={() => navigate(`/events/${event.id}`)}>
      <div className="event-card-image">
        <img src={event.image} alt={event.title} loading="lazy" />
        {event.type === 'upcoming' && (
          <div className="event-badge">Upcoming</div>
        )}
      </div>
      <div className="event-card-content">
        <h3>{event.title}</h3>
        <div className="event-meta">
          <div className="meta-item">
          <DateRangeIcon/>
            <p>{event.date ? event.date : 'Date TBA'}</p>
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
  );
};

export default EventCard;