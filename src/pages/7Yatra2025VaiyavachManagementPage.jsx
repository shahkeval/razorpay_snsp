import React, { useEffect, useMemo, useState } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  Grid,
  Paper,
} from '@mui/material';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import * as XLSX from 'xlsx';
import './7Yatra2025VaiyavachManagementPage.css';

const Yatra2025VaiyavachManagementPage = () => {
  const [vaiyavachis, setVaiyavachis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([{ id: 'vaiyavachNo', desc: false }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [summary, setSummary] = useState({ totalRecords: 0, twoDaysCount: 0, fourDaysCount: 0 });
  const [typeSummary, setTypeSummary] = useState({
    howToReachPalitana: { with_us: 0, direct_palitana: 0 },
    typeOfVaiyavach: { spot: 0, roamming: 0, chaityavandan: 0 }
  });

  const DATE_FIELDS = ['dob', 'createdAt', 'updatedAt'];

  // Fetch vaiyavachis from backend with server-side filtering, sorting, pagination
  const fetchVaiyavachis = async () => {
    setLoading(true);
    try {
      // Build params, handling date fields differently
      const filterParams = Object.fromEntries(
        columnFilters.map(filter => {
          if (DATE_FIELDS.includes(filter.id) && filter.value) {
            // Try to parse as date, send as is (exact match)
            return [filter.id, filter.value];
          }
          return [filter.id, filter.value];
        })
      );
      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: globalFilter,
        sortBy: sorting[0]?.id || 'vaiyavachNo',
        order: sorting[0]?.desc ? 'desc' : 'asc',
        ...filterParams,
      };
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/vaiyavach/getvaiyavchi`, { params });
      setVaiyavachis(res.data.vaiyavachis || []);
      setRowCount(res.data.total || 0);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to fetch vaiyavachis', severity: 'error' });
      setVaiyavachis([]);
      setRowCount(0);
    }
    setLoading(false);
  };

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/vaiyavach/vaiyavachisummary`);
      setSummary(res.data || { totalRecords: 0, twoDaysCount: 0, fourDaysCount: 0 });
    } catch (error) {
      setSummary({ totalRecords: 0, twoDaysCount: 0, fourDaysCount: 0 });
    }
  };

  // Fetch type summary
  const fetchTypeSummary = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/vaiyavach/type-summary`);
      setTypeSummary(res.data || {
        howToReachPalitana: { with_us: 0, direct_palitana: 0 },
        typeOfVaiyavach: { spot: 0, roamming: 0, chaityavandan: 0 }
      });
    } catch (error) {
      setTypeSummary({
        howToReachPalitana: { with_us: 0, direct_palitana: 0 },
        typeOfVaiyavach: { spot: 0, roamming: 0, chaityavandan: 0 }
      });
    }
  };

  useEffect(() => {
    fetchVaiyavachis();
    // eslint-disable-next-line
  }, [pagination, sorting, globalFilter, columnFilters]);

  useEffect(() => {
    fetchSummary();
    fetchTypeSummary();
  }, []);

  const columns = useMemo(
    () => [
      { accessorKey: 'vaiyavachNo', header: 'Vaiyavach No', enableColumnFilter: true },
      {
        accessorKey: 'vaiyavachiImage',
        header: 'Vaiyavachi Photo',
        enableColumnFilter: false,
        Cell: ({ cell }) => cell.getValue() ? (
          <a href={cell.getValue()} target="_blank" rel="noopener noreferrer">
            <img src={cell.getValue()} alt="Vaiyavachi" style={{ height: 60, borderRadius: 6 }} />
          </a>
        ) : null,
      },
      { accessorKey: 'name', header: 'Name', enableColumnFilter: true },
      { accessorKey: 'mobileNumber', header: 'Mobile', enableColumnFilter: true },
      { accessorKey: 'whatsappNumber', header: 'WhatsApp', enableColumnFilter: true },
      { accessorKey: 'emailAddress', header: 'Email', enableColumnFilter: true },
      { accessorKey: 'education', header: 'Education', enableColumnFilter: true },
      { accessorKey: 'religiousEducation', header: 'Religious Education', enableColumnFilter: true },
      { accessorKey: 'weight', header: 'Weight', enableColumnFilter: true },
      { accessorKey: 'height', header: 'Height', enableColumnFilter: true },
      { accessorKey: 'dob', header: 'DOB', enableColumnFilter: true },
      { accessorKey: 'address', header: 'Address', enableColumnFilter: true },
      { accessorKey: 'city', header: 'City', enableColumnFilter: true },
      { accessorKey: 'state', header: 'State', enableColumnFilter: true },
      { accessorKey: 'familyMemberName', header: 'Family Member Name', enableColumnFilter: true },
      { accessorKey: 'relation', header: 'Relation', enableColumnFilter: true },
      { accessorKey: 'familyMemberWANumber', header: 'Family Member WA Number', enableColumnFilter: true },
      { accessorKey: 'emergencyNumber', header: 'Emergency Number', enableColumnFilter: true },
      { accessorKey: 'is7YatraDoneEarlier', header: 'is7YatraDoneEarlier', enableColumnFilter: true },
      { accessorKey: 'haveYouDoneVaiyavachEarlier', header: 'Done Vaiyavach Earlier', enableColumnFilter: true },
      { accessorKey: 'howToReachPalitana', header: 'How To Reach Palitana', enableColumnFilter: true },
      { accessorKey: 'howManyDaysJoin', header: 'How Many Days Join', enableColumnFilter: true },
      { accessorKey: 'typeOfVaiyavach', header: 'Type Of Vaiyavach', enableColumnFilter: true },
      { accessorKey: 'valueOfVaiyavach', header: 'Value Of Vaiyavach', enableColumnFilter: true },
      { accessorKey: 'vaiyavachiConfirmation', header: 'Vaiyavachi Confirmation', enableColumnFilter: true },
      { accessorKey: 'familyConfirmation', header: 'Family Confirmation', enableColumnFilter: true },
      { accessorKey: 'transactionNumber', header: 'Transaction No', enableColumnFilter: true },
      { accessorKey: 'isPaid', header: 'Is Paid', enableColumnFilter: true },
      { accessorKey: 'paymentLink', header: 'Payment Link', enableColumnFilter: false,
        Cell: ({ cell, row }) => {
          const link = cell.getValue();
          return link ? (
            <a href={link} target="_blank" rel="noopener noreferrer">Link</a>
          ) : null;
        },
      },
    ],
    []
  );

  const handleExcelDownload = () => {
    const data = vaiyavachis.map(({ _id, __v, ...rest }) => rest);
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vaiyavachis');
    XLSX.writeFile(workbook, '7yatra2025_vaiyavachis.xlsx');
  };

  const table = useMaterialReactTable({
    columns,
    data: vaiyavachis,
    initialState: { density: 'compact' },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount,
    state: {
      isLoading: loading,
      pagination,
      sorting,
      globalFilter,
      columnFilters,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="contained" onClick={handleExcelDownload} style={{ margin: '0', background: '#964b00', color: '#fff' }}>
          Download Excel
        </Button>
      </Box>
    ),
    muiTablePaperProps: {
      sx: { background: '#fffbe6' },
    },
    muiTableHeadCellProps: ({ column }) =>
      column.id === 'vaiyavachNo'
        ? { sx: { color: '#6d4c00', fontWeight: 'bold', position: 'sticky', left: 0, zIndex: 2 } }
        : { sx: { color: '#6d4c00', fontWeight: 'bold' } },
    muiTableBodyCellProps: ({ column }) =>
      column.id === 'vaiyavachNo'
        ? { sx: { color: '#4e3c0a', position: 'sticky', left: 0, zIndex: 1 } }
        : { sx: { color: '#4e3c0a' } },
  });

  return (
    <>
      <Navbar />
      <div className="rssmu-registration-management-main">
        <Typography variant="h4" gutterBottom sx={{ color: '#6d4c00', fontWeight: 'bold', textAlign: 'center' }}>
          7 Yatra 2025 Vaiyavach Management
        </Typography>
        <div className="vaiyavach-summary-grid">
          <div className="vaiyavach-summary-card">
            <span className="label">With Us</span>
            <span className="value">{typeSummary.howToReachPalitana.with_us}</span>
          </div>
          <div className="vaiyavach-summary-card">
            <span className="label">Direct Palitana</span>
            <span className="value">{typeSummary.howToReachPalitana.direct_palitana}</span>
          </div>
          <div className="vaiyavach-summary-card">
            <span className="label">Spot</span>
            <span className="value">{typeSummary.typeOfVaiyavach.spot}</span>
          </div>
          <div className="vaiyavach-summary-card">
            <span className="label">Roamming</span>
            <span className="value">{typeSummary.typeOfVaiyavach.roamming}</span>
          </div>
          <div className="vaiyavach-summary-card">
            <span className="label">Chaityavandan</span>
            <span className="value">{typeSummary.typeOfVaiyavach.chaityavandan}</span>
          </div>
        </div>
        <div className="rssmu-registration-management-content">
          <MaterialReactTable table={table} className="registration-table" />
        </div>
      </div>
      <Footer />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Yatra2025VaiyavachManagementPage; 