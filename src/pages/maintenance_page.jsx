import React from "react";
import { Link } from "react-router-dom";
import "./maintenance_page.css";

export const MaintenanceCard = () => (
  <main
    className="maintenance-card"
    role="main"
    aria-labelledby="maintenance-title"
  >
    <div className="maintenance-illustration" aria-hidden>
      <svg
        width="150"
        height="150"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="gear"
      >
        <defs>
          <linearGradient id="gearGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#700b0b" />
            <stop offset="100%" stopColor="#a32020" />
          </linearGradient>
        </defs>

        <path
          d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z"
          fill="url(#gearGrad)"
        />

        <path
          d="M19.4 15a1 1 0 0 0 .2 1.1l.2.2a1 1 0 0 1 0 1.4l-1 1a1 1 0 0 1-1.4 0l-.2-.2a1 1 0 0 0-1.1-.2 6.9 6.9 0 0 1-1.9.8 1 1 0 0 0-.8 1v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1a1 1 0 0 0-.8-1 6.9 6.9 0 0 1-1.9-.8 1 1 0 0 0-1.1.2l-.2.2a1 1 0 0 1-1.4 0l-1-1a1 1 0 0 1 0-1.4l.2-.2a1 1 0 0 0 .2-1.1 6.9 6.9 0 0 1-.8-1.9 1 1 0 0 0-1-.8H3a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-.8c.1-.7.3-1.3.6-1.9a1 1 0 0 0-.2-1.1L3.2 6a1 1 0 0 1 0-1.4l1-1A1 1 0 0 1 5.6 3l.2.2a1 1 0 0 0 1.1.2c.5-.3 1.1-.5 1.9-.6a1 1 0 0 0 .8-1V1a1 1 0 0 1 1-1h1c.5 0 .9.4 1 .9v1a1 1 0 0 0 .8 1c.7.1 1.4.3 1.9.6a1 1 0 0 0 1.1-.2l.2-.2A1 1 0 0 1 19.4 3l1 1a1 1 0 0 1 0 1.4l-.2.2a1 1 0 0 0-.2 1.1c.3.6.5 1.2.6 1.9a1 1 0 0 0 1 .8h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1a1 1 0 0 0-1 .8c-.1.7-.3 1.3-.6 1.9z"
          fill="#faedc0"
          opacity="0.85"
        />
      </svg>
    </div>

    <h1 id="maintenance-title">We’ll Be Back Shortly</h1>

    <p className="lead">
      Our system is currently undergoing scheduled maintenance for this event and to serve you
      better.
    </p>

    <div className="meta">
      <p>
        Need help?{" "}
        <a href="mailto:namonamahshashwatparivar9@gmail.com">Contact Support</a>
      </p>
      <p className="eta">
        Estimated downtime: <strong>~72 hour</strong>
      </p>
    </div>

    <div className="actions">
      <Link to="/" className="btn primary">
        Go to Home
      </Link>
      <a
        className="btn outline"
        href="https://chat.whatsapp.com/DdNY8vdh03K0cPouuBZupT"
        target="_blank"
        rel="noopener noreferrer"
      >
        Join WhatsApp
      </a>
    </div>

    <div className="small-note">
      Thank you for your patience. Service will resume automatically.
    </div>
  </main>
);

const MaintenancePage = () => (
  <div className="maintenance-page">
    <MaintenanceCard />
  </div>
);

export default MaintenancePage;
