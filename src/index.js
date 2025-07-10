import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Donation from './pages/Donation';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Chauvihar from './pages/QuickLinks/Chauvihar';
import Shetrunjay from './pages/QuickLinks/Shetrunjay';
import Giriraj from './pages/QuickLinks/Giriraj';
import Palkhi from './pages/QuickLinks/Palkhi';
import Guru from './pages/QuickLinks/Guru';
import Shasan from './pages/QuickLinks/Shasan';
import Sadharmik from './pages/QuickLinks/Sadharmik';
import Anukampa from './pages/QuickLinks/Anukampa';
import VoteComponent from './pages/QuickLinks/VoteComponent';
import Login from "./pages/Login";
import AdminDashboard from './pages/AdminDashboard';
import DonationManagement from './pages/DonationManagement';
import RSSM from './pages/QuickLinks/RSSM';
import Rssmregistration from './pages/RssmuRegistrationManagement';
import Yatra2025ManagementPage from './pages/7Yatra2025ManagementPage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* All main routes go inside Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventDetails />} />
          <Route path="donation" element={<Donation />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="contactus" element={<Contact />} />
          <Route path="voting" element={<VoteComponent />} />
          <Route path="quicklinks/chauvihar" element={<Chauvihar />} />
          <Route path="quicklinks/shetrunjay" element={<Shetrunjay />} />
          <Route path="quicklinks/giriraj" element={<Giriraj />} />
          <Route path="quicklinks/palkhi" element={<Palkhi />} />
          <Route path="quicklinks/guru" element={<Guru />} />
          <Route path="quicklinks/shasan" element={<Shasan />} />
          <Route path="quicklinks/sadharmik" element={<Sadharmik />} />
          <Route path="quicklinks/anukampa" element={<Anukampa />} />
          <Route path="quicklinks/VoteComponent" element={<VoteComponent />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/donations" element={<DonationManagement />} />
          <Route path="/admin/rssmregistrations" element={<Rssmregistration/>} />
          <Route path="/RSSM" element={<RSSM/>} />
          <Route path="/admin/7yatra2025management" element={<Yatra2025ManagementPage />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);
