import React, { useState, useEffect } from 'react';
import './About.css'; // Create a new CSS file for styling
import Footer from '../components/Footer'; // Import the Footer component
import Breadcrumb from '../components/Breadcrumb';

const teamImages = [
  '/images/group1.jpg',
  '/images/group2.jpg',
  '/images/group3.jpg',
  '/images/group4.jpg',
  '/images/group6.jpg',
  '/images/group7.jpg',
  // Add more images as needed
];

const About = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % teamImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <>
    <section className="about-section">
     
      <div className="text-section">
      <h1 style={{marginTop: "0px"}}>અમારા વિષે</h1>
        <p style={{textAlign:'justify'}}>
          બાપજી મહારાજ ના સમુદાયના આચાર્ય ભગવંત શ્રી ભદ્રંકરસૂરીશ્વરજી મ સા ના પ્રશિષ્ય નરરત્નસૂરીશ્વરજી મ સા ની પાવન પ્રેરણાથી છેલ્લા 21 વર્ષથી શાસનની સેવા કરી રહેલ નમો નમ: શાશ્વત પરિવાર ની સ્થાપના સંવત ૨૦૬૦ (વર્ષ 2003) માં ફક્ત ૫ યુવાનોથી થઈ હતી, જે આજે ૨૫૦ થી વધુ ધર્મપ્રેમી યુવાનો સંસ્થા ની અનેકવિધ પ્રવૃત્તિઓમાં જોડાયેલા છે. શાસન જયવંતુ છે એક માત્ર લક્ષ્ય બનાવીને શાસનના અનેકવિધ કાર્ય સાથે જોડાયેલ અમારી આ સંસ્થા અનેક ગુરૂ ભગવંત ના માર્ગદર્શન હેઠળ કાર્યો અમદાવાદ રાજનગર સુધી સીમિત ન રહેતા સમગ્ર ભારતભરમાં પોતાના ધર્મકાર્યોથી સુવાસિત બન્યું છે. સંસ્થા નું કાર્ય સાત જાત્રા કરાવવાની પ્રવૃતિથી શરૂ કરીને આજે તીર્થ રક્ષાના કાર્યો, મહાત્મા ની પાલખી નું સંચાલન, સાધુ સાધ્વીજી વૈયાવચ્ચ, ચાતુર્માસ દરમ્યાન બાળકો માટે તપ અભિયાન, સાધર્મિક સહાય, અનુકંપા અભિયાન, જીવદયાની અનેક પ્રવૃતિ ધ્વારા શાસનની સેવા કરી રહ્યું છે. બોડેલી ની આસપાસના આદિવાસી બાળકો ના સંસ્કરણ માટે ૨૦ જેટલા ગામમાં જૈન પાઠશાળા ચાલુ છે. ધીણોજ તીર્થ મધ્યે ૭૦ જેટલા જૈનેતર બાળકો નુ નિશુલ્ક ગુરૂકુળ ચાલી રહેલ છે. નિત્ય આરાધના જેવી કે બેસણા, પ્રતિકમણ તથા ચોવિહાર વગેરે ધર્મપ્રવૃતિને જીવનમાં ઉતારનારા યુવાનોએ અમારા ગ્રુપની શોભા વધારી છે.
        </p>
        <h2>ઉપકાર સ્મરણ</h2>
        <p style={{textAlign:'justify'}}>
          શ્રી શત્રુંજય ગિરિરાજ તીર્થમંડન શ્રી આદિનાથ દાદા અને શ્રી ધીણોજ તીર્થમંડન શ્રી જોટવા પાર્શ્વનાથ દાદાની અનહદ કૃપા અને બાપજી મહારાજ સાહેબ અને ભદ્રંકરસૂરીશ્વરજી મ સા ના દિવ્ય આશીષ અને આચાર્ય ભગવંત શ્રી નરરત્નસૂરીશ્વરજી મ સા નુ સાનિધ્ય, માર્ગદર્શન, પ્રેરણા અને આશીર્વાદ અને અનેક પૂજ્ય ગુરૂ ભગવંતોના અંતરના આશિષ અમારો પ્રેરણા સ્તોત્ર છે.
        </p>
       
      </div>
      <h1 style={{marginTop: "0px" , marginBottom:"0px"}}>Our Team</h1>
       <div className="image-carousel">
        <img src={teamImages[currentImageIndex]} alt="Team Member" />
      </div>
      <div className="summary-section">
       
      <h1 style={{marginTop: "0px"}}>About Us</h1>
        <p style={{textAlign:'justify'}}>
          Namo Namah Eternal Family, which has been serving the government for the last 21 years with the holy inspiration of Acharya Bhagwant Shri Bhadraankar Surishwar Ji, a disciple of Bapji Maharaj, was established in the year 2060 with only 5 youths, today more than 250 devout youths are engaged in various activities of the organization. Our organization, which is associated with the multiple tasks of governance with a single goal, under the guidance of many Guru Bhagwants, the work is not limited to Ahmedabad and Rajnagar, but it has become fragrant with its religious works all over India. Starting from the activities of conducting seven yatras, today the organization is serving the government through the activities of protection of pilgrimage, management of Mahatma's palanquin, Sadhu Sadhvi Vayavachya, penance campaign for children during Chaturmas, spiritual help, compassion campaign, Jivdaya etc. Jain Pathshalas are running in about 20 villages for the education of tribal children around Bodeli. There is a free gurukul for 70 non-Jain children in Dhinoj Teerth. The youth who inculcate religious practices like sitting, pratikamana and chowhihar have added to the beauty of our group.
        </p>
        <h2>Grateful Remembrance</h2>
        <p style={{textAlign:'justify'}}>
          Shree Shatrunjay Giriraj Teerthmandan Shree Adinath Dada and Shree Dhinoj Teerthmandan Shree Jotwa Parshvanath Dada's unending grace and divine blessings of Bapji Maharaj Saheb and Bhadraankar Surishwar Ji Maa Saa and Acharya Bhagwant Shree Narratnasurishwar Ji Maa Saa's closeness, guidance, inspiration and blessings and the blessings of many revered Guru Bhagwants.
        </p>
       
      </div>
    </section>
    <Footer/>
  </>
  );
};

export default About;
