import "../list/list.scss";
import "../orders/order.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import { DataGrid } from "@mui/x-data-grid";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
  Grid,
  Paper,
  Box,
} from "@mui/material";

const Orders = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refundDialog, setRefundDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refundAmount, setRefundAmount] = useState(0);
  const [viewDialog, setViewDialog] = useState(false);
  const [policyDialog, setPolicyDialog] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`https://tourstay-server.onrender.com/api/payment/orders`);
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const calculateRefundAmount = (order) => {
    const checkInDate = new Date(order.checkIn);
    const today = new Date();
    const diffTime = checkInDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      // Check-in date has passed or is today
      return 0;
    } else if (diffDays === 1) {
      // Day before check-in
      return order.totalPrice * 0.2;
    } else if (diffDays <= 2) {
      // 2 days before check-in
      return order.totalPrice * 0.3;
    } else if (diffDays >= 7) {
      // 7 or more days before check-in
      return order.totalPrice;
    } else {
      // 3-6 days before check-in
      return order.totalPrice * 0.5;
    }
  };

  const handleCancelOrder = async (id) => {
    const order = data.find((item) => item._id === id);
    const calculatedRefund = calculateRefundAmount(order);

    try {
      await axios.put(`https://tourstay-server.onrender.com/api/payment/cancelOrder/${id}`, {
        refundAmount: calculatedRefund,
        refundStatus: calculatedRefund > 0 ? "processing" : "rejected",
        paymentStatus: calculatedRefund > 0 ? "refunded" : "cancelled",
      });
      fetchOrders(); // Refresh the list
    } catch (err) {
      console.log(err);
    }
  };

  const handleRefundClick = (order) => {
    setSelectedOrder(order);
    const calculatedRefund = calculateRefundAmount(order);
    setRefundAmount(calculatedRefund);
    setRefundDialog(true);
  };

  const handleRefundConfirm = async () => {
    if (!selectedOrder) return;

    try {
      await axios.put(
        `https://tourstay-server.onrender.com/api/payment/refundOrder/${selectedOrder._id}`,
        {
          refundAmount: refundAmount,
          refundStatus: "refunded",
          paymentStatus: "refunded",
        }
      );
      setRefundDialog(false);
      fetchOrders(); // Refresh the list
    } catch (err) {
      console.log(err);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setViewDialog(true);
  };

  const columns = [
    { field: "_id", headerName: "Order ID", width: 150 },
    {
      field: "customerName",
      headerName: "Customer",
      width: 150,
    },
    {
      field: "customerEmail",
      headerName: "Email",
      width: 200,
    },
    {
      field: "customerPhone",
      headerName: "Phone",
      width: 130,
    },
    {
      field: "checkIn",
      headerName: "Check In",
      width: 100,
      renderCell: (params) => {
        return new Date(params.row.checkIn).toLocaleDateString();
      },
    },
    {
      field: "checkOut",
      headerName: "Check Out",
      width: 100,
      renderCell: (params) => {
        return new Date(params.row.checkOut).toLocaleDateString();
      },
    },
    {
      field: "totalPrice",
      headerName: "Price",
      width: 100,
      renderCell: (params) => {
        return `BDT ${params.row.totalPrice}`;
      },
    },
    {
      field: "paymentStatus",
      headerName: "Payment Status",
      width: 130,
      renderCell: (params) => {
        return (
          <div className={`cellWithStatus ${params.row.paymentStatus}`}>
            {params.row.paymentStatus}
          </div>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        return (
          <div className={`cellWithStatus ${params.row.status}`}>
            {params.row.status}
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
              onClick={() => handleViewOrder(params.row)}
            >
              View
            </Button>
            {params.row.status === "confirmed" &&
              params.row.paymentStatus !== "completed" && (
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => handleCancelOrder(params.row._id)}
                  style={{ marginLeft: "10px" }}
                >
                  Cancel
                </Button>
              )}
            {/* Show refund button for cancelled orders that haven't been refunded yet */}
            {params.row.status === "cancelled" &&
              params.row.paymentStatus !== "refunded" && (
                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  onClick={() => handleRefundClick(params.row)}
                  style={{ marginLeft: "10px" }}
                >
                  Process Refund
                </Button>
              )}
            {/* Show refund status if already refunded */}
            {params.row.paymentStatus === "refunded" && (
              <span style={{ marginLeft: "10px", color: "green" }}>
                Refunded: BDT {params.row.refundAmount || 0}
              </span>
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
          <div className="datatableTitle">QuickStay Orders</div>
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

      {/* Refund Dialog */}
      <Dialog open={refundDialog} onClose={() => setRefundDialog(false)}>
        <DialogTitle>Process Refund</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Calculate refund amount for order {selectedOrder?._id}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Refund Amount"
            type="number"
            fullWidth
            variant="standard"
            value={refundAmount}
            onChange={(e) => setRefundAmount(Number(e.target.value))}
            inputProps={{ max: selectedOrder?.totalPrice }}
            InputProps={{
              readOnly: true,
            }}
          />
          <Box display="flex" alignItems="center" mt={2}>
            <Typography variant="caption" color="textSecondary">
              Refund calculation based on cancellation policy
            </Typography>
            <Typography
              variant="caption"
              color="primary"
              style={{
                marginLeft: "8px",
                cursor: "pointer",
                textDecoration: "underline",
              }}
              onClick={() => setPolicyDialog(true)}
            >
              See the refund policy
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundDialog(false)}>Cancel</Button>
          <Button onClick={handleRefundConfirm} color="primary">
            Confirm Refund
          </Button>
        </DialogActions>
      </Dialog>

      {/* Refund Policy Dialog */}
      <Dialog
        open={policyDialog}
        onClose={() => setPolicyDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancellation & Refund Policy</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="h6" gutterBottom>
              Refund Policy Details
            </Typography>
            <Paper elevation={1} style={{ padding: "16px" }}>
              <Typography variant="body1" paragraph>
                Our refund policy is designed to be fair to both our customers
                and our business. The refund amount depends on when you cancel
                your booking relative to your check-in date:
              </Typography>
              <Box mt={2}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  • 7+ days before check-in:
                </Typography>
                <Typography
                  variant="body2"
                  paragraph
                  style={{ paddingLeft: "16px" }}
                >
                  <strong>100% refund</strong> of your total booking amount
                </Typography>

                <Typography variant="subtitle1" color="primary" gutterBottom>
                  • 3-6 days before check-in:
                </Typography>
                <Typography
                  variant="body2"
                  paragraph
                  style={{ paddingLeft: "16px" }}
                >
                  <strong>50% refund</strong> of your total booking amount
                </Typography>

                <Typography variant="subtitle1" color="primary" gutterBottom>
                  • 2 days before check-in:
                </Typography>
                <Typography
                  variant="body2"
                  paragraph
                  style={{ paddingLeft: "16px" }}
                >
                  <strong>30% refund</strong> of your total booking amount
                </Typography>

                <Typography variant="subtitle1" color="primary" gutterBottom>
                  • 1 day before check-in:
                </Typography>
                <Typography
                  variant="body2"
                  paragraph
                  style={{ paddingLeft: "16px" }}
                >
                  <strong>20% refund</strong> of your total booking amount
                </Typography>

                <Typography variant="subtitle1" color="primary" gutterBottom>
                  • On check-in date or after:
                </Typography>
                <Typography
                  variant="body2"
                  paragraph
                  style={{ paddingLeft: "16px" }}
                >
                  <strong>No refund</strong> will be provided
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color="textSecondary"
                style={{ marginTop: "16px" }}
              >
                * All refunds will be processed within 5-7 business days of
                approval
              </Typography>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPolicyDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper elevation={3} style={{ padding: "20px" }}>
                  <Typography variant="h6" gutterBottom>
                    Booking Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography>
                        <strong>Order ID:</strong> {selectedOrder._id}
                      </Typography>
                      <Typography>
                        <strong>Customer Name:</strong>{" "}
                        {selectedOrder.customerName}
                      </Typography>
                      <Typography>
                        <strong>Email:</strong> {selectedOrder.customerEmail}
                      </Typography>
                      <Typography>
                        <strong>Phone:</strong> {selectedOrder.customerPhone}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>
                        <strong>Check-in:</strong>{" "}
                        {new Date(selectedOrder.checkIn).toLocaleString()}
                      </Typography>
                      <Typography>
                        <strong>Check-out:</strong>{" "}
                        {new Date(selectedOrder.checkOut).toLocaleString()}
                      </Typography>
                      <Typography>
                        <strong>Total Nights:</strong>{" "}
                        {selectedOrder.totalNights}
                      </Typography>
                      <Typography>
                        <strong>Booking Type:</strong>{" "}
                        {selectedOrder.bookingType}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper elevation={3} style={{ padding: "20px" }}>
                  <Typography variant="h6" gutterBottom>
                    Payment Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography>
                        <strong>Total Price:</strong> BDT
                        {selectedOrder.totalPrice}
                      </Typography>
                      <Typography>
                        <strong>Payment Method:</strong>{" "}
                        {selectedOrder.paymentMethod}
                      </Typography>
                      <Typography>
                        <strong>Transaction ID:</strong>{" "}
                        {selectedOrder.transactionId}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>
                        <strong>Payment Status:</strong>{" "}
                        {selectedOrder.paymentStatus}
                      </Typography>
                      <Typography>
                        <strong>Booking Status:</strong> {selectedOrder.status}
                      </Typography>
                      {selectedOrder.isPromoApplied && (
                        <Typography>
                          <strong>Promo Code:</strong> {selectedOrder.promoCode}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {(selectedOrder.refundStatus !== "pending" ||
                selectedOrder.refundAmount > 0) && (
                <Grid item xs={12}>
                  <Paper
                    elevation={3}
                    style={{
                      padding: "20px",
                      backgroundColor:
                        selectedOrder.refundStatus === "refunded"
                          ? "#f0fff0"
                          : "#fff5f5",
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Refund Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography>
                          <strong>Refund Status:</strong>{" "}
                          {selectedOrder.refundStatus}
                        </Typography>
                        <Typography>
                          <strong>Refund Amount:</strong> BDT
                          {selectedOrder.refundAmount}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        {selectedOrder.refundDate && (
                          <Typography>
                            <strong>Refund Date:</strong>{" "}
                            {new Date(
                              selectedOrder.refundDate
                            ).toLocaleString()}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
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
    </div>
  );
};

export default Orders;
