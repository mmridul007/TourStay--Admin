import "./single.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VerifiedIcon from "@mui/icons-material/Verified";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PhotoIcon from "@mui/icons-material/Photo";
import { useLocation } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import { useState } from "react";

const Single = () => {
  const location = useLocation();
  const userId = location.pathname.split("/")[2];
  const { data, loading, error } = useFetch(`/users/${userId}`);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [formData, setFormData] = useState({
    img: "",
    username: "",
    fullName: "",
    email: "",
    phone: "",
    city: "",
    isAdmin: false,
  });

  const handleEditClick = () => {
    setFormData({
      img: data.img,
      username: data.username,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      city: data.city,
      isAdmin: data.isAdmin,
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    setPhotoError("");

    if (!file) return;

    if (!file.type.match("image.*")) {
      setPhotoError("Please upload only image files.");
      return;
    }

    setPhotoLoading(true);

    try {
      // Delete the old photo from Cloudinary if it exists
      if (formData.img && !formData.img.includes("no-image-icon")) {
        const urlParts = formData.img.split("/");
        const filenameWithExt = urlParts[urlParts.length - 1];
        const public_id = filenameWithExt.split(".")[0];

        await axios.post("http://localhost:4000/cloudinary/delete", {
          public_id,
        });
      }

      // Upload new photo
      const formDataPhoto = new FormData();
      formDataPhoto.append("file", file);
      formDataPhoto.append("upload_preset", "upload");

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dkkdfz2n0/image/upload",
        formDataPhoto
      );

      setFormData((prevData) => ({
        ...prevData,
        img: response.data.secure_url,
      }));
    } catch (err) {
      console.error("Error uploading photo:", err);
      setPhotoError("Failed to upload photo. Please try again.");
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.put(`/users/${userId}`, formData);
      setIsModalOpen(false);
      alert("User information updated successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error loading user data</div>;

  return (
    <div className="single">
      <Sidebar />
      <div className="singleContainer">
        <div className="top">
          <div className="left">
            <div className="editButton" onClick={handleEditClick}>
              <EditIcon /> Edit
            </div>
            <h1 className="title">User Information</h1>
            <div className="item">
              <img
                src={
                  data.img ||
                  "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
                }
                alt={data.username}
                className="itemImg"
              />
              <div className="details">
                <h1 className="itemTitle">{data.fullName}</h1>
                <div className="detailItem">
                  <PersonIcon className="icon" />
                  <span className="itemKey">Username:</span>
                  <span className="itemValue">{data.username}</span>
                </div>
                <div className="detailItem">
                  <EmailIcon className="icon" />
                  <span className="itemKey">Email:</span>
                  <span className="itemValue">{data.email}</span>
                </div>
                <div className="detailItem">
                  <PhoneIcon className="icon" />
                  <span className="itemKey">Phone:</span>
                  <span className="itemValue">{data.phone}</span>
                </div>
                <div className="detailItem">
                  <LocationOnIcon className="icon" />
                  <span className="itemKey">City:</span>
                  <span className="itemValue">
                    {data.city || "Not specified"}
                  </span>
                </div>
                <div className="detailItem">
                  <LocationOnIcon className="icon" />
                  <span className="itemKey">Country:</span>
                  <span className="itemValue">{data.country}</span>
                </div>
                <div className="detailItem">
                  <AdminPanelSettingsIcon
                    className={`icon ${data.isAdmin ? "admin" : ""}`}
                  />
                  <span className="itemKey">Admin:</span>
                  <span className={`itemValue ${data.isAdmin ? "admin" : ""}`}>
                    {data.isAdmin ? "Yes" : "No"}
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
            <h2>Edit User Information</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="formGroup photoUpload">
                <div className="photoPreview">
                  <img
                    src={
                      formData.img ||
                      "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
                    }
                    alt="Profile"
                    className="previewImage"
                  />
                  <label htmlFor="photoInput" className="photoButton">
                    <PhotoIcon />
                    {photoLoading ? "Uploading..." : "Change Photo"}
                  </label>
                  <input
                    type="file"
                    id="photoInput"
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={photoLoading}
                  />
                </div>
                {photoError && <span className="error">{photoError}</span>}
              </div>
              <div className="formGroup">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Username"
                  required
                />
              </div>
              <div className="formGroup">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  required
                />
              </div>
              <div className="formGroup">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  required
                />
              </div>
              <div className="formGroup">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone"
                  required
                />
              </div>
              <div className="formGroup">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                />
              </div>
              <div className="formGroup checkboxGroup">
                <label>
                  <input
                    type="checkbox"
                    name="isAdmin"
                    checked={formData.isAdmin}
                    onChange={handleInputChange}
                  />
                  <span>Admin Privileges</span>
                </label>
              </div>
              <div className="buttonGroup">
                <button type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting || photoLoading}>
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

export default Single;
