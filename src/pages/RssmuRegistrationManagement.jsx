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
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './RssmuRegistrationManagement.css';
import * as XLSX from 'xlsx';

const RssmuRegistrationManagement = () => {
  const [registrations, setRegistrations] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editRegistration, setEditRegistration] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    category: '',
    whatsapp: '',
    area: '',
    city: '',
    birthdate: '',
    gender: '',
    profession: '',
    sangh: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [columnFilters, setColumnFilters] = useState([]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: globalFilter,
        sortBy: sorting[0]?.id || 'createdAt',
        order: sorting[0]?.desc ? 'desc' : 'asc',
        ...Object.fromEntries(columnFilters.map(filter => [filter.id, filter.value])),
      };
      const res = await axios.get('https://namonamahshaswatparivar-dt17.vercel.app/api/rssmsu/allrssmreg', { params });
      setRegistrations(res.data.registrations);
      setRowCount(res.data.total);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to fetch registrations', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [pagination, sorting, globalFilter, columnFilters]);

  const handleOpenDialog = (registration = null) => {
    setEditRegistration(registration);
    setForm(
      registration ? {
        fullName: registration.fullName,
        category: registration.category,
        whatsapp: registration.whatsapp,
        area: registration.area,
        city: registration.city,
        birthdate: registration.birthdate.split('T')[0],
        gender: registration.gender,
        profession: registration.profession,
        sangh: registration.sangh,
      } : {
        fullName: '',
        category: '',
        whatsapp: '',
        area: '',
        city: '',
        birthdate: '',
        gender: '',
        profession: '',
        sangh: '',
      }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditRegistration(null);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (editRegistration) {
        await axios.put(`https://namonamahshaswatparivar-dt17.vercel.app/api/rssmsu/${editRegistration._id}`, form);
        setSnackbar({ open: true, message: 'Registration updated successfully', severity: 'success' });
      } else {
        await axios.post('https://namonamahshaswatparivar-dt17.vercel.app/api/rssmsu', form);
        setSnackbar({ open: true, message: 'Registration added successfully', severity: 'success' });
      }
      fetchRegistrations();
      handleCloseDialog();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save registration', severity: 'error' });
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm('Are you sure you want to delete this registration?')) {
      try {
        await axios.delete(`https://namonamahshaswatparivar-dt17.vercel.app/api/rssmsu/${row.original._id}`);
        setSnackbar({ open: true, message: 'Registration deleted successfully', severity: 'success' });
        fetchRegistrations();
      } catch {
        setSnackbar({ open: true, message: 'Failed to delete registration', severity: 'error' });
      }
    }
  };

  const handleExcelDownload = async () => {
    try {
      const response = await axios.get('https://namonamahshaswatparivar-dt17.vercel.app/api/rssmsu/allregistartions');
      const data = response.data;

      // Reorder the data to place registrationId first and exclude _id and __v
      const modifiedData = data.map(item => {
        const { _id, __v, registrationId, ...rest } = item;
        return { registrationId, ...rest };
      });

      // Create a new workbook and a new worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(modifiedData);

      // Append the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

      // Export the workbook to an Excel file
      XLSX.writeFile(workbook, 'registrations.xlsx');
    } catch (error) {
      console.error('Error downloading Excel file:', error);
      setSnackbar({ open: true, message: 'Failed to download Excel file', severity: 'error' });
    }
  };

  const columns = useMemo(
    () => [
      { accessorKey: 'registrationId', header: 'Registration ID', enableColumnFilter: true }, // Add this line
      { accessorKey: 'fullName', header: 'Full Name', enableColumnFilter: true },
      { accessorKey: 'category', header: 'Category', enableColumnFilter: true },
      { accessorKey: 'whatsapp', header: 'WhatsApp', enableColumnFilter: true },
      { accessorKey: 'area', header: 'Area', enableColumnFilter: true },
      { accessorKey: 'city', header: 'City', enableColumnFilter: true },
      { accessorKey: 'birthdate', header: 'Birthdate', enableColumnFilter: true },
      { accessorKey: 'gender', header: 'Gender', enableColumnFilter: true },
      { accessorKey: 'profession', header: 'Profession', enableColumnFilter: true },
      { accessorKey: 'sangh', header: 'Sangh', enableColumnFilter: true },
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
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} style={{ background: '#b8860b', color: '#fff' }}>
          Add Registration
        </Button>
        <Button variant="contained" onClick={handleExcelDownload} style={{ margin: '0', background: '#964b00', color: '#fff' }}>
          Download Excel
        </Button>
      </Box>
    ),
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
      <div className="rssmu-registration-management-main">
        <Typography variant="h4" gutterBottom sx={{ color: '#6d4c00', fontWeight: 'bold', textAlign: 'center' }}>Rssmu Registration Management</Typography>
        <div className="rssmu-registration-management-content">
          <MaterialReactTable table={table} className="registration-table" />
        </div>
        {/* Dialog for Add/Edit */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth className="registration-dialog">
          <DialogTitle>{editRegistration ? 'Edit Registration' : 'Add Registration'}</DialogTitle>
          <DialogContent>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="form-group">
                <label htmlFor="fullName">Full Name*</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="whatsapp">WhatsApp*</label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  placeholder="Enter your WhatsApp number"
                  value={form.whatsapp}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="area">Area*</label>
                <input
                  type="text"
                  id="area"
                  name="area"
                  placeholder="Enter your area"
                  value={form.area}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="city">City*</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  placeholder="Enter your city"
                  value={form.city}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="birthdate">Birthdate*</label>
                <input
                  type="date"
                  id="birthdate"
                  name="birthdate"
                  value={form.birthdate}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Gender*</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={form.gender === 'Male'}
                      onChange={handleFormChange}
                      required
                    />
                    Male
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={form.gender === 'Female'}
                      onChange={handleFormChange}
                      required
                    />
                    Female
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="profession">Profession*</label>
                <input
                  type="text"
                  id="profession"
                  name="profession"
                  placeholder="Enter your profession"
                  value={form.profession}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="sangh">Sangh*</label>
                <input
                  type="text"
                  id="sangh"
                  name="sangh"
                  placeholder="Enter your Sangh name"
                  value={form.sangh}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Category*</label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="6-12 yrs">Category 1: 6-12 yrs</option>
                  <option value="12-18 yrs">Category 2: 12-18 yrs</option>
                  <option value="18-30 yrs">Category 3: 18-30 yrs</option>
                  <option value="30-45 yrs">Category 4: 30-45 yrs</option>
                  <option value="45+ yrs">Category 5: 45+ yrs</option>
                </select>
              </div>
            </form>
          </DialogContent>
          <DialogActions style={{ padding: '16px' }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" onClick={(e) => { e.preventDefault(); handleSave(); }}>Save</Button>
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

export default RssmuRegistrationManagement;
