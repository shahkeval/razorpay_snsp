import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Typography, Button, CircularProgress } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';
import Yatra2025ManagementPage from './7Yatra2025ManagementPage';
import PaymentManagementPage from './PaymentManagementPage';
import Yatra2025VaiyavachManagementPage from './7Yatra2025VaiyavachManagementPage';

// Curated color palette for charts, matching the UI
const CHART_COLORS = [
  "#1ecb4f", // green
  "#1e9ecb", // blue
  "#a01ecb", // purple
  "#cb1e7c", // pink
  "#f7b731", // yellow
  "#fd9644", // orange
  "#778ca3", // gray-blue
  "#8854d0", // deep purple
  "#3867d6", // deep blue
  "#20bf6b", // teal
];

const donutDataTemplate = [
  { label: 'Donations', key: 'donations' },
  { label: 'Registrations', key: 'registrations' },
];

const AdminDashboard = () => {
  const [donationSummary, setDonationSummary] = useState({ totalAmount: 0, byCategory: [] });
  const [registrationSummary, setRegistrationSummary] = useState({ totalCount: 0, byCategory: [] });
  const [yatraSummary, setYatraSummary] = useState({ totalRecords: 0, oldCategoryCount: 0, newCategoryCount: 0 });
  const [paymentSummary, setPaymentSummary] = useState({ paid: 0, unpaid: 0 });
  const [vaiyavachSummary, setVaiyavachSummary] = useState({ totalRecords: 0, twoDaysCount: 0, fourDaysCount: 0 });
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(true);
  const [loadingYatra, setLoadingYatra] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingVaiyavach, setLoadingVaiyavach] = useState(true);
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Admin';
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchDonationSummary = async () => {
      setLoadingDonations(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/donations/summary`);
        setDonationSummary(res.data);
      } catch {
        setDonationSummary({ totalAmount: 0, byCategory: [] });
      }
      setLoadingDonations(false);
    };

    const fetchRegistrationSummary = async () => {
      setLoadingRegistrations(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/rssmsu/rsummary`);
        setRegistrationSummary(res.data);
      } catch (error) {
        setRegistrationSummary({ totalCount: 0, byCategory: [] });
      }
      setLoadingRegistrations(false);
    };

    const fetchYatraSummary = async () => {
      setLoadingYatra(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/yatriks/summary`);
        setYatraSummary(res.data);
      } catch (error) {
        setYatraSummary({ totalRecords: 0, oldCategoryCount: 0, newCategoryCount: 0 });
      }
      setLoadingYatra(false);
    };

    const fetchPaymentSummary = async () => {
      setLoadingPayments(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/yatriks/payment-status-summary`);
        setPaymentSummary(res.data.yatrik || { paid: 0, unpaid: 0 });
      } catch (error) {
        setPaymentSummary({ paid: 0, unpaid: 0 });
      }
      setLoadingPayments(false);
    };

    const fetchVaiyavachSummary = async () => {
      setLoadingVaiyavach(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/vaiyavach/vaiyavachisummary`);
        setVaiyavachSummary(res.data);
      } catch (error) {
        setVaiyavachSummary({ totalRecords: 0, twoDaysCount: 0, fourDaysCount: 0 });
      }
      setLoadingVaiyavach(false);
    };

    fetchDonationSummary();
    fetchRegistrationSummary();
    fetchYatraSummary();
    fetchPaymentSummary();
    fetchVaiyavachSummary();
  }, []);

  // Prepare donut data for donations
  const donationDonutData = donationSummary.byCategory.length > 0
    ? donationSummary.byCategory
    : [{ category: 'No Donations', amount: donationSummary.totalAmount }];

  // Prepare donut data for registrations
  const registrationDonutData = registrationSummary.byCategory.length > 0
    ? registrationSummary.byCategory
    : [{ category: 'No Registrations', amount: registrationSummary.totalCount }];

  // Prepare donut data for 7 Yatra
  const yatraDonutData = [
    { category: 'New Yatrik', count: yatraSummary.newCategoryCount },
    { category: 'Old Yatrik', count: yatraSummary.oldCategoryCount },
  ];

  // Prepare donut data for Payments (dynamic by status)
  const paymentsDonutData = Object.entries(paymentSummary).map(([status, count]) => ({
    category: status.charAt(0).toUpperCase() + status.slice(1),
    count
  }));
  const paymentsTotal = Object.values(paymentSummary).reduce((sum, v) => sum + v, 0);

  // Prepare donut data for 7 Yatra Vaiyavach
  const vaiyavachDonutData = [
    { category: '2 Days', count: vaiyavachSummary.twoDaysCount },
    { category: '4 Days', count: vaiyavachSummary.fourDaysCount },
  ];

  const donutCharts = [
    {
      label: 'Donations',
      key: 'donations',
      data: donationDonutData,
      dataKey: 'amount',
      nameKey: 'category',
      total: donationSummary.totalAmount,
      knowMore: () => navigate('/admin/donations'),
      totalSuffix: '/-'
    },
    {
      label: 'Registrations',
      key: 'registrations',
      data: registrationDonutData,
      dataKey: 'count',
      nameKey: 'category',
      total: registrationSummary.totalCount,
      knowMore: () => navigate('/admin/rssmregistrations'),
      totalSuffix: ''
    },
    {
      label: '7 Yatra Yatriks',
      key: 'yatra',
      data: yatraDonutData,
      dataKey: 'count',
      nameKey: 'category',
      total: yatraSummary.totalRecords,
      knowMore: () => navigate('/admin/7yatra2025management'),
      totalSuffix: ''
    },
    {
      label: '7 Yatra Vaiyavachis',
      key: 'vaiyavach',
      data: vaiyavachDonutData,
      dataKey: 'count',
      nameKey: 'category',
      total: vaiyavachSummary.totalRecords,
      knowMore: () => navigate('/admin/7yatra2025vaiyavachmanagement'),
      totalSuffix: ''
    },
    {
      label: 'Payments',
      key: 'payments',
      data: paymentsDonutData,
      dataKey: 'count',
      nameKey: 'category',
      total: paymentsTotal,
      knowMore: () => navigate('/admin/paymentmanagement'),
      totalSuffix: ''
    },
  ].map((item, idx) => (
    <div className="donut-chart-box" key={item.key}>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={item.data}
            dataKey={item.dataKey}
            nameKey={item.nameKey}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#1ecb4f"
            labelLine={false}
            label={false}
          >
            {item.data.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="bold" fill="#222">
            Total: {item.total}{item.totalSuffix}
          </text>
        </PieChart>
      </ResponsiveContainer>
      {/* Legend for chart slices */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: 12, marginBottom: 4, height:100 }}>
        {item.data.map((entry, i) => (
          <div key={`legend-${i}`} style={{ display: 'flex', alignItems: 'center', margin: '0 10px 4px 0' }}>
            <span style={{
              display: 'inline-block',
              width: 16,
              height: 16,
              backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
              borderRadius: 4,
              marginRight: 6,
              border: '1px solid #ccc'
            }} />
            <span style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>{entry.category}</span>
          </div>
        ))}
      </div>
      <Button
        className="know-more-btn"
        onClick={item.knowMore}
        sx={{ mt: 1, fontWeight: 'bold', color: '#222', textTransform: 'none', fontSize: 14 }}
      >
        Know More <span style={{ marginLeft: 4 }}>→</span>
      </Button>
      <Typography className="donut-label" sx={{ fontWeight: 'bold', mt: 1 }}>{item.label}</Typography>
    </div>
  ));

  return (
    <>
      <Navbar />
      <div className="admin-dashboard-root">
        <div className="admin-main-content">
          <Typography variant="h3" className="welcome-title">Welcome {username.toLowerCase()},</Typography>
          <div className="donut-row">
            {loadingDonations || loadingRegistrations || loadingYatra || loadingPayments || loadingVaiyavach ? <CircularProgress /> : donutCharts}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
