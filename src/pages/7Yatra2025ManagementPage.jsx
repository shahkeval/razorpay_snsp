import React, { useEffect, useMemo, useState } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import * as XLSX from 'xlsx';
import './7Yatra2025VaiyavachManagementPage.css';

const Yatra2025ManagementPage = () => {
  const [yatriks, setYatriks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([{ id: 'yatrikNo', desc: false }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [howToReachSummary, setHowToReachSummary] = useState({ with_us: 0, direct_palitana: 0 });

  // Fetch yatriks from backend with server-side filtering, sorting, pagination
  const fetchYatriks = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: globalFilter,
        sortBy: sorting[0]?.id || 'yatrikNo',
        order: sorting[0]?.desc ? 'desc' : 'asc',
        ...Object.fromEntries(columnFilters.map(filter => [filter.id, filter.value])),
      };
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/yatriks/getallyatrik`, { params });
      setYatriks(res.data.yatriks || []);
      setRowCount(res.data.total || 0);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to fetch yatriks', severity: 'error' });
      setYatriks([]);
      setRowCount(0);
    }
    setLoading(false);
  };

  // Fetch howToReachPalitana summary
  const fetchHowToReachSummary = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/yatriks/howtoreach-summary`);
      setHowToReachSummary(res.data || { with_us: 0, direct_palitana: 0 });
    } catch (error) {
      setHowToReachSummary({ with_us: 0, direct_palitana: 0 });
    }
  };

  useEffect(() => {
    fetchYatriks();
    // eslint-disable-next-line
  }, [pagination, sorting, globalFilter, columnFilters]);

  useEffect(() => {
    fetchHowToReachSummary();
  }, []);

  const columns = useMemo(
    () => [
      { accessorKey: 'yatrikNo', header: 'Yatrik No', enableColumnFilter: true },
      {
        accessorKey: 'yatrikPhoto',
        header: 'Yatrik Photo',
        enableColumnFilter: false,
        Cell: ({ cell }) => cell.getValue() ? (
          <a href={process.env.REACT_APP_API_BASE_URL + cell.getValue()} target="_blank" rel="noopener noreferrer">
            <img src={process.env.REACT_APP_API_BASE_URL + cell.getValue()} alt="Yatrik" style={{ height: 60, borderRadius: 6 }} />
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
      {
        accessorKey: 'is7YatraDoneEarlier',
        header: 'is7YatraDoneEarlier',
        enableColumnFilter: true,
        Cell: ({ cell }) => String(cell.getValue()),
        filterFn: (row, id, filterValue) => {
          const val = String(row.getValue(id)).toLowerCase();
          const filter = String(filterValue).toLowerCase();
          return val === filter;
        },
      },
      { accessorKey: 'earlier7YatraCounts', header: 'Earlier 7 Yatra Counts', enableColumnFilter: true },
      { accessorKey: 'howToReachPalitana', header: 'How To Reach Palitana', enableColumnFilter: true },
      {
        accessorKey: 'yatrikConfirmation',
        header: 'Yatrik Confirmation',
        enableColumnFilter: true,
        Cell: ({ cell }) => String(cell.getValue()),
        filterFn: (row, id, filterValue) => {
          const val = String(row.getValue(id)).toLowerCase();
          const filter = String(filterValue).toLowerCase();
          return val === filter;
        },
      },
      {
        accessorKey: 'familyConfirmation',
        header: 'Family Confirmation',
        enableColumnFilter: true,
        Cell: ({ cell }) => String(cell.getValue()),
        filterFn: (row, id, filterValue) => {
          const val = String(row.getValue(id)).toLowerCase();
          const filter = String(filterValue).toLowerCase();
          return val === filter;
        },
      },
      { accessorKey: 'isPaid', header: 'Is Paid', enableColumnFilter: true },
      { accessorKey: 'paymentLink', header: 'Payment Link', enableColumnFilter: false,
        Cell: ({ cell }) => cell.getValue() ? (
          <a href={cell.getValue()} target="_blank" rel="noopener noreferrer">Link</a>
        ) : null,
      },
    ],
    []
  );

  const handleExcelDownload = () => {
    const data = yatriks.map(({ _id, __v, ...rest }) => rest);
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Yatriks');
    XLSX.writeFile(workbook, '7yatra2025_yatriks.xlsx');
  };

  const table = useMaterialReactTable({
    columns,
    data: yatriks,
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
      column.id === 'yatrikNo'
        ? { sx: { color: '#6d4c00', fontWeight: 'bold', position: 'sticky', left: 0, zIndex: 2 } }
        : { sx: { color: '#6d4c00', fontWeight: 'bold' } },
    muiTableBodyCellProps: ({ column }) =>
      column.id === 'yatrikNo'
        ? { sx: { color: '#4e3c0a', position: 'sticky', left: 0, zIndex: 1 } }
        : { sx: { color: '#4e3c0a' } },
  });

  return (
    <>
      <Navbar />
      <div className="rssmu-registration-management-main">
        <Typography variant="h4" gutterBottom sx={{ color: '#6d4c00', fontWeight: 'bold', textAlign: 'center' }}>
          7 Yatra 2025 Management
        </Typography>
        <div className="vaiyavach-summary-grid">
          <div className="vaiyavach-summary-card">
            <span className="label">With Us</span>
            <span className="value">{howToReachSummary.with_us}</span>
          </div>
          <div className="vaiyavach-summary-card">
            <span className="label">Direct Palitana</span>
            <span className="value">{howToReachSummary.direct_palitana}</span>
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

export default Yatra2025ManagementPage; 