import React from 'react';
import './Footer.css'; // Ensure you have the CSS file for styling
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import YouTubeIcon from '@mui/icons-material/YouTube';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-info">
          <div className="footer-map">
          <iframe
            title="Shramni Vihar Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3672.115890063812!2d72.55188197515595!3d23.014456979165306!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e85000423b5b7%3A0x69b6611c8f73997c!2sShree%20siddhi%20bhadrankar%20shramni%20vihar!5e0!3m2!1sen!2sin!4v1715941335010!5m2!1sen!2sin"
            width="100%"
            height="200"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
          </div>
          <div className="footer-contact">
          
            <div className="social-icons">
              <a href="https://www.instagram.com/namonamahshaswatparivar/profilecard/?igsh=MTVpemN5bjViZzNqZw==" target="_blank" rel="noopener noreferrer"><InstagramIcon/></a>
              <a href="https://www.facebook.com/namonamhshaswatparivar?mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer"><FacebookIcon/></a>
              <a href="http://www.youtube.com/@namonamahShaswatparivar" target="_blank" rel="noopener noreferrer"><YouTubeIcon/></a>
              <a href="https://chat.whatsapp.com/DdNY8vdh03K0cPouuBZupT" target="_blank" rel="noopener noreferrer"><WhatsAppIcon/></a>
            </div>
            <div className="footer-links">
          <ul>
            
          </ul>
          <p>Address: 5, Sharda Mandir Rd,nr. Sugam Residency Gardenia,<br></br> Sukhipura, Vasantkunj Society, and, Paldi,<br></br> Ahmedabad, Gujarat 380007</p>
          <div className='pfornumber'>
          <p>Phone: +91 9426364451 , 9081233222</p>
          </div>
          <p>&copy; {new Date().getFullYear()} Namo Namah Shaswat Parivar. All rights reserved.</p>
        </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
