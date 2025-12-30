import React, { useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Button, Typography, Snackbar, Alert } from "@mui/material";
import axios from "axios";
import Navbar from "../components/Navbar";
import * as XLSX from "xlsx";
import "./7Yatra2025VaiyavachManagementPage.css";

const AstaprakariManagementPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([{ id: "createdAt", desc: true }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowCount, setRowCount] = useState(0);

  /* ------------------------------
     Fetch Data
  -------------------------------*/
  const fetchAstaprakari = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: globalFilter,
        sortBy: sorting[0]?.id || "createdAt",
        order: sorting[0]?.desc ? "desc" : "asc",
        ...Object.fromEntries(columnFilters.map((f) => [f.id, f.value])),
      };

      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/astaprakari/getall_astaprakari_puja`,
        { params }
      );

      setRecords(res.data.data || []);
      setRowCount(res.data.total || 0);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to fetch records",
        severity: "error",
      });
      setRecords([]);
      setRowCount(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAstaprakari();
    // eslint-disable-next-line
  }, [pagination, sorting, globalFilter, columnFilters]);

  /* ------------------------------
     Columns (FULL SCHEMA)
  -------------------------------*/
  const columns = useMemo(
    () => [
      {
        accessorKey: "yatrikNo",
        header: "Yatrik No",
        enableColumnFilter: true,
      },
      {
        accessorKey: "yatrikPhoto",
        header: "Photo",
        enableColumnFilter: false,
        Cell: ({ cell }) =>
          cell.getValue() ? (
            <a
              href={`${process.env.REACT_APP_API_BASE_URL}${cell.getValue()}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`${process.env.REACT_APP_API_BASE_URL}${cell.getValue()}`}
                alt="Yatrik"
                style={{ height: 60, borderRadius: 6 }}
              />
            </a>
          ) : (
            "—"
          ),
      },
      { accessorKey: "name", header: "Name", enableColumnFilter: true },
      {
        accessorKey: "mobileNumber",
        header: "Mobile",
        enableColumnFilter: true,
      },
      {
        accessorKey: "whatsappNumber",
        header: "WhatsApp",
        enableColumnFilter: true,
      },
      {
        accessorKey: "emailAddress",
        header: "Email",
        enableColumnFilter: true,
      },
      {
        accessorKey: "education",
        header: "Education",
        enableColumnFilter: true,
      },
      {
        accessorKey: "religiousEducation",
        header: "Religious Education",
        enableColumnFilter: true,
      },
      { accessorKey: "weight", header: "Weight", enableColumnFilter: true },
      { accessorKey: "height", header: "Height", enableColumnFilter: true },
      {
        accessorKey: "dob",
        header: "DOB",
        enableColumnFilter: false,
        Cell: ({ cell }) =>
          cell.getValue()
            ? new Date(cell.getValue()).toLocaleDateString()
            : "—",
      },
      { accessorKey: "address", header: "Address", enableColumnFilter: true },
      { accessorKey: "city", header: "City", enableColumnFilter: true },
      { accessorKey: "state", header: "State", enableColumnFilter: true },
      {
        accessorKey: "familyMemberName",
        header: "Family Member Name",
        enableColumnFilter: true,
      },
      { accessorKey: "relation", header: "Relation", enableColumnFilter: true },
      {
        accessorKey: "familyMemberWANumber",
        header: "Family Member WA No.",
        enableColumnFilter: true,
      },
      {
        accessorKey: "emergencyNumber",
        header: "Emergency No.",
        enableColumnFilter: true,
      },
      {
        accessorKey: "howToReachPalitana",
        header: "How To Reach Palitana",
        enableColumnFilter: true,
      },
      {
        accessorKey: "isPaid",
        header: "Payment Status",
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        accessorKey: "paymentLink",
        header: "Payment Link",
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ cell }) =>
          cell.getValue() ? (
            <a href={cell.getValue()} target="_blank" rel="noopener noreferrer">
              Link
            </a>
          ) : (
            "—"
          ),
      },
    ],
    []
  );

  /* ------------------------------
     Excel Export
  -------------------------------*/
  const handleExcelDownload = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/astaprakari/getAstaprakariExcel`
      );

      const data = res.data.records || [];

      // Ensure yatrikNo is the first column (same as Yatrik logic)
      const reorderedData = data.map((item) => {
        const { yatrikNo, ...rest } = item;
        return { yatrikNo, ...rest };
      });

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(reorderedData);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Astaprakari");

      XLSX.writeFile(workbook, "astaprakari_puja_2026.xlsx");

      setSnackbar({
        open: true,
        message: "Excel file downloaded successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Astaprakari Excel Error:", error);
      setSnackbar({
        open: true,
        message: "Failed to download Excel file",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------
     Table Config
  -------------------------------*/
  const table = useMaterialReactTable({
    columns,
    data: records,
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
      <Button
        variant="contained"
        onClick={handleExcelDownload}
        style={{ background: "#964b00", color: "#fff" }}
      >
        Download Excel
      </Button>
    ),
    muiTableHeadCellProps: ({ column }) =>
      column.id === "yatrikNo"
        ? { sx: { fontWeight: "bold", position: "sticky", left: 0, zIndex: 2 } }
        : { sx: { fontWeight: "bold" } },
    muiTableBodyCellProps: ({ column }) =>
      column.id === "yatrikNo"
        ? { sx: { position: "sticky", left: 0, zIndex: 1 } }
        : {},
  });

  return (
    <>
      <Navbar />
      <div className="rssmu-registration-management-main">
        <Typography
          variant="h4"
          sx={{ textAlign: "center", fontWeight: "bold", color: "#6d4c00" }}
        >
          Astaprakari Puja Management
        </Typography>
        <br></br>
        <div className="rssmu-registration-management-content">
          <MaterialReactTable table={table} className="registration-table" />
        </div>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AstaprakariManagementPage;
