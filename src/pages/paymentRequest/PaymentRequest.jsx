import "./paymentRequest.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import { DataGrid } from "@mui/x-data-grid";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Grid,
  Paper,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";

const PaymentRequest = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDialog, setViewDialog] = useState(false);
  const [processDialog, setProcessDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchPaymentRequests();
  }, []);

  const fetchPaymentRequests = async () => {
    try {
      const res = await axios.get(
        "http://localhost:4000/api/users/payment-requested-users"
      );
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
      setSnackbar({
        open: true,
        message: "Failed to fetch payment requests",
        severity: "error",
      });
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setViewDialog(true);
  };

  const handleProcessPayment = (user) => {
    setSelectedUser(user);
    setProcessDialog(true);
  };

  const confirmPaymentProcess = async () => {
    if (!selectedUser) return;

    try {
      await axios.post("http://localhost:4000/api/paymentUsers", {
        userId: selectedUser._id,
        withdrawMethod: selectedUser.withdrawMethod,
        withdrawalHoldAmount: selectedUser.withdrawalHoldAmount,
        withdrawalNumber: selectedUser.withdrawalNumber,
        withdrawalStatus: "success",
      });
      
      setProcessDialog(false);
      setSnackbar({
        open: true,
        message: "Payment processed successfully",
        severity: "success",
      });
      fetchPaymentRequests(); // Refresh the list
    } catch (err) {
      console.log(err);
      setSnackbar({
        open: true,
        message: "Failed to process payment",
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
      field: "withdrawalHoldAmount",
      headerName: "Withdrawal Amount",
      width: 150,
      renderCell: (params) => {
        return `BDT ${params.row.withdrawalHoldAmount}`;
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
      field: "action",
      headerName: "Action",
      width: 250,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleViewUser(params.row)}
            >
              View
            </Button>
            {params.row.withdrawalStatus === "pending" && (
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={() => handleProcessPayment(params.row)}
                style={{ marginLeft: "10px" }}
              >
                Process Payment
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <div className="datatable">
          <div className="datatableTitle">Payment Requests Users</div>
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

      {/* View User Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>User Payment Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper elevation={3} style={{ padding: "20px" }}>
                  <Typography variant="h6" gutterBottom>
                    User Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography>
                        <strong>User ID:</strong> {selectedUser._id}
                      </Typography>
                      <Typography>
                        <strong>Username:</strong> {selectedUser.username}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper elevation={3} style={{ padding: "20px" }}>
                  <Typography variant="h6" gutterBottom>
                    Withdrawal Request Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography>
                        <strong>Withdrawal Amount:</strong> BDT {selectedUser.withdrawalHoldAmount}
                      </Typography>
                      <Typography>
                        <strong>Withdrawal Method:</strong> {selectedUser.withdrawMethod}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>
                        <strong>Withdrawal Number:</strong> {selectedUser.withdrawalNumber}
                      </Typography>
                      <Typography>
                        <strong>Withdrawal Status:</strong> {selectedUser.withdrawalStatus}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {selectedUser.withdrawHistory && selectedUser.withdrawHistory.length > 0 && (
                <Grid item xs={12}>
                  <Paper elevation={3} style={{ padding: "20px" }}>
                    <Typography variant="h6" gutterBottom>
                      Withdrawal History
                    </Typography>
                    {selectedUser.withdrawHistory.map((item, index) => (
                      <Box 
                        key={index} 
                        mb={1} 
                        p={1} 
                        border="1px solid #eaeaea"
                        borderRadius={1}
                      >
                        <Typography>
                          <strong>Amount:</strong> BDT {item.amount}
                        </Typography>
                        <Typography>
                          <strong>Date:</strong> {new Date(item.date).toLocaleString()}
                        </Typography>
                      </Box>
                    ))}
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Process Payment Dialog */}
      <Dialog
        open={processDialog}
        onClose={() => setProcessDialog(false)}
      >
        <DialogTitle>Process Payment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to process payment for user "{selectedUser?.username}"?
          </Typography>
          <Box mt={2}>
            <Typography>
              <strong>Withdrawal Amount:</strong> BDT {selectedUser?.withdrawalHoldAmount}
            </Typography>
            <Typography>
              <strong>Method:</strong> {selectedUser?.withdrawMethod}
            </Typography>
            <Typography>
              <strong>Number:</strong> {selectedUser?.withdrawalNumber}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProcessDialog(false)}>Cancel</Button>
          <Button onClick={confirmPaymentProcess} color="primary" variant="contained">
            Confirm Payment
          </Button>
        </DialogActions>
      </Dialog>

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

export default PaymentRequest;