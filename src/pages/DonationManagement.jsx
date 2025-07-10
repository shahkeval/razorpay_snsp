import React, { useEffect, useMemo, useState } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './DonationManagement.css';

// Define your options for the dropdown
const categoryOptions = [
  { value: 'દેવદ્રવ્ય ખાતે', label: 'દેવદ્રવ્ય ખાતે' },
  { value: 'સાધુ-સાધ્વી વૈયાવચ્ચ ફંડ ખાતે', label: 'સાધુ-સાધ્વી વૈયાવચ્ચ ફંડ ખાતે' },
  { value: 'સાધર્મિક ખાતે', label: 'સાધર્મિક ખાતે' },
  { value: 'સાધારણ ફંડ ખાતે', label: 'સાધારણ ફંડ ખાતે' },
  { value: 'જીવદયા ખાતે', label: 'જીવદયા ખાતે' },
  { value: 'અનુકંપા ખાતે', label: 'અનુકંપા ખાતે' },
  // Add more categories as needed
];

const DonationManagement = () => {
  const [donations, setDonations] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editDonation, setEditDonation] = useState(null);
  const [form, setForm] = useState({
    name: '',
    category: '',
    phone: '',
    address: '',
    amount: '',
    message: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [columnFilters, setColumnFilters] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: globalFilter,
        sortBy: sorting[0]?.id || 'createdAt',
        order: sorting[0]?.desc ? 'desc' : 'asc',
      };
      columnFilters.forEach(f => {
        params[f.id] = f.value;
      });
      const res = await axios.get('https://namonamahshaswatparivar-dt17.vercel.app/api/donations', { params });
      setDonations(res.data.donations);
      setRowCount(res.data.total);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to fetch donations', severity: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDonations();
    // eslint-disable-next-line
  }, [pagination, sorting, globalFilter, columnFilters]);

  const handleOpenDialog = (donation = null) => {
    setEditDonation(donation);
    setForm(
      donation || {
        name: '',
        category: '',
        phone: '',
        address: '',
        amount: '',
        message: ''
      }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditDonation(null);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption);
  };

  const handleSave = async () => {
    try {
      if (editDonation) {
        await axios.put(`https://namonamahshaswatparivar-dt17.vercel.app/api/donations/${editDonation._id}`, form);
        setSnackbar({ open: true, message: 'Donation updated successfully', severity: 'success' });
      } else {
        await axios.post('https://namonamahshaswatparivar-dt17.vercel.app/api/donations', form);
        setSnackbar({ open: true, message: 'Donation added successfully', severity: 'success' });
      }
      fetchDonations();
      handleCloseDialog();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save donation', severity: 'error' });
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm('Are you sure you want to delete this donation?')) {
      try {
        await axios.delete(`https://namonamahshaswatparivar-dt17.vercel.app/api/donations/${row.original._id}`);
        setSnackbar({ open: true, message: 'Donation deleted successfully', severity: 'success' });
        fetchDonations();
      } catch {
        setSnackbar({ open: true, message: 'Failed to delete donation', severity: 'error' });
      }
    }
  };

  const columns = useMemo(
    () => [
      { accessorKey: 'name', header: 'Name', enableColumnFilter: true },
      { accessorKey: 'category', header: 'Category', enableColumnFilter: true },
      { accessorKey: 'phone', header: 'Phone', enableColumnFilter: true },
      { accessorKey: 'address', header: 'Address', enableColumnFilter: true },
      { accessorKey: 'amount', header: 'Amount', Cell: ({ cell }) => `₹${cell.getValue()}` },
      { accessorKey: 'message', header: 'Message', enableColumnFilter: true },
      {
        header: 'Actions',
        id: 'actions',
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton color="primary" onClick={() => handleOpenDialog(row.original)}><EditIcon /></IconButton>
            <IconButton color="error" onClick={() => handleDelete(row)}><DeleteIcon /></IconButton>
          </Box>
        ),
        size: 80
      }
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: donations,
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
    // enableRowActions: true,
    renderTopToolbarCustomActions: () => (
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} style={{ background: '#b8860b', color: '#fff' }}>
        Add Donation
      </Button>
    ),
    // positionActionsColumn: 'none',
    muiTablePaperProps: {
      sx: { background: '#fffbe6' },
    },
    muiTableHeadCellProps: {
      sx: { background: '#f5e1a4', color: '#6d4c00', fontWeight: 'bold' },
    },
    muiTableBodyCellProps: {
      sx: { color: '#4e3c0a' },
    },
  });

  return (
    <>
      <Navbar />
      <div className="donation-management-main">
        <Typography variant="h4" gutterBottom sx={{ color: '#6d4c00', fontWeight: 'bold', textAlign: 'center' }}>Donation Management</Typography>
        <div className="donation-management-content">
          <MaterialReactTable table={table} className="donation-table" />
        </div>
        {/* Dialog for Add/Edit */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth className="donation-dialog">
          <DialogTitle>{editDonation ? 'Edit Donation' : 'Add Donation'}</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Name"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <FormControl fullWidth margin="dense" required>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                value={selectedCategory ? selectedCategory.value : ''}
                onChange={(e) => {
                  const selectedOption = categoryOptions.find(option => option.value === e.target.value);
                  setSelectedCategory(selectedOption);
                  setForm({ ...form, category: selectedOption ? selectedOption.value : '' });
                }}
                label="Category"
              >
                {categoryOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <TextField
              margin="dense"
              label="Address"
              name="address"
              value={form.address}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <TextField
              margin="dense"
              label="Amount"
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <TextField
              margin="dense"
              label="Message"
              name="message"
              value={form.message}
              onChange={handleFormChange}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSave} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
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

export default DonationManagement;