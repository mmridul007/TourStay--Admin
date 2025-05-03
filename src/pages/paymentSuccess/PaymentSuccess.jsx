import "./paymentSuccess.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import { DataGrid } from "@mui/x-data-grid";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Snackbar,
  Alert,
} from "@mui/material";

const PaymentSuccess = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchPaymentSuccess();
  }, []);

  const fetchPaymentSuccess = async () => {
    try {
      const res = await axios.get(
        "http://localhost:4000/api/paymentUsers/allPayments"
      );
      
      // Sort payments from latest to oldest
      const sortedData = res.data.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setData(sortedData);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
      setSnackbar({
        open: true,
        message: "Failed to fetch payment records",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const columns = [
    { field: "_id", headerName: "ID", width: 200 },
    {
      field: "username",
      headerName: "Username",
      width: 150,
    },
    {
      field: "withdrawAmount",
      headerName: "Withdraw Amount",
      width: 150,
      renderCell: (params) => {
        return `BDT ${params.row.withdrawAmount}`;
      },
    },
    {
      field: "withdrawMethod",
      headerName: "Withdraw Method",
      width: 150,
    },
    {
      field: "withdrawalNumber",
      headerName: "Withdrawal Number",
      width: 180,
    },
    {
      field: "withdrawalStatus",
      headerName: "Withdrawal Status",
      width: 150,
      renderCell: (params) => {
        return (
          <div className={`cellWithStatus ${params.row.withdrawalStatus}`}>
            {params.row.withdrawalStatus}
          </div>
        );
      },
    },
    {
      field: "withdrawDate",
      headerName: "Withdraw Date",
      width: 200,
      renderCell: (params) => {
        return new Date(params.row.withdrawDate).toLocaleString();
      },
    },
  ];

  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <div className="datatable">
          <div className="datatableTitle">Successful Payments</div>
          <DataGrid
            className="datagrid"
            rows={data}
            columns={columns}
            pageSize={9}
            rowsPerPageOptions={[9]}
            loading={loading}
            getRowId={(row) => row._id}
          />
        </div>
      </div>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PaymentSuccess;