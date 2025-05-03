import { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import "./home.scss";
import axios from "axios";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  PersonOutline,
  AdminPanelSettings,
  Hotel,
  MeetingRoom,
  MonetizationOn,
  CheckCircleOutline,
  CancelOutlined,
  RefreshOutlined,
  AccountBalanceWallet,
} from "@mui/icons-material";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    // General stats
    totalUsers: 0,
    totalAdmins: 0,
    totalHotels: 0,
    totalQuickRooms: 0,
    totalWithdrawalRequests: 0,

    // QuickStay stats
    quickStaySuccessfulOrders: 0,
    quickStayRefundedOrders: 0,
    quickStayCancelledOrders: 0,
    quickStayTotalAmount: 0,
    quickStayCommission: 0,
    quickStayRefundCommission: 0,
    totalBookingPriceOfRefundedBooking: 0,
    totalAmountOfRefundedOrders: 0,

    // Hotel stats
    hotelSuccessfulOrders: 0,
    hotelRefundedOrders: 0,
    hotelCancelledOrders: 0,
    hotelTotalAmount: 0,
    hotelCommission: 0,
    hotelRefundCommission: 0,
    totalBookingPriceOfRefundedBookings: 0,
    totalAmountOfRefundedBookings: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // General statistics
        const totalUsers = await axios.get(
          "https://tourstay-server.onrender.com/api/users/totalUsers"
        );
        const totalAdmins = await axios.get(
          "https://tourstay-server.onrender.com/api/users/totalAdmins"
        );
        const totalHotels = await axios.get(
          "https://tourstay-server.onrender.com/api/hotels/totalHotels"
        );
        const totalQuickRooms = await axios.get(
          "https://tourstay-server.onrender.com/api/quickrooms/totalQuickrooms"
        );
        const totalWithdrawalRequests = await axios.get(
          "https://tourstay-server.onrender.com/api/users/totalWithdrawal-Requested"
        );

        // QuickStay statistics
        const quickStaySuccessfulOrders = await axios.get(
          "https://tourstay-server.onrender.com/api/payment/totalSuccessfulOrders"
        );
        const quickStayRefundedOrders = await axios.get(
          "https://tourstay-server.onrender.com/api/payment/totalRefundedOrders"
        );
        const quickStayCancelledOrders = await axios.get(
          "https://tourstay-server.onrender.com/api/payment/totalCancelledOrders"
        );
        const quickStayTotalAmount = await axios.get(
          "https://tourstay-server.onrender.com/api/payment/totalAmountOfSuccessfulOrders"
        );
        const totalBookingPriceOfRefundedBooking = await axios.get(
          "https://tourstay-server.onrender.com/api/payment/totalBookingPriceOfRefundedBooking"
        );
        const totalAmountOfRefundedOrders = await axios.get(
          "https://tourstay-server.onrender.com/api/payment/totalAmountOfRefundedOrders"
        );

        // Hotel statistics
        const hotelSuccessfulOrders = await axios.get(
          "https://tourstay-server.onrender.com/api/hotel-payment/totalSuccessfulOrders"
        );
        const hotelRefundedOrders = await axios.get(
          "https://tourstay-server.onrender.com/api/hotel-payment/totalRefundOrders"
        );
        const hotelCancelledOrders = await axios.get(
          "https://tourstay-server.onrender.com/api/hotel-payment/totalCancelOrders"
        );
        const hotelTotalAmount = await axios.get(
          "https://tourstay-server.onrender.com/api/hotel-payment/totalAmountOfSuccessfulBookings"
        );
        const totalBookingPriceOfRefundedBookings = await axios.get(
          "https://tourstay-server.onrender.com/api/hotel-payment/totalBookingPriceOfRefundedBookings"
        );
        const totalAmountOfRefundedBookings = await axios.get(
          "https://tourstay-server.onrender.com/api/hotel-payment/totalAmountOfRefundedBookings"
        );

        // Calculate commissions
        // QuickStay: 30 BDT per successful order
        const quickStayCommission = quickStaySuccessfulOrders.data * 30;

        // QuickStay refund commission
        const quickStayRefundCommission =
          totalBookingPriceOfRefundedBooking.data -
          totalAmountOfRefundedOrders.data;

        // Hotel: 5% of total amount
        const hotelCommission = hotelTotalAmount.data * 0.05;

        // Hotel refund commission
        const hotelRefundCommission =
          totalBookingPriceOfRefundedBookings.data -
          totalAmountOfRefundedBookings.data;

        setDashboardData({
          totalUsers: totalUsers.data,
          totalAdmins: totalAdmins.data,
          totalHotels: totalHotels.data,
          totalQuickRooms: totalQuickRooms.data,
          totalWithdrawalRequests: totalWithdrawalRequests.data,

          quickStaySuccessfulOrders: quickStaySuccessfulOrders.data,
          quickStayRefundedOrders: quickStayRefundedOrders.data,
          quickStayCancelledOrders: quickStayCancelledOrders.data,
          quickStayTotalAmount: quickStayTotalAmount.data,
          quickStayCommission: quickStayCommission,
          quickStayRefundCommission: quickStayRefundCommission,
          totalBookingPriceOfRefundedBooking:
            totalBookingPriceOfRefundedBooking.data,
          totalAmountOfRefundedOrders: totalAmountOfRefundedOrders.data,

          hotelSuccessfulOrders: hotelSuccessfulOrders.data,
          hotelRefundedOrders: hotelRefundedOrders.data,
          hotelCancelledOrders: hotelCancelledOrders.data,
          hotelTotalAmount: hotelTotalAmount.data,
          hotelCommission: hotelCommission,
          hotelRefundCommission: hotelRefundCommission,
          totalBookingPriceOfRefundedBookings:
            totalBookingPriceOfRefundedBookings.data,
          totalAmountOfRefundedBookings: totalAmountOfRefundedBookings.data,
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="home">
        <Sidebar />
        <div className="homeContainer loading-container">
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading dashboard data...
          </Typography>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home">
        <Sidebar />
        <div className="homeContainer error-container">
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <Typography variant="h4" className="dashboard-title">
          Dashboard
        </Typography>

        {/* General Statistics Section */}
        <Paper elevation={3} className="dashboard-section">
          <Typography variant="h5" className="section-title">
            General Statistics
          </Typography>
          <Grid container spacing={3} className="stats-container">
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <Card className="stat-card">
                <CardContent>
                  <Box className="card-icon-container user-icon">
                    <PersonOutline />
                  </Box>
                  <Typography variant="h6" className="stat-title">
                    Total Users
                  </Typography>
                  <Typography variant="h4" className="stat-value">
                    {dashboardData.totalUsers}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <Card className="stat-card">
                <CardContent>
                  <Box className="card-icon-container admin-icon">
                    <AdminPanelSettings />
                  </Box>
                  <Typography variant="h6" className="stat-title">
                    Total Admins
                  </Typography>
                  <Typography variant="h4" className="stat-value">
                    {dashboardData.totalAdmins}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <Card className="stat-card">
                <CardContent>
                  <Box className="card-icon-container hotel-icon">
                    <Hotel />
                  </Box>
                  <Typography variant="h6" className="stat-title">
                    Total Hotels
                  </Typography>
                  <Typography variant="h4" className="stat-value">
                    {dashboardData.totalHotels}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <Card className="stat-card">
                <CardContent>
                  <Box className="card-icon-container room-icon">
                    <MeetingRoom />
                  </Box>
                  <Typography variant="h6" className="stat-title">
                    Total QuickRooms
                  </Typography>
                  <Typography variant="h4" className="stat-value">
                    {dashboardData.totalQuickRooms}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <Card className="stat-card">
                <CardContent>
                  <Box className="card-icon-container withdrawal-icon">
                    <AccountBalanceWallet />
                  </Box>
                  <Typography variant="h6" className="stat-title">
                    Withdrawal Requests
                  </Typography>
                  <Typography variant="h4" className="stat-value">
                    {dashboardData.totalWithdrawalRequests}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* QuickStay Section */}
        <Paper elevation={3} className="dashboard-section">
          <Typography variant="h5" className="section-title">
            QuickStay Bookings
          </Typography>
          <Grid container spacing={3} className="stats-container">
            <Grid item xs={12} sm={6} md={4}>
              <Card className="stat-card">
                <CardContent>
                  <Box className="card-icon-container success-icon">
                    <CheckCircleOutline />
                  </Box>
                  <Typography variant="h6" className="stat-title">
                    Successful Orders
                  </Typography>
                  <Typography variant="h4" className="stat-value">
                    {dashboardData.quickStaySuccessfulOrders}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card className="stat-card">
                <CardContent>
                  <Box className="card-icon-container refund-icon">
                    <RefreshOutlined />
                  </Box>
                  <Typography variant="h6" className="stat-title">
                    Refunded Orders
                  </Typography>
                  <Typography variant="h4" className="stat-value">
                    {dashboardData.quickStayRefundedOrders}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card className="stat-card">
                <CardContent>
                  <Box className="card-icon-container cancel-icon">
                    <CancelOutlined />
                  </Box>
                  <Typography variant="h6" className="stat-title">
                    Cancelled Orders
                  </Typography>
                  <Typography variant="h4" className="stat-value">
                    {dashboardData.quickStayCancelledOrders}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Card className="stat-card finance-card">
                <CardContent>
                  <Box className="card-icon-container revenue-icon">
                    <MonetizationOn />
                  </Box>
                  <Typography variant="h6" className="stat-title">
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" className="stat-value">
                    {formatCurrency(dashboardData.quickStayTotalAmount)}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" className="stat-subtitle">
                    Commission (30 BDT per order):
                    <span className="highlight">
                      {formatCurrency(dashboardData.quickStayCommission)}
                    </span>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Card className="stat-card finance-card">
                <CardContent>
                  <Box className="card-icon-container refund-money-icon">
                    <MonetizationOn />
                  </Box>
                  <Typography variant="h6" className="stat-title">
                    Refund Information
                  </Typography>
                  <Typography variant="body2" className="stat-info">
                    Original Booking Value:{" "}
                    {formatCurrency(
                      dashboardData.totalBookingPriceOfRefundedBooking
                    )}
                  </Typography>
                  <Typography variant="body2" className="stat-info">
                    Refunded Amount:{" "}
                    {formatCurrency(dashboardData.totalAmountOfRefundedOrders)}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" className="stat-subtitle">
                    Refund Commission:
                    <span className="highlight">
                      {formatCurrency(dashboardData.quickStayRefundCommission)}
                    </span>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* Hotel Bookings Section */}
        <Paper elevation={3} className="dashboard-section">
          <Typography variant="h5" className="section-title">
            Hotel Bookings
          </Typography>
          <Grid container spacing={3} className="stats-container">
            <Grid item xs={12} sm={6} md={4}>
              <Card className="stat-card">
                <CardContent>
                  <Box className="card-icon-container success-icon">
                    <CheckCircleOutline />
                  </Box>
                  <Typography variant="h6" className="stat-title">
                    Successful Orders
                  </Typography>
                  <Typography variant="h4" className="stat-value">
                    {dashboardData.hotelSuccessfulOrders}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card className="stat-card">
                <CardContent>
                  <Box className="card-icon-container refund-icon">
                    <RefreshOutlined />
                  </Box>
                  <Typography variant="h6" className="stat-title">
                    Refunded Orders
                  </Typography>
                  <Typography variant="h4" className="stat-value">
                    {dashboardData.hotelRefundedOrders}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card className="stat-card">
                <CardContent>
                  <Box className="card-icon-container cancel-icon">
                    <CancelOutlined />
                  </Box>
                  <Typography variant="h6" className="stat-title">
                    Cancelled Orders
                  </Typography>
                  <Typography variant="h4" className="stat-value">
                    {dashboardData.hotelCancelledOrders}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Card className="stat-card finance-card">
                <CardContent>
                  <Box className="card-icon-container revenue-icon">
                    <MonetizationOn />
                  </Box>
                  <Typography variant="h6" className="stat-title">
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" className="stat-value">
                    {formatCurrency(dashboardData.hotelTotalAmount)}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" className="stat-subtitle">
                    Commission (5% of total):
                    <span className="highlight">
                      {formatCurrency(dashboardData.hotelCommission)}
                    </span>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Card className="stat-card finance-card">
                <CardContent>
                  <Box className="card-icon-container refund-money-icon">
                    <MonetizationOn />
                  </Box>
                  <Typography variant="h6" className="stat-title">
                    Refund Information
                  </Typography>
                  <Typography variant="body2" className="stat-info">
                    Original Booking Value:{" "}
                    {formatCurrency(
                      dashboardData.totalBookingPriceOfRefundedBookings
                    )}
                  </Typography>
                  <Typography variant="body2" className="stat-info">
                    Refunded Amount:{" "}
                    {formatCurrency(
                      dashboardData.totalAmountOfRefundedBookings
                    )}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" className="stat-subtitle">
                    Refund Commission:
                    <span className="highlight">
                      {formatCurrency(dashboardData.hotelRefundCommission)}
                    </span>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </div>
    </div>
  );
};

export default Home;
