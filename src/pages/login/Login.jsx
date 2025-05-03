import { useContext, useState } from "react";
import "./login.scss";

import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Login = () => {
  const [credentials, setCredentials] = useState({
    identifier: "",
    password: "",
  });
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const { loading, error, dispatch } = useContext(AuthContext);

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (!credentials.identifier || !credentials.password) {
      setFormError("Username/Email and password are required.");
      return;
    }

    dispatch({ type: "LOGIN_START" });

    try {
      const res = await axios.post("https://tourstay-server.onrender.com/api/auth/login", credentials, {
        withCredentials: true,
      });

      if (res.data.isAdmin) {
        dispatch({ type: "LOGIN_SUCCESS", payload: res.data.details });
        setSuccessMessage("Login successful! Redirecting...");
        setTimeout(() => navigate("/"), 2000);
      } else {
        dispatch({
          type: "LOGIN_FAILURE",
          payload: { message: "You are not allowed!!" },
        });
      }
    } catch (err) {
      dispatch({
        type: "LOGIN_FAILURE",
        payload: err.response?.data || "Something went wrong",
      });
    }
  };

  return (
    <div className="login">
      <h2 className="loginTitle">Admin Login</h2>
      <div className="lContainer">
        <img
          src="https://res.cloudinary.com/dkkdfz2n0/image/upload/v1739601631/Screenshot_2025-02-15_at_12.35.55_PM_opxr4x.png"
          alt="Tour Stay Logo"
        />
        <label>Username or Email</label>
        <input
          type="text"
          id="identifier"
          onChange={handleChange}
          placeholder="Username or Email"
          className="lInput"
        />
        <label>Password</label>
        <input
          type="password"
          id="password"
          onChange={handleChange}
          placeholder="Password"
          className="lInput"
        />
        <button disabled={loading} className="lButton" onClick={handleClick}>
          Login
        </button>
        {formError && <span className="formError">{formError}</span>}
        {error && <span className="errorMessage">{error.message}</span>}
        {successMessage && (
          <span className="successMessage">{successMessage}</span>
        )}
      </div>
    </div>
  );
};

export default Login;
