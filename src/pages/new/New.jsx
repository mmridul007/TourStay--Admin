import "./new.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useState } from "react";
import axios from "axios";

const New = ({ inputs, title }) => {
  const [file, setFile] = useState(null);
  const [info, setInfo] = useState({});
  const [previewUrl, setPreviewUrl] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setPhotoError("");

    if (selectedFile) {
      if (!selectedFile.type.match("image.*")) {
        setPhotoError("Please upload only image files (JPG, PNG, GIF, etc.)");
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        // 5MB limit
        setPhotoError("File size must be less than 5MB");
        return;
      }

      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreviewUrl("");
    setPhotoError("");
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setInfo((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (formErrors[id]) {
      setFormErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validate required fields from inputs prop
    inputs.forEach((input) => {
      if (input.required && !info[input.id]) {
        errors[input.id] = `${input.label} is required`;
      }
    });

    // Basic email validation
    if (info.email && !/\S+@\S+\.\S+/.test(info.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (info.phone && !/^\+?[\d\s-]{10,}$/.test(info.phone)) {
      errors.phone = "Please enter a valid phone number";
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
      let imageUrl = "";

      if (file) {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "upload");

        const uploadRes = await axios.post(
          "https://api.cloudinary.com/v1_1/dkkdfz2n0/image/upload",
          data
        );

        imageUrl = uploadRes.data.secure_url;
      }

      const newUser = {
        ...info,
        img: imageUrl || undefined,
        isAdmin: info.isAdmin || false,
      };

      await axios.post("/auth/register", newUser);
      alert("User created successfully!");

      // Reset form after successful submission
      setInfo({});
      setFile(null);
      setPreviewUrl("");
      setFormErrors({});
    } catch (err) {
      console.error("Error creating user:", err);
      alert("Failed to create user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        
        <div className="top">
          <h1>{title}</h1>
        </div>
        <div className="bottom">
          <div className="formWrapper">
            <form onSubmit={handleSubmit}>
              <div className="formSection">
                <h3 className="sectionTitle">Profile Photo</h3>
                <div className="imageUploadArea">
                  {previewUrl ? (
                    <div className="previewContainer">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="previewImage"
                      />
                      <button
                        type="button"
                        className="removePhotoButton"
                        onClick={removeImage}
                      >
                        <DeleteOutlineIcon />
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="file" className="uploadButton">
                      <DriveFolderUploadOutlinedIcon />
                      <span>Upload Photo</span>
                    </label>
                  )}
                  <input
                    type="file"
                    id="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <p className="photoLimit">Max file size: 5MB</p>
                  {photoError && <p className="error">{photoError}</p>}
                  {file && !photoError && (
                    <p className="status">Photo ready for upload</p>
                  )}
                </div>
              </div>

              <div className="formSection">
                <h3 className="sectionTitle">User Information</h3>
                <div className="formGrid">
                  {inputs.map((input) => (
                    <div
                      className={`formInput ${
                        input.fullWidth ? "full-width" : ""
                      }`}
                      key={input.id}
                    >
                      <label htmlFor={input.id}>
                        {input.label} {input.required && "*"}
                      </label>

                      {input.type === "checkbox" ? (
                        <div className="checkboxWrapper">
                          <input
                            id={input.id}
                            type="checkbox"
                            checked={info[input.id] || false}
                            onChange={handleChange}
                            className="checkbox"
                          />
                          <span className="checkboxLabel">
                            Make this user an administrator
                          </span>
                        </div>
                      ) : (
                        <input
                          id={input.id}
                          type={input.type}
                          placeholder={input.placeholder}
                          value={info[input.id] || ""}
                          onChange={handleChange}
                          className={formErrors[input.id] ? "input-error" : ""}
                        />
                      )}

                      {formErrors[input.id] && (
                        <span className="errorText">
                          {formErrors[input.id]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="submitSection">
                <button
                  type="submit"
                  className="submitButton"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>Creating User...</>
                  ) : (
                    <>
                      <PersonAddIcon />
                      <span>Create User</span>
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

export default New;
