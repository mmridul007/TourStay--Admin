import "./singleHotel.scss";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../components/sidebar/Sidebar";
import useFetch from "../../hooks/useFetch";
// Import Material Icons
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CategoryIcon from "@mui/icons-material/Category";
import TitleIcon from "@mui/icons-material/Title";
import DescriptionIcon from "@mui/icons-material/Description";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ApartmentIcon from "@mui/icons-material/Apartment";
import MapIcon from "@mui/icons-material/Map";
import StraightenIcon from "@mui/icons-material/Straighten";
import StarIcon from "@mui/icons-material/Star";
import WifiIcon from "@mui/icons-material/Wifi";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LanguageIcon from "@mui/icons-material/Language";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const MAX_PHOTOS = 6;
const AVAILABLE_AMENITIES = [
  "WiFi",
  "Pool",
  "Gym",
  "Parking",
  "Restaurant",
  "Room Service",
  "24/7 Front Desk",
  "Air Conditioning",
  "Bar",
  "Beach Access",
  "Spa",
  "Free Breakfast",
  "Airport Shuttle",
  "Pet Friendly",
  "Business Center",
];

const SingleHotel = () => {
  const location = useLocation();
  const hotelId = location.pathname.split("/")[2];
  const { data: hotel, loading, error } = useFetch(`/hotels/find/${hotelId}`);
  const { data: roomsData, loading: roomsLoading } = useFetch("/rooms");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [isAmenitiesOpen, setIsAmenitiesOpen] = useState(false);
  const [isRoomsOpen, setIsRoomsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    city: "",
    address: "",
    mapLocation: "",
    distance: "",
    photos: [],
    title: "",
    desc: "",
    amenities: [],
    rooms: [],
    rating: 0,
    cheapestPrice: 0,
    policies: {
      checkIn: "",
      checkOut: "",
      cancellation: "",
      paymentOptions: [],
    },
    featured: false,
    contact: {
      email: "",
      phone: "",
      website: "",
    },
    status: "active",
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        amenitiesDropdownRef.current &&
        !amenitiesDropdownRef.current.contains(event.target)
      ) {
        setIsAmenitiesOpen(false);
      }
      if (
        roomsDropdownRef.current &&
        !roomsDropdownRef.current.contains(event.target)
      ) {
        setIsRoomsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (hotel) {
      setFormData({
        name: hotel.name || "",
        type: hotel.type || "",
        city: hotel.city || "",
        address: hotel.address || "",
        mapLocation: hotel.mapLocation || "",
        distance: hotel.distance || "",
        photos: hotel.photos || [],
        title: hotel.title || "",
        desc: hotel.desc || "",
        amenities: hotel.amenities || [],
        rooms: hotel.rooms || [],
        rating: hotel.rating || 0,
        cheapestPrice: hotel.cheapestPrice || 0,
        policies: {
          checkIn: hotel.policies?.checkIn || "",
          checkOut: hotel.policies?.checkOut || "",
          cancellation: hotel.policies?.cancellation || "",
          paymentOptions: hotel.policies?.paymentOptions || [],
        },
        featured: hotel.featured || false,
        contact: {
          email: hotel.contact?.email || "",
          phone: hotel.contact?.phone || "",
          website: hotel.contact?.website || "",
        },
        status: hotel.status || "active",
      });
    }
  }, [hotel]);

  const amenitiesDropdownRef = useRef(null);
  const roomsDropdownRef = useRef(null);

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: inputType === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: inputType === "checkbox" ? checked : value,
      }));
    }
  };

  const handleAmenitiesChange = (amenity) => {
    setFormData((prev) => {
      const currentAmenities = prev.amenities || [];
      if (currentAmenities.includes(amenity)) {
        return {
          ...prev,
          amenities: currentAmenities.filter((a) => a !== amenity),
        };
      } else {
        return {
          ...prev,
          amenities: [...currentAmenities, amenity],
        };
      }
    });
  };

  const handleRoomChange = (roomId) => {
    setFormData((prev) => {
      const currentRooms = prev.rooms || [];
      if (currentRooms.includes(roomId)) {
        return {
          ...prev,
          rooms: currentRooms.filter((id) => id !== roomId),
        };
      } else {
        return {
          ...prev,
          rooms: [...currentRooms, roomId],
        };
      }
    });
  };

  const handlePhotoUpload = async (e) => {
    const files = e.target.files;
    setPhotoError("");

    if (formData.photos.length + files.length > MAX_PHOTOS) {
      setPhotoError(
        `You can upload a maximum of ${MAX_PHOTOS} photos. You've already uploaded ${formData.photos.length}.`
      );
      return;
    }

    for (let i = 0; i < files.length; i++) {
      if (!files[i].type.match("image.*")) {
        setPhotoError("Please upload only image files.");
        return;
      }
    }

    setPhotoLoading(true);
    try {
      const newPhotoUrls = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formDataForFile = new FormData();
        formDataForFile.append("file", file);
        formDataForFile.append("upload_preset", "upload");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/dkkdfz2n0/image/upload",
          { method: "POST", body: formDataForFile }
        );

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        newPhotoUrls.push(data.secure_url);
      }

      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...newPhotoUrls],
      }));
    } catch (err) {
      console.error("Error uploading photos:", err);
      setPhotoError("Failed to upload photos. Please try again.");
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleRemovePhoto = async (index) => {
    if (!window.confirm("Are you sure you want to remove this photo?")) {
      return;
    }

    try {
      const photoUrl = formData.photos[index];
      const urlParts = photoUrl.split("/");
      const filenameWithExt = urlParts[urlParts.length - 1];
      const public_id = filenameWithExt.split(".")[0];

      await axios.post("http://localhost:4000/cloudinary/delete", {
        public_id,
      });

      const newPhotos = [...formData.photos];
      newPhotos.splice(index, 1);
      setFormData((prev) => ({ ...prev, photos: newPhotos }));
    } catch (err) {
      console.error("Error removing photo:", err);
      alert("Failed to remove photo. Please try again.");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.put(`/hotels/${hotelId}`, formData);
      setIsModalOpen(false);
      alert("Hotel information updated successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error updating hotel:", error);
      alert("Failed to update hotel information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "statusBadge active";
      case "inactive":
        return "statusBadge inactive";
      case "maintenance":
        return "statusBadge maintenance";
      default:
        return "statusBadge";
    }
  };

  if (loading)
    return <div className="loading">Loading hotel information...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;
  if (!hotel) return <div className="error">Hotel not found</div>;

  return (
    <div className="single">
      <Sidebar />
      <div className="singleContainer">
        <div className="top">
          <div className="left">
            <div className="editButton" onClick={handleEditClick}>
              <EditIcon className="icon" /> Edit
            </div>
            <h1 className="title">Hotel Information</h1>
            <div className="item">
              <div className="imageContainer">
                <img
                  src={hotel.photos?.[0] || "/default-hotel.jpg"}
                  alt={hotel.name}
                  className="itemImg"
                />
                <span className={getStatusBadgeClass(hotel.status)}>
                  {hotel.status}
                </span>
                {hotel.featured && (
                  <span className="featuredBadge">Featured</span>
                )}
              </div>
              <div className="details">
                <h1 className="itemTitle">{hotel.name}</h1>

                <div className="detailsGrid">
                  <div className="detailItem">
                    <CategoryIcon className="icon" />
                    <span className="itemKey">Hotel Type:</span>
                    <span className="itemValue">{hotel.type}</span>
                  </div>

                  <div className="detailItem">
                    <TitleIcon className="icon" />
                    <span className="itemKey">Title:</span>
                    <span className="itemValue">{hotel.title}</span>
                  </div>

                  <div className="detailItem fullWidth">
                    <DescriptionIcon className="icon" />
                    <span className="itemKey">Description:</span>
                    <span className="itemValue description">{hotel.desc}</span>
                  </div>

                  <div className="detailItem">
                    <AttachMoneyIcon className="icon" />
                    <span className="itemKey">Price:</span>
                    <span className="itemValue price">
                      {hotel.cheapestPrice} BDT
                    </span>
                  </div>

                  <div className="detailItem">
                    <ApartmentIcon className="icon" />
                    <span className="itemKey">City:</span>
                    <span className="itemValue">{hotel.city}</span>
                  </div>

                  <div className="detailItem fullWidth">
                    <LocationOnIcon className="icon" />
                    <span className="itemKey">Address:</span>
                    <span className="itemValue">{hotel.address}</span>
                  </div>

                  <div className="detailItem">
                    <MapIcon className="icon" />
                    <span className="itemKey">Map:</span>
                    <span className="itemValue">
                      {hotel.mapLocation ? "Available" : "Not available"}
                    </span>
                  </div>

                  <div className="detailItem">
                    <StraightenIcon className="icon" />
                    <span className="itemKey">Distance:</span>
                    <span className="itemValue">{hotel.distance}</span>
                  </div>

                  <div className="detailItem">
                    <StarIcon className="icon" />
                    <span className="itemKey">Rating:</span>
                    <span className="itemValue rating">
                      {hotel.rating}
                      <span className="outOf">/5</span>
                    </span>
                  </div>

                  <div className="detailItem">
                    <MeetingRoomIcon className="icon" />
                    <span className="itemKey">Total Rooms:</span>
                    <span className="itemValue">
                      {hotel.rooms?.length || 0}
                    </span>
                  </div>

                  <div className="detailItem fullWidth">
                    <WifiIcon className="icon" />
                    <span className="itemKey">Amenities:</span>
                    <span className="itemValue amenities">
                      {hotel.amenities?.length > 0 ? (
                        <div className="amenitiesList">
                          {hotel.amenities.map((amenity, index) => (
                            <span key={index} className="amenityItem">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "No amenities listed"
                      )}
                    </span>
                  </div>

                  <div className="detailItem fullWidth">
                    <HowToRegIcon className="icon" />
                    <span className="itemKey">Check-in/out:</span>
                    <span className="itemValue">
                      {hotel.policies?.checkIn
                        ? `Check-in: ${hotel.policies.checkIn}`
                        : "Check-in: Not specified"}{" "}
                      |
                      {hotel.policies?.checkOut
                        ? ` Check-out: ${hotel.policies.checkOut}`
                        : " Check-out: Not specified"}
                    </span>
                  </div>

                  <div className="detailItem fullWidth">
                    <EmailIcon className="icon" />
                    <span className="itemKey">Contact:</span>
                    <span className="itemValue contact">
                      <span>
                        <EmailIcon fontSize="small" />{" "}
                        {hotel.contact?.email || "N/A"}
                      </span>
                      <span>
                        <PhoneIcon fontSize="small" />{" "}
                        {hotel.contact?.phone || "N/A"}
                      </span>
                      {hotel.contact?.website && (
                        <span>
                          <LanguageIcon fontSize="small" />{" "}
                          {hotel.contact.website}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {hotel.photos?.length > 1 && (
              <div className="photoGallery">
                <h3 className="galleryTitle">Hotel Gallery</h3>
                <div className="photoGrid">
                  {hotel.photos.slice(1).map((photo, index) => (
                    <div key={index} className="galleryPhoto">
                      <img src={photo} alt={`Hotel view ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Edit Modal --- */}
      {isModalOpen && (
        <div className="modal">
          <div className="modalContent">
            <div className="modalHeader">
              <h2>
                <EditIcon className="headerIcon" /> Edit Hotel Information
              </h2>
              <CloseIcon
                className="closeIcon"
                onClick={() => setIsModalOpen(false)}
              />
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="formGrid">
                {/* --- Basic Info Fields --- */}
                <div className="formGroup">
                  <label>
                    <ApartmentIcon className="formIcon" /> Hotel Name: *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Hotel Name"
                  />
                </div>

                <div className="formGroup">
                  <label>
                    <CategoryIcon className="formIcon" /> Hotel Type: *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Resort">Resort</option>
                    <option value="Villa">Villa</option>
                    <option value="Cabin">Cabin</option>
                  </select>
                </div>

                <div className="formGroup">
                  <label>
                    <TitleIcon className="formIcon" /> Title: *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Hotel Title"
                  />
                </div>

                <div className="formGroup">
                  <label>
                    <StarIcon className="formIcon" /> Rating (0-5):
                  </label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="Rating"
                  />
                </div>

                <div className="formGroup fullWidth">
                  <label>
                    <DescriptionIcon className="formIcon" /> Description: *
                  </label>
                  <textarea
                    name="desc"
                    value={formData.desc}
                    onChange={handleInputChange}
                    required
                    placeholder="Hotel Description"
                    rows="4"
                  />
                </div>
                {/* --- Location Fields --- */}
                <div className="formGroup">
                  <label>
                    <ApartmentIcon className="formIcon" /> City: *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="City"
                  />
                </div>

                <div className="formGroup">
                  <label>
                    <LocationOnIcon className="formIcon" /> Address: *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="Address"
                  />
                </div>

                <div className="formGroup">
                  <label>
                    <MapIcon className="formIcon" /> Map Location (Google map
                    coordinates):
                  </label>
                  <input
                    type="text"
                    name="mapLocation"
                    value={formData.mapLocation}
                    onChange={handleInputChange}
                    placeholder="Map Location URL or Coordinates"
                  />
                </div>

                <div className="formGroup">
                  <label>
                    <StraightenIcon className="formIcon" /> Distance: *
                  </label>
                  <input
                    type="text"
                    name="distance"
                    value={formData.distance}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 500m from city center"
                  />
                </div>
                {/* --- Price & Status --- */}
                <div className="formGroup">
                  <label>
                    <AttachMoneyIcon className="formIcon" /> Price (BDT): *
                  </label>
                  <input
                    type="number"
                    name="cheapestPrice"
                    value={formData.cheapestPrice}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="Cheapest Price"
                  />
                </div>

                <div className="formGroup">
                  <label>
                    <HowToRegIcon className="formIcon" /> Status:
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                {/* --- Amenities Dropdown --- */}
                <div className="formGroup fullWidth" ref={amenitiesDropdownRef}>
                  <label>
                    <WifiIcon className="formIcon" /> Amenities:
                  </label>
                  <div className="multiSelectContainer">
                    <div
                      className="multiSelectDropdown"
                      onClick={() => setIsAmenitiesOpen(!isAmenitiesOpen)}
                    >
                      <div className="multiSelectText">
                        {formData.amenities?.length === 0
                          ? "Select amenities"
                          : `${formData.amenities?.length} amenities selected`}
                      </div>
                      <KeyboardArrowDownIcon
                        className={`arrowIcon ${isAmenitiesOpen ? "open" : ""}`}
                      />
                    </div>
                    {isAmenitiesOpen && (
                      <div className="multiSelectMenu">
                        {AVAILABLE_AMENITIES.map((amenity) => (
                          <div key={amenity} className="multiSelectItem">
                            <input
                              type="checkbox"
                              id={`modal-amenity-${amenity}`}
                              checked={formData.amenities?.includes(amenity)}
                              onChange={() => handleAmenitiesChange(amenity)}
                            />
                            <label htmlFor={`modal-amenity-${amenity}`}>
                              {amenity}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* --- Rooms Dropdown --- */}
                <div className="formGroup fullWidth" ref={roomsDropdownRef}>
                  <label>
                    <MeetingRoomIcon className="formIcon" /> Rooms:
                  </label>
                  <div className="multiSelectContainer">
                    <div
                      className="multiSelectDropdown"
                      onClick={() => setIsRoomsOpen(!isRoomsOpen)}
                    >
                      <div className="multiSelectText">
                        {formData.rooms?.length === 0
                          ? "Select rooms"
                          : `${formData.rooms?.length} rooms selected`}
                      </div>
                      <KeyboardArrowDownIcon
                        className={`arrowIcon ${isRoomsOpen ? "open" : ""}`}
                      />
                    </div>
                    {isRoomsOpen && (
                      <div className="multiSelectMenu">
                        {roomsLoading ? (
                          <div className="loading">Loading rooms...</div>
                        ) : roomsData?.length > 0 ? (
                          roomsData.map((room) => (
                            <div key={room._id} className="multiSelectItem">
                              <input
                                type="checkbox"
                                id={`modal-room-${room._id}`}
                                checked={formData.rooms?.includes(room._id)}
                                onChange={() => handleRoomChange(room._id)}
                              />
                              <label htmlFor={`modal-room-${room._id}`}>
                                {room.title} (Type: {room.roomType || "N/A"},
                                Max: {room.maxPeople})
                              </label>
                            </div>
                          ))
                        ) : (
                          <div className="noRooms">
                            No rooms available to select.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* --- Policy Fields --- */}
                <div className="formGroup">
                  <label>
                    <AccessTimeIcon className="formIcon" /> Check-in Time:
                  </label>
                  <input
                    type="text"
                    name="policies.checkIn"
                    value={formData.policies?.checkIn}
                    onChange={handleInputChange}
                    placeholder="e.g., 2:00 PM"
                  />
                </div>

                <div className="formGroup">
                  <label>
                    <AccessTimeIcon className="formIcon" /> Check-out Time:
                  </label>
                  <input
                    type="text"
                    name="policies.checkOut"
                    value={formData.policies?.checkOut}
                    onChange={handleInputChange}
                    placeholder="e.g., 12:00 PM"
                  />
                </div>

                <div className="formGroup fullWidth">
                  <label>
                    <CreditCardIcon className="formIcon" /> Cancellation Policy:
                  </label>
                  <input
                    type="text"
                    name="policies.cancellation"
                    value={formData.policies?.cancellation}
                    onChange={handleInputChange}
                    placeholder="Cancellation Policy Details"
                  />
                </div>

                <div className="formGroup fullWidth">
                  <label>
                    <CreditCardIcon className="formIcon" /> Payment Options
                    (comma separated):
                  </label>
                  <input
                    type="text"
                    value={formData.policies?.paymentOptions?.join(", ") || ""}
                    onChange={(e) => {
                      const paymentOptions = e.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean);
                      setFormData((prev) => ({
                        ...prev,
                        policies: {
                          ...prev.policies,
                          paymentOptions,
                        },
                      }));
                    }}
                    placeholder="Credit Card, Cash, bKash, etc."
                  />
                </div>

                {/* --- Contact Fields --- */}
                <div className="formGroup">
                  <label>
                    <EmailIcon className="formIcon" /> Contact Email:
                  </label>
                  <input
                    type="email"
                    name="contact.email"
                    value={formData.contact?.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                  />
                </div>

                <div className="formGroup">
                  <label>
                    <PhoneIcon className="formIcon" /> Contact Phone:
                  </label>
                  <input
                    type="tel"
                    name="contact.phone"
                    value={formData.contact?.phone}
                    onChange={handleInputChange}
                    placeholder="Phone"
                  />
                </div>

                <div className="formGroup">
                  <label>
                    <LanguageIcon className="formIcon" /> Website:
                  </label>
                  <input
                    type="url"
                    name="contact.website"
                    value={formData.contact?.website}
                    onChange={handleInputChange}
                    placeholder="Website URL (e.g., https://example.com)"
                  />
                </div>

                {/* --- Featured Checkbox --- */}
                <div className="formGroup checkboxGroup fullWidth">
                  <label className="checkboxLabel">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                    />
                    <span>Mark as Featured Hotel</span>
                  </label>
                </div>

                {/* --- Photo Upload Section --- */}
                <div className="formGroup photoUpload fullWidth">
                  <label>
                    <PhotoCameraIcon className="formIcon" /> Hotel Photos:
                  </label>
                  <div className="photoUploadSection">
                    <div className="uploadButtonContainer">
                      <label className="uploadButton" htmlFor="photoUpload">
                        <PhotoCameraIcon /> Select Photos
                        <input
                          id="photoUpload"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          disabled={
                            photoLoading || formData.photos.length >= MAX_PHOTOS
                          }
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>
                    {photoLoading && (
                      <p className="uploadingMessage">Uploading photos...</p>
                    )}
                    {photoError && <p className="error">{photoError}</p>}
                    <p className="photoLimit">
                      <span
                        className={
                          formData.photos.length >= MAX_PHOTOS
                            ? "limitReached"
                            : ""
                        }
                      >
                        {formData.photos.length}/{MAX_PHOTOS}
                      </span>{" "}
                      photos uploaded
                    </p>
                  </div>
                  <div className="photoPreview">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="photoItem">
                        <img src={photo} alt={`Hotel photo ${index + 1}`} />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="removePhotoButton"
                          title="Remove photo"
                        >
                          <CloseIcon fontSize="small" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* --- Form Buttons --- */}
              <div className="buttonGroup">
                <button
                  type="submit"
                  className="submitButton"
                  disabled={isSubmitting || photoLoading}
                >
                  {isSubmitting ? (
                    <>Saving Changes...</>
                  ) : (
                    <>
                      <CheckCircleIcon /> Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="cancelButton"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  <CloseIcon /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleHotel;
