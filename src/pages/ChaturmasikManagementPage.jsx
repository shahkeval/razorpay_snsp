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
import * as XLSX from 'xlsx';
import './ChaturmasikManagementPage.css';

const ChaturmasikManagementPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([{ id: 'chaturmasikNo', desc: false }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [summary, setSummary] = useState({ totalCount: 0, bySamayik: [], byNavkar: [], bySwadhyay: [], byBrahmacharya: [] });

  const DATE_FIELDS = ['dateOfBirth', 'createdAt', 'updatedAt'];

  // Fetch registrations from backend with server-side filtering, sorting, pagination
  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const filterParams = Object.fromEntries(
        columnFilters.map(filter => [filter.id, filter.value])
      );
      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: globalFilter,
        sortBy: sorting[0]?.id || 'chaturmasikNo',
        order: sorting[0]?.desc ? 'desc' : 'asc',
        ...filterParams,
      };
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/chaturmasik/allchaturmasikreg`, { params });
      setRegistrations(res.data.registrations || []);
      setRowCount(res.data.total || 0);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to fetch registrations', severity: 'error' });
      setRegistrations([]);
      setRowCount(0);
    }
    setLoading(false);
  };

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/chaturmasik/summary`);
      setSummary(res.data || { totalCount: 0, bySamayik: [], byNavkar: [], bySwadhyay: [], byBrahmacharya: [] });
    } catch (error) {
      setSummary({ totalCount: 0, bySamayik: [], byNavkar: [], bySwadhyay: [], byBrahmacharya: [] });
    }
  };

  useEffect(() => {
    fetchRegistrations();
    // eslint-disable-next-line
  }, [pagination, sorting, globalFilter, columnFilters]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const columns = useMemo(
    () => [
      { accessorKey: 'chaturmasikNo', header: 'ID', enableColumnFilter: true },
      { accessorKey: 'name', header: 'Name', enableColumnFilter: true },
      { accessorKey: 'phone', header: 'Phone', enableColumnFilter: true },
      {
        accessorKey: 'dateOfBirth',
        header: 'DOB',
        enableColumnFilter: true,
        Cell: ({ cell }) => cell.getValue() ? new Date(cell.getValue()).toLocaleDateString("en-GB") : '',
      },
      { accessorKey: 'address', header: 'Address', enableColumnFilter: true },
      { accessorKey: 'city', header: 'City', enableColumnFilter: true },
      { accessorKey: 'state', header: 'State', enableColumnFilter: true },
      { accessorKey: 'sanghName', header: 'Sangh Name', enableColumnFilter: true },
      {
        accessorKey: 'samayik',
        header: 'Samayik Target',
        enableColumnFilter: true,
        Cell: ({ cell }) => cell.getValue() ? `${cell.getValue()} Samayik` : 'Skipped',
      },
      {
        accessorKey: 'navkar',
        header: 'Navkar Target',
        enableColumnFilter: true,
        Cell: ({ cell }) => cell.getValue() ? `${cell.getValue()} Mala` : 'Skipped',
      },
      {
        accessorKey: 'swadhyay',
        header: 'Swadhyay (અરિહંત વંદનાવલી)',
        enableColumnFilter: true,
        Cell: ({ cell }) => cell.getValue() ? 'Learned' : 'Skipped',
      },
      {
        accessorKey: 'brahmacharya',
        header: 'Sajode Brahmacharya',
        enableColumnFilter: true,
        Cell: ({ cell }) => cell.getValue() ? 'Accepted' : 'Skipped',
      },
      {
        accessorKey: 'brahmacharyaPartnerName',
        header: 'Partner Name',
        enableColumnFilter: true,
        Cell: ({ cell }) => cell.getValue() || '-',
      },
      {
        accessorKey: 'createdAt',
        header: 'Registration Date',
        enableColumnFilter: false,
        Cell: ({ cell }) => cell.getValue() ? new Date(cell.getValue()).toLocaleString() : '',
      }
    ],
    []
  );

  const handleExcelDownload = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/chaturmasik/allregistrations`);
      const data = res.data || [];
      
      // Reorder and format data for excel export
      const formattedData = data.map(item => ({
        'Registration ID': item.chaturmasikNo,
        'Name': item.name,
        'Phone': item.phone,
        'DOB': item.dateOfBirth ? new Date(item.dateOfBirth).toLocaleDateString("en-GB") : '',
        'Address': item.address,
        'City': item.city,
        'State': item.state,
        'Sangh Name': item.sanghName,
        'Samayik Target': item.samayik ? `${item.samayik} Samayik` : 'Skipped',
        'Navkar Target': item.navkar ? `${item.navkar} Mala` : 'Skipped',
        'Swadhyay': item.swadhyay ? 'Learned' : 'Skipped',
        'Sajode Brahmacharya': item.brahmacharya ? 'Accepted' : 'Skipped',
        'Partner Name': item.brahmacharyaPartnerName || '-',
        'Registration Date': item.createdAt ? new Date(item.createdAt).toLocaleString() : ''
      }));
      
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Chaturmasik Registrations');
      XLSX.writeFile(workbook, 'chaturmasik_registrations.xlsx');
      
      setSnackbar({ open: true, message: 'Excel file downloaded successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to download Excel file', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: registrations,
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
        <Button variant="contained" onClick={handleExcelDownload} style={{ margin: '0', background: '#700b0b', color: '#fff' }}>
          Download Excel
        </Button>
      </Box>
    ),
    muiTablePaperProps: {
      sx: { background: '#fffbe6' },
    },
    muiTableHeadCellProps: ({ column }) =>
      column.id === 'chaturmasikNo'
        ? { sx: { color: '#700b0b', fontWeight: 'bold', position: 'sticky', left: 0, zIndex: 2 } }
        : { sx: { color: '#700b0b', fontWeight: 'bold' } },
    muiTableBodyCellProps: ({ column }) =>
      column.id === 'chaturmasikNo'
        ? { sx: { color: '#700b0b', position: 'sticky', left: 0, zIndex: 1 } }
        : { sx: { color: '#333' } },
  });

  // Calculate quick summary metrics
  const totalCount = summary.totalCount;
  const swadhyayOpted = summary.bySwadhyay?.find(x => x.consented === true)?.count || 0;
  const brahmacharyaOpted = summary.byBrahmacharya?.find(x => x.consented === true)?.count || 0;
  
  const samayikOpted = summary.bySamayik?.reduce((sum, item) => {
    if (item.target && item.target !== "" && item.target !== "Skipped") {
      return sum + item.count;
    }
    return sum;
  }, 0) || 0;

  const navkarOpted = summary.byNavkar?.reduce((sum, item) => {
    if (item.target && item.target !== "" && item.target !== "Skipped") {
      return sum + item.count;
    }
    return sum;
  }, 0) || 0;

  return (
    <>
      <Navbar />
      <div className="chaturmasik-management-main">
        <Typography variant="h4" gutterBottom sx={{ color: '#700b0b', fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
          Chaturmasik Aradhana Registration Management
        </Typography>

        <div className="chaturmasik-summary-grid">
          <div className="chaturmasik-summary-card">
            <span className="label">Total Aradhaks</span>
            <span className="value">{totalCount}</span>
          </div>
          <div className="chaturmasik-summary-card">
            <span className="label">Samayik Opted</span>
            <span className="value">{samayikOpted}</span>
          </div>
          <div className="chaturmasik-summary-card">
            <span className="label">Navkar Opted</span>
            <span className="value">{navkarOpted}</span>
          </div>
          <div className="chaturmasik-summary-card">
            <span className="label">Swadhyay Opted</span>
            <span className="value">{swadhyayOpted}</span>
          </div>
          <div className="chaturmasik-summary-card">
            <span className="label">Brahmacharya Opted</span>
            <span className="value">{brahmacharyaOpted}</span>
          </div>
        </div>

        <div className="chaturmasik-management-content">
          <MaterialReactTable table={table} className="registration-table" />
        </div>
      </div>
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

export default ChaturmasikManagementPage;
