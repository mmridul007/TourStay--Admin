import axios from "axios";
import { createContext, useEffect, useReducer } from "react";

// Initial state using localStorage
const INITIAL_STATE = {
  user: (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch (error) {
      return null;
    }
  })(),
  loading: false,
  error: null,
};

// Create context
export const AuthContext = createContext(INITIAL_STATE);

// Reducer
const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        user: null,
        loading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
      localStorage.setItem("user", JSON.stringify(action.payload)); // persist user
      return {
        user: action.payload,
        loading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      localStorage.removeItem("user"); // clear if login fails
      return {
        user: null,
        loading: false,
        error: action.payload,
      };
    case "LOGOUT":
      localStorage.removeItem("user");
      return {
        user: null,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

// Provider component
export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  // Session check on app load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get(
          "https://tourstay-server.onrender.com/api/auth/me",
          { withCredentials: true }
        );
        dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
      } catch (err) {
        dispatch({ type: "LOGOUT" });
      }
    };

    checkSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
