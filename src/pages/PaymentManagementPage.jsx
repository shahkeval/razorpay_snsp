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

const PaymentManagementPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([{ id: 'createdAt', desc: true }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [summary, setSummary] = useState({ paid: 0, unpaid: 0 });

  const DATE_FIELDS = ['createdAt', 'updatedAt', 'paymentStartedAt', 'paymentCompletedAt', 'paymentCancelledAt', 'paymentErrorAt', 'linkGeneratedAt', 'linkExpiredAt'];

  // Fetch payments from backend with server-side filtering, sorting, pagination
  const fetchPayments = async () => {
    setLoading(true);
    try {
      // Build params, handling date fields differently
      const filterParams = Object.fromEntries(
        columnFilters.map(filter => {
          if (DATE_FIELDS.includes(filter.id) && filter.value) {
            return [filter.id, filter.value];
          }
          return [filter.id, filter.value];
        })
      );
      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: globalFilter,
        sortBy: sorting[0]?.id || 'createdAt',
        order: sorting[0]?.desc ? 'desc' : 'asc',
        ...filterParams,
      };
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/yatriks/allpayments`, { params });
      setPayments(res.data.payments || []);
      setRowCount(res.data.total || 0);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to fetch payments', severity: 'error' });
      setPayments([]);
      setRowCount(0);
    }
    setLoading(false);
  };

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/yatriks/payment-status-summary`);
      // Accept both {yatrik: {paid, unpaid}} and {paid, unpaid}
      if (res.data.yatrik) {
        setSummary(res.data.yatrik);
      } else if (typeof res.data.paid === 'number' && typeof res.data.unpaid === 'number') {
        setSummary({ paid: res.data.paid, unpaid: res.data.unpaid });
      } else {
        setSummary({ paid: 0, unpaid: 0 });
      }
    } catch (error) {
      setSummary({ paid: 0, unpaid: 0 });
    }
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line
  }, [pagination, sorting, globalFilter, columnFilters]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const columns = useMemo(
    () => [
      { accessorKey: 'yatrikNo', header: 'Yatrik No', enableColumnFilter: true },
      { accessorKey: 'vaiyavachiNo', header: 'Vaiyavachi No', enableColumnFilter: true },
      { accessorKey: 'mobileNumber', header: 'Mobile Number', enableColumnFilter: true },
      { accessorKey: 'orderId', header: 'Order ID', enableColumnFilter: true },
      { accessorKey: 'paymentId', header: 'Payment ID', enableColumnFilter: true },
      { accessorKey: 'amount', header: 'Amount', enableColumnFilter: true },
      { accessorKey: 'currency', header: 'Currency', enableColumnFilter: true },
      { accessorKey: 'status', header: 'Status', enableColumnFilter: true },
      { accessorKey: 'linkState', header: 'Link State', enableColumnFilter: true },
      { accessorKey: 'link', header: 'Payment Link', enableColumnFilter: false,
        Cell: ({ cell }) => cell.getValue() ? (
          <a href={cell.getValue()} target="_blank" rel="noopener noreferrer">Link</a>
        ) : null,
      },
      { accessorKey: 'createdAt', header: 'Created At', enableColumnFilter: true },
      { accessorKey: 'updatedAt', header: 'Updated At', enableColumnFilter: true },
      { accessorKey: 'paymentCompletedAt', header: 'Payment Completed At', enableColumnFilter: true },
    ],
    []
  );

  const handleExcelDownload = () => {
    const data = payments.map(({ _id, __v, ...rest }) => rest);
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments');
    XLSX.writeFile(workbook, 'payments.xlsx');
  };

  const table = useMaterialReactTable({
    columns,
    data: payments,
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
    muiTableHeadCellProps: ({ column }) => (
      { sx: { color: '#6d4c00', fontWeight: 'bold' } }
    ),
    muiTableBodyCellProps: ({ column }) => (
      { sx: { color: '#4e3c0a' } }
    ),
  });

  return (
    <>
      <Navbar />
      <div className="rssmu-registration-management-main">
        <Typography variant="h4" gutterBottom sx={{ color: '#6d4c00', fontWeight: 'bold', textAlign: 'center' }}>
          Payment Management
        </Typography>
        <div className="vaiyavach-summary-grid">
          {Object.entries(summary).map(([status, count]) => (
            <div className="vaiyavach-summary-card" key={status}>
              <span className="label">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
              <span className="value">{count}</span>
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

export default PaymentManagementPage; 