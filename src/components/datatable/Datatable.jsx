import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { Link, useLocation } from "react-router-dom";
import useFetch from "../../hooks/useFetch.js";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Datatable = ({ columns }) => {
  const location = useLocation();
  const path = location.pathname.split("/")[1];
  const [list, setList] = useState([]);
  const { data, loading, error } = useFetch(
    `https://tourstay-server.onrender.com/api/${path}`
  );

  useEffect(() => {
    setList(data);
  }, [data]);

  const confirmDelete = (itemId, hotelId) => {
    toast.info(
      <div>
        Are you sure you want to delete this item?
        <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
          <button
            onClick={() => handleDelete(itemId, hotelId)}
            style={{
              padding: "5px 10px",
              backgroundColor: "#7451F8",
              color: "white",
              cursor: "pointer",
            }}
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss()}
            style={{ padding: "5px 10px" }}
          >
            No
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
      }
    );
  };

  const handleDelete = async (itemId, hotelId) => {
    let deleteUrl;

    if (path === "rooms") {
      deleteUrl = `https://tourstay-server.onrender.com/api/rooms/${itemId}/${hotelId}`;
    } else {
      deleteUrl = `https://tourstay-server.onrender.com/api/${path}/${itemId}`;
    }

    try {
      await axios.delete(deleteUrl);
      setList(list.filter((item) => item._id !== itemId));
      toast.success("Item deleted successfully");
    } catch (err) {
      toast.error("Failed to delete item");
    } finally {
      toast.dismiss();
    }
  };

  const getPath = (row) => {
    if (row.username) return `/users/${row._id}`;
    if (row.distance) return `/hotels/${row._id}`;
    if (row.roomNumbers) return `/rooms/${row._id}`;
    return `/unknown/${row._id}`;
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Link to={getPath(params.row)} style={{ textDecoration: "none" }}>
              <div className="viewButton">View</div>
            </Link>
            <div
              className="deleteButton"
              onClick={() => confirmDelete(params.row._id, params.row.hotelId)}
            >
              Delete
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="datatable">
      <div className="datatableTitle">
        {path}
        <Link to={`/${path}/new`} className="link">
          Add New
        </Link>
      </div>
      <DataGrid
        className="datagrid"
        rows={list}
        columns={columns.concat(actionColumn)}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
        getRowId={(row) => row._id}
      />
      <ToastContainer />
    </div>
  );
};

export default Datatable;
