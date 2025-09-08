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

const PaintingRegistrationManagementPage = () => {
  const [paintings, setPaintings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([{ id: 'paintingNo', desc: false }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [summary, setSummary] = useState({ totalCount: 0, byPaintingType: [] });

  // Fetch paintings from backend with server-side filtering, sorting, pagination
  const fetchPaintings = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: globalFilter,
        sortBy: sorting[0]?.id || 'paintingNo',
        order: sorting[0]?.desc ? 'desc' : 'asc',
        ...Object.fromEntries(columnFilters.map(filter => [filter.id, filter.value])),
      };
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/painting_rssm/get_paint`, { params });
      setPaintings(res.data.registrations || []);
      setRowCount(res.data.total || 0);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to fetch registrations', severity: 'error' });
      setPaintings([]);
      setRowCount(0);
    }
    setLoading(false);
  };

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/painting_rssm/summarybypaintingtype`);
      setSummary(res.data || { totalCount: 0, byPaintingType: [] });
    } catch (error) {
      setSummary({ totalCount: 0, byPaintingType: [] });
    }
  };

  useEffect(() => {
    fetchPaintings();
    // eslint-disable-next-line
  }, [pagination, sorting, globalFilter, columnFilters]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const columns = useMemo(
    () => [
      { accessorKey: 'paintingNo', header: 'Reg. No.', enableColumnFilter: true },
      { accessorKey: 'name', header: 'Name', enableColumnFilter: true },
      { accessorKey: 'contact', header: 'Contact', enableColumnFilter: true },
      { accessorKey: 'gender', header: 'Gender', enableColumnFilter: true },
      { accessorKey: 'area', header: 'Area', enableColumnFilter: true },
      { accessorKey: 'sanghName', header: 'Sangh Name', enableColumnFilter: true },
      { accessorKey: 'state', header: 'State', enableColumnFilter: true },
      { accessorKey: 'city', header: 'City', enableColumnFilter: true },
      { accessorKey: 'ageGroup', header: 'Age Group', enableColumnFilter: true },
      // { accessorKey: 'paintingType', header: 'Type of Painting', enableColumnFilter: true },
      { accessorKey: 'createdAt', header: 'Date', enableColumnFilter: true, Cell: ({ cell }) => cell.getValue() ? new Date(cell.getValue()).toLocaleString() : '' },
    ],
    []
  );

  const handleExcelDownload = () => {
    const data = paintings.map(({ _id, __v, ...rest }) => rest);
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Paintings');
    XLSX.writeFile(workbook, 'painting_registrations.xlsx');
  };

  const table = useMaterialReactTable({
    columns,
    data: paintings,
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
      column.id === 'paintingNo'
        ? { sx: { color: '#6d4c00', fontWeight: 'bold', position: 'sticky', left: 0, zIndex: 2 } }
        : { sx: { color: '#6d4c00', fontWeight: 'bold' } },
    muiTableBodyCellProps: ({ column }) =>
      column.id === 'paintingNo'
        ? { sx: { color: '#4e3c0a', position: 'sticky', left: 0, zIndex: 1 } }
        : { sx: { color: '#4e3c0a' } },
  });

  return (
    <>
      <Navbar />
      <div className="rssmu-registration-management-main">
        <Typography variant="h4" gutterBottom sx={{ color: '#6d4c00', fontWeight: 'bold', textAlign: 'center' }}>
          Painting Competition Registration Management
        </Typography>
        <div className="vaiyavach-summary-grid">
          <div className="vaiyavach-summary-card">
            <span className="label">Total Registrations</span>
            <span className="value">{summary.totalCount}</span>
          </div>
          {summary.byPaintingType.map((item, idx) => (
            <div className="vaiyavach-summary-card" key={item.ageGroup}>
              <span className="label">{item.ageGroup}</span>
              <span className="value">{item.count}</span>
            </div>
          ))}
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

export default PaintingRegistrationManagementPage; 