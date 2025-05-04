import "./newHotel.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useState, useRef, useEffect } from "react";
import useFetch from "../../hooks/useFetch";
import axios from "axios";

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

const NewHotel = () => {
  const [files, setFiles] = useState([]);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isAmenitiesOpen, setIsAmenitiesOpen] = useState(false);
  const [isRoomsOpen, setIsRoomsOpen] = useState(false);
  const { data: roomsData, loading: roomsLoading } = useFetch("https://tourstay-server.onrender.com/api/rooms");

  const amenitiesDropdownRef = useRef(null);
  const roomsDropdownRef = useRef(null);

  const [info, setInfo] = useState({
    name: "",
    type: "",
    city: "",
    address: "",
    mapLocation: "",
    distance: "",
    title: "",
    desc: "",
    cheapestPrice: 0,
    featured: false,
    bookingType: "Hotels",
    product_category: "Hotel",
    status: "active",
    rating: 0,
    policies: {
      checkIn: "",
      checkOut: "",
      cancellation: "",
    },
    contact: {
      email: "",
      phone: "",
    },
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

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;

    if (id.includes(".")) {
      const [parent, child] = id.split(".");
      setInfo((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setInfo((prev) => ({
        ...prev,
        [id]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleAmenitiesChange = (amenity) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((item) => item !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const handleRoomChange = (roomId) => {
    if (rooms.includes(roomId)) {
      setRooms(rooms.filter((id) => id !== roomId));
    } else {
      setRooms([...rooms, roomId]);
    }
  };

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    setPhotoError("");

    if (uploadedPhotos.length + selectedFiles.length > MAX_PHOTOS) {
      setPhotoError(
        `You can upload a maximum of ${MAX_PHOTOS} photos. You've already uploaded ${uploadedPhotos.length}.`
      );
      return;
    }

    for (let file of selectedFiles) {
      if (!file.type.match("image.*")) {
        setPhotoError("Please upload only image files.");
        return;
      }
    }

    setFiles(selectedFiles);
    setPhotoLoading(true);

    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "upload");

        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/dkkdfz2n0/image/upload",
          formData
        );
        return response.data.secure_url;
      });

      const urls = await Promise.all(uploadPromises);
      setUploadedPhotos((prev) => [...prev, ...urls]);
    } catch (err) {
      console.error("Error uploading photos:", err);
      setPhotoError("Failed to upload photos. Please try again.");
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleRemovePhoto = async (index) => {
    try {
      const photoUrl = uploadedPhotos[index];
      const urlParts = photoUrl.split("/");
      const filenameWithExt = urlParts[urlParts.length - 1];
      const public_id = filenameWithExt.split(".")[0];

      await axios.post("https://tourstay-server.onrender.com/cloudinary/delete", {
        public_id,
      });

      const newPhotos = [...uploadedPhotos];
      newPhotos.splice(index, 1);
      setUploadedPhotos(newPhotos);
    } catch (err) {
      console.error("Error removing photo:", err);
      alert("Failed to remove photo. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newHotel = {
        ...info,
        rooms,
        photos: uploadedPhotos,
        amenities,
        policies: {
          ...info.policies,
        },
      };

      await axios.post("https://tourstay-server.onrender.com/api/hotels", newHotel);
      alert("Hotel created successfully!");
      window.location.href = "/hotels";
    } catch (err) {
      console.error("Error creating hotel:", err);
      alert("Failed to create hotel. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <div className="top">
          <h1>Add New Hotel</h1>
        </div>
        <div className="bottom">
          <div className="formWrapper">
            <form onSubmit={handleSubmit}>
              {/* Basic Information Section */}
              <div className="formSection">
                <h2 className="sectionTitle">Basic Information</h2>
                <div className="formGrid">
                  <div className="formInput">
                    <label>Hotel Name *</label>
                    <input
                      id="name"
                      onChange={handleChange}
                      type="text"
                      placeholder="Enter hotel name"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Type *</label>
                    <select id="type" onChange={handleChange} required>
                      <option value="">Select Type</option>
                      <option value="Hotel">Hotel</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Resort">Resort</option>
                      <option value="Villa">Villa</option>
                      <option value="Cabin">Cabin</option>
                    </select>
                  </div>

                  <div className="formInput">
                    <label>Title *</label>
                    <input
                      id="title"
                      onChange={handleChange}
                      type="text"
                      placeholder="Enter hotel title"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Price starts at (BDT) *</label>
                    <input
                      id="cheapestPrice"
                      onChange={handleChange}
                      type="number"
                      placeholder="Enter price"
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div className="formInput full-width">
                  <label>Description *</label>
                  <textarea
                    id="desc"
                    onChange={handleChange}
                    placeholder="Enter hotel description"
                    required
                    rows="4"
                  />
                </div>
              </div>

              {/* Location Information Section */}
              <div className="formSection">
                <h2 className="sectionTitle">Location Information</h2>
                <div className="formGrid">
                  <div className="formInput">
                    <label>City *</label>
                    <input
                      id="city"
                      onChange={handleChange}
                      type="text"
                      placeholder="Enter city"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Address *</label>
                    <input
                      id="address"
                      onChange={handleChange}
                      type="text"
                      placeholder="Enter address"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Map Location(Google map coordinates) *</label>
                    <input
                      id="mapLocation"
                      onChange={handleChange}
                      type="text"
                      placeholder="Enter map location coordinates"
                      required
                    />
                  </div>

                  <div className="formInput">
                    <label>Distance *</label>
                    <input
                      id="distance"
                      onChange={handleChange}
                      type="text"
                      placeholder="e.g., 500m from city center"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Amenities Section */}
              <div className="formSection">
                <h2 className="sectionTitle">Amenities & Features</h2>
                <div
                  className="multiSelectContainer"
                  ref={amenitiesDropdownRef}
                >
                  <div
                    className="multiSelectDropdown"
                    onClick={() => setIsAmenitiesOpen(!isAmenitiesOpen)}
                  >
                    <div className="multiSelectText">
                      {amenities.length === 0
                        ? "Select amenities"
                        : `${amenities.length} amenities selected`}
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
                            id={`amenity-${amenity}`}
                            checked={amenities.includes(amenity)}
                            onChange={() => handleAmenitiesChange(amenity)}
                          />
                          <label htmlFor={`amenity-${amenity}`}>
                            {amenity}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Room Selection Section */}
              <div className="formSection">
                <h2 className="sectionTitle">Room Selection</h2>
                <div className="multiSelectContainer" ref={roomsDropdownRef}>
                  <div
                    className="multiSelectDropdown"
                    onClick={() => setIsRoomsOpen(!isRoomsOpen)}
                  >
                    <div className="multiSelectText">
                      {rooms.length === 0
                        ? "Select rooms"
                        : `${rooms.length} rooms selected`}
                    </div>
                    <KeyboardArrowDownIcon
                      className={`arrowIcon ${isRoomsOpen ? "open" : ""}`}
                    />
                  </div>
                  {isRoomsOpen && (
                    <div className="multiSelectMenu">
                      {roomsLoading ? (
                        <div className="loading">Loading rooms...</div>
                      ) : (
                        roomsData?.map((room) => (
                          <div key={room._id} className="multiSelectItem">
                            <input
                              type="checkbox"
                              id={`room-${room._id}`}
                              checked={rooms.includes(room._id)}
                              onChange={() => handleRoomChange(room._id)}
                            />
                            <label htmlFor={`room-${room._id}`}>
                              {room.title}
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Hotel Images Section */}
              <div className="formSection">
                <h2 className="sectionTitle">Hotel Images</h2>
                <div className="imageUploadArea">
                  <input
                    type="file"
                    id="file"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    disabled={
                      photoLoading || uploadedPhotos.length >= MAX_PHOTOS
                    }
                  />
                  <label htmlFor="file" className="uploadButton">
                    <DriveFolderUploadOutlinedIcon />
                    <span>Upload Photos</span>
                  </label>
                  <p className="photoLimit">
                    {uploadedPhotos.length}/{MAX_PHOTOS} photos
                  </p>
                  {photoLoading && (
                    <p className="status">Uploading photos...</p>
                  )}
                  {photoError && <p className="error">{photoError}</p>}
                </div>

                <div className="photoGallery">
                  {uploadedPhotos.map((photo, index) => (
                    <div key={index} className="photoItem">
                      <img src={photo} alt={`Hotel preview ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="removePhotoButton"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Policies Section */}
              <div className="formSection">
                <h2 className="sectionTitle">Policies</h2>
                <div className="formGrid">
                  <div className="formInput">
                    <label>Check-in Time</label>
                    <input
                      id="policies.checkIn"
                      onChange={handleChange}
                      type="text"
                      placeholder="e.g., 2:00 PM"
                    />
                  </div>

                  <div className="formInput">
                    <label>Check-out Time</label>
                    <input
                      id="policies.checkOut"
                      onChange={handleChange}
                      type="text"
                      placeholder="e.g., 12:00 PM"
                    />
                  </div>

                  <div className="formInput full-width">
                    <label>Cancellation Policy</label>
                    <input
                      id="policies.cancellation"
                      onChange={handleChange}
                      type="text"
                      placeholder="Enter cancellation policy"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="formSection">
                <h2 className="sectionTitle">Contact Information</h2>
                <div className="formGrid">
                  <div className="formInput">
                    <label>Contact Email</label>
                    <input
                      id="contact.email"
                      onChange={handleChange}
                      type="email"
                      placeholder="Enter contact email"
                    />
                  </div>

                  <div className="formInput">
                    <label>Contact Phone</label>
                    <input
                      id="contact.phone"
                      onChange={handleChange}
                      type="tel"
                      placeholder="Enter contact phone"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="formSection">
                <h2 className="sectionTitle">Additional Information</h2>
                <div className="formGrid">
                  <div className="formInput">
                    <label>Status</label>
                    <select
                      id="status"
                      onChange={handleChange}
                      defaultValue="active"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div className="formInput">
                    <label>Featured</label>
                    <select
                      id="featured"
                      onChange={handleChange}
                      defaultValue={false}
                    >
                      <option value={false}>No</option>
                      <option value={true}>Yes</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="submitSection">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="submitButton"
                >
                  {isSubmitting ? "Creating Hotel..." : "Create Hotel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewHotel;
