import "./sidebar.scss";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import RequestPageIcon from "@mui/icons-material/RequestPage";
import StoreIcon from "@mui/icons-material/Store";
import HouseIcon from "@mui/icons-material/House";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

import { Link, useNavigate } from "react-router-dom";
import { DarkModeContext } from "../../context/darkModeContext";
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { AuthContext } from "../../context/AuthContext";

const Sidebar = () => {
  // Use unique variable names for dispatch
  const { dispatch: darkModeDispatch } = useContext(DarkModeContext);
  const { user, dispatch: authDispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    authDispatch({ type: "LOGOUT" }); // Use authDispatch for AuthContext
    localStorage.removeItem("user");
    navigate("/login"); // Redirect to login page after logout
  };

  return (
    <div className="sidebar">
      <div className="top">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="logo">admin</span>
        </Link>
      </div>
      <hr />
      <div className="center">
        <ul>
          <p className="title">MAIN</p>
          <Link to="/" style={{ textDecoration: "none" }}>
            <li>
              <DashboardIcon className="icon" />
              <span>Dashboard</span>
            </li>
          </Link>

          <p className="title">LISTS</p>
          <Link to="/users" style={{ textDecoration: "none" }}>
            <li>
              <PersonOutlineIcon className="icon" />
              <span>Users</span>
            </li>
          </Link>
          <Link to="/hotels" style={{ textDecoration: "none" }}>
            <li>
              <StoreIcon className="icon" />
              <span>Hotels</span>
            </li>
          </Link>
          <Link to="/rooms" style={{ textDecoration: "none" }}>
            <li>
              <HouseIcon className="icon" />
              <span>Rooms</span>
            </li>
          </Link>

          <Link to="/orders" style={{ textDecoration: "none" }}>
            <li>
              <LocalShippingIcon className="icon" />
              <span>Orders(QuickRooms)</span>
            </li>
          </Link>
          <Link to="/hotel-orders" style={{ textDecoration: "none" }}>
            <li>
              <LocalShippingIcon className="icon" />
              <span>Orders(Hotels)</span>
            </li>
          </Link>
          <Link to="/payment-request" style={{ textDecoration: "none" }}>
            <li>
              <RequestPageIcon className="icon" />
              <span>Payment Request</span>
            </li>
          </Link>
          <Link to="/payment-success" style={{ textDecoration: "none" }}>
            <li>
              <CreditCardIcon className="icon" />
              <span>Payment Success</span>
            </li>
          </Link>

          <p className="title">USER</p>
          <li>
            {/* <AccountCircleOutlinedIcon className="icon" />
            <span>Profile</span> */}
          </li>
          <li>
            <ExitToAppIcon className="icon" />
            <span onClick={handleLogout}>Logout</span>
          </li>
        </ul>
      </div>
      {/* <div className="bottom">
        <div
          className="colorOption"
          onClick={() => darkModeDispatch({ type: "LIGHT" })} // Use darkModeDispatch for DarkModeContext
        ></div>
        <div
          className="colorOption"
          onClick={() => darkModeDispatch({ type: "DARK" })} // Use darkModeDispatch for DarkModeContext
        ></div>
      </div> */}
    </div>
  );
};

export default Sidebar;
