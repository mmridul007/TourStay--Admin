import "./singleRoom.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import { useLocation } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import TitleIcon from "@mui/icons-material/Title";
import DescriptionIcon from "@mui/icons-material/Description";
import PeopleIcon from "@mui/icons-material/People";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import HotelIcon from "@mui/icons-material/Hotel";

const SingleRoom = () => {
  const location = useLocation();
  const userId = location.pathname.split("/")[2];
  const { data, loading, error } = useFetch(`/rooms/${userId}`);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    desc: "",
    maxPeople: "",
    price: "",
    roomNumbers: "",
    title: "",
  });

  const handleEditClick = () => {
    setFormData({
      desc: data.desc || "",
      maxPeople: data.maxPeople || "",
      price: data.price || "",
      roomNumbers: data.roomNumbers
        ? data.roomNumbers.map((room) => room.number).join(", ")
        : "",
      title: data.title || "",
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updatedData = {
        ...formData,
        roomNumbers: formData.roomNumbers
          .split(",")
          .map((num) => ({ number: num.trim() })),
      };
      await axios.put(`/rooms/${userId}`, updatedData);
      setIsModalOpen(false);
      alert("Room information updated successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error updating room:", error);
      alert("Failed to update room information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error loading room data</div>;

  return (
    <div className="single">
      <Sidebar />
      <div className="singleContainer">
        <div className="top">
          <div className="left">
            <div className="editButton" onClick={handleEditClick}>
              <EditIcon /> Edit
            </div>
            <h1 className="title">Room Information</h1>
            <div className="roomInfo">
              <div className="roomHeader">
                <HotelIcon className="headerIcon" />
                <h1 className="roomTitle">{data.title}</h1>
              </div>
              <div className="details">
                <div className="detailItem">
                  <DescriptionIcon className="icon" />
                  <span className="itemKey">Description:</span>
                  <span className="itemValue">{data.desc}</span>
                </div>
                <div className="detailItem">
                  <PeopleIcon className="icon" />
                  <span className="itemKey">Max People:</span>
                  <span className="itemValue">{data.maxPeople} guests</span>
                </div>
                <div className="detailItem">
                  <PriceChangeIcon className="icon" />
                  <span className="itemKey">Price:</span>
                  <span className="itemValue">{data.price} BDT per night</span>
                </div>
                <div className="detailItem">
                  <MeetingRoomIcon className="icon" />
                  <span className="itemKey">Room Numbers:</span>
                  <span className="itemValue">
                    {data.roomNumbers && data.roomNumbers.length > 0
                      ? data.roomNumbers.map((room) => room.number).join(", ")
                      : "No rooms available"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modalContent">
            <div className="modalHeader">
              <h2>Edit Room Information</h2>
              <CloseIcon
                className="closeIcon"
                onClick={() => setIsModalOpen(false)}
              />
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="formGroup">
                <label htmlFor="title">
                  <TitleIcon className="formIcon" />
                  Room Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter room title"
                  required
                />
              </div>
              <div className="formGroup">
                <label htmlFor="desc">
                  <DescriptionIcon className="formIcon" />
                  Description
                </label>
                <textarea
                  id="desc"
                  name="desc"
                  value={formData.desc}
                  onChange={handleInputChange}
                  placeholder="Enter room description"
                  rows="4"
                  required
                />
              </div>
              <div className="formGroup">
                <label htmlFor="maxPeople">
                  <PeopleIcon className="formIcon" />
                  Max People
                </label>
                <input
                  type="number"
                  id="maxPeople"
                  name="maxPeople"
                  value={formData.maxPeople}
                  onChange={handleInputChange}
                  placeholder="Maximum capacity"
                  min="1"
                  required
                />
              </div>
              <div className="formGroup">
                <label htmlFor="price">
                  <PriceChangeIcon className="formIcon" />
                  Price (BDT)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Price per night"
                  min="0"
                  required
                />
              </div>
              <div className="formGroup">
                <label htmlFor="roomNumbers">
                  <MeetingRoomIcon className="formIcon" />
                  Room Numbers
                </label>
                <textarea
                  id="roomNumbers"
                  name="roomNumbers"
                  value={formData.roomNumbers}
                  onChange={handleInputChange}
                  placeholder="Enter room numbers (separate with commas)"
                  rows="3"
                />
              </div>
              <div className="buttonGroup">
                <button
                  type="button"
                  className="cancelButton"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submitButton"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleRoom;
