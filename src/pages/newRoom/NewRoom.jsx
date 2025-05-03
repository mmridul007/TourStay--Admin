import "./newRoom.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import { useState } from "react";
import { roomInputs } from "../../formSource";
import useFetch from "../../hooks/useFetch";
import axios from "axios";

const NewRoom = () => {
  const [info, setInfo] = useState({});
  const [hotelId, setHotelId] = useState(undefined);
  const [rooms, setRooms] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const { data, loading, error } = useFetch("/hotels");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setInfo((prev) => ({ ...prev, [id]: value }));

    // Clear error when user starts typing
    if (formErrors[id]) {
      setFormErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validate required fields
    roomInputs.forEach((input) => {
      if (input.required && !info[input.id]) {
        errors[input.id] = `${input.label} is required`;
      }
    });

    // Validate room numbers
    if (!rooms.trim()) {
      errors.rooms = "Room numbers are required";
    }

    // Validate hotel selection
    if (!hotelId) {
      errors.hotelId = "Please select a hotel";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const roomNumbers = rooms
        .split(",")
        .map((room) => ({ number: room.trim() }))
        .filter((room) => room.number);

      await axios.post(`https://tourstay-server.onrender.com/api/rooms/${hotelId}`, { ...info,hotelId:hotelId, roomNumbers });
      alert("Room created successfully!");

      // Reset form after successful submission
      setInfo({});
      setRooms("");
      setFormErrors({});
    } catch (err) {
      console.error("Error creating room:", err);
      alert("Failed to create room. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <div className="top">
          <h1>Add New Room</h1>
        </div>
        <div className="bottom">
          <div className="formWrapper">
            <form onSubmit={handleSubmit}>
              <div className="formSection">
                <h3 className="sectionTitle">Room Information</h3>
                <div className="formGrid">
                  {roomInputs.map((input) => (
                    <div
                      className={`formInput ${
                        input.fullWidth ? "full-width" : ""
                      }`}
                      key={input.id}
                    >
                      <label htmlFor={input.id}>
                        {input.label} {input.required && "*"}
                      </label>
                      <input
                        id={input.id}
                        type={input.type}
                        placeholder={input.placeholder}
                        value={info[input.id] || ""}
                        onChange={handleChange}
                        className={formErrors[input.id] ? "input-error" : ""}
                      />
                      {formErrors[input.id] && (
                        <span className="errorText">
                          {formErrors[input.id]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="formSection">
                <h3 className="sectionTitle">Room Numbers</h3>
                <div className="formInput full-width">
                  <label htmlFor="rooms">Room Numbers *</label>
                  <textarea
                    id="rooms"
                    value={rooms}
                    onChange={(e) => {
                      setRooms(e.target.value);
                      if (formErrors.rooms) {
                        setFormErrors((prev) => ({ ...prev, rooms: "" }));
                      }
                    }}
                    placeholder="Enter room numbers separated by commas (e.g. 101, 102, 103)"
                    className={formErrors.rooms ? "input-error" : ""}
                  />
                  {formErrors.rooms && (
                    <span className="errorText">{formErrors.rooms}</span>
                  )}
                  <p className="helperText">
                    Enter all room numbers separated by commas
                  </p>
                </div>
              </div>

              <div className="formSection">
                <h3 className="sectionTitle">Hotel Selection</h3>
                <div className="formInput full-width">
                  <label htmlFor="hotelId">Select Hotel *</label>
                  <select
                    id="hotelId"
                    value={hotelId || ""}
                    onChange={(e) => {
                      setHotelId(e.target.value);
                      if (formErrors.hotelId) {
                        setFormErrors((prev) => ({ ...prev, hotelId: "" }));
                      }
                    }}
                    className={formErrors.hotelId ? "input-error" : ""}
                  >
                    <option value="">-- Select a hotel --</option>
                    {loading ? (
                      <option disabled>Loading hotels...</option>
                    ) : (
                      data &&
                      data.map((hotel) => (
                        <option key={hotel._id} value={hotel._id}>
                          {hotel.name}
                        </option>
                      ))
                    )}
                  </select>
                  {formErrors.hotelId && (
                    <span className="errorText">{formErrors.hotelId}</span>
                  )}
                </div>
              </div>

              <div className="submitSection">
                <button
                  type="submit"
                  className="submitButton"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>Creating Room...</>
                  ) : (
                    <>
                      <AddBusinessIcon />
                      <span>Create Room</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewRoom;
