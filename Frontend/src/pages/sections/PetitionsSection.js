import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Petitions.css";
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../../utils';
import {
  FiMapPin,
  FiInfo,
  FiEdit,
  FiTrash2,
  FiLock,
  FiPenTool,
  FiCheckCircle,
  FiCrosshair
} from "react-icons/fi";

const API_URL = "http://localhost:8080";

const PetitionsSection = ({ user }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [petitions, setPetitions] = useState([]);
  const [newPetition, setNewPetition] = useState({
    title: "",
    description: "",
    category: "",
    manualLocation: "",
    browserLocation: { latitude: null, longitude: null },
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");



  const loggedInUserId = localStorage.getItem("id");

  // ✅ Fetch all petitions from backend
  const fetchPetitions = async () => {
    try {
      const res = await axios.get(`${API_URL}/petition/all`);
      if (res.data.success) setPetitions(res.data.data);
    } catch (err) {
      console.error("Error fetching petitions:", err);
    }
  };

  // ✅ Open Create Petition modal automatically if triggered from Dashboard
  useEffect(() => {
    const fromDashboard = localStorage.getItem("openCreatePetition");
    if (fromDashboard === "true") {
      setShowModal(true);
      localStorage.removeItem("openCreatePetition");
    }
    fetchPetitions();
  }, []);

  // ✅ Detect browser location
  const detectLocation = async () => {
    if (!navigator.geolocation) {
      // alert("❌ Geolocation is not supported by your browser.");
      handleError("Geolocation is not supported by your browser");

      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          const address = data.display_name || `${latitude}, ${longitude}`;

          setNewPetition((prev) => ({
            ...prev,
            manualLocation: address,
            browserLocation: { latitude, longitude },
          }));
          // alert("✅ Location detected successfully!");
          handleSuccess("Location detected successfully");
        } catch (error) {
          console.error("Error fetching address:", error);
          setNewPetition((prev) => ({
            ...prev,
            manualLocation: `${latitude}, ${longitude}`,
            browserLocation: { latitude, longitude },
          }));
        }
      },
      (error) => {
        console.error("Location error:", error);
        // alert("❌ Unable to fetch your location. Please enter manually.");
        handleError("Unable to fetch your location. Please enter manually.");
      }
    );
  };

  // ✅ Create or update petition
  const handleCreatePetition = async (e) => {
    e.preventDefault();

    if (!newPetition.title || !newPetition.description) {
      alert("Please fill all fields");
      return;
    }

    try {
      if (newPetition._id) {
        // Update petition
        const res = await axios.put(
          `${API_URL}/petition/${newPetition._id}/update`,
          {
            title: newPetition.title,
            description: newPetition.description,
            category: newPetition.category,
            manualLocation: newPetition.manualLocation,
            userId: loggedInUserId,
          }
        );
        if (res.data.success) {
          // alert("✅ Petition updated successfully!");
          handleSuccess("Petition updated successfully!");
          setPetitions((prev) =>
            prev.map((p) => (p._id === newPetition._id ? res.data.data : p))
          );
          setShowModal(false);
          setNewPetition({
            title: "",
            description: "",
            category: "",
            manualLocation: "",
            browserLocation: { latitude: null, longitude: null },
          });
        }
      } else {
        // Create new petition
        const res = await axios.post(`${API_URL}/petition/create`, {
          title: newPetition.title,
          description: newPetition.description,
          category: newPetition.category,
          createdBy: loggedInUserId || "guest",
          manualLocation: newPetition.manualLocation,
          browserLocation: newPetition.browserLocation,
        });

        if (res.data.success) {
          // alert("✅ Petition created successfully!");
          handleSuccess("Petition created successfully!");
          setPetitions([res.data.data, ...petitions]);
          setShowModal(false);
          setNewPetition({
            title: "",
            description: "",
            category: "",
            manualLocation: "",
          });
        } else {
          alert(res.data.message);
        }
      }
    } catch (err) {
      console.error("Error creating/updating petition:", err);
      // alert("❌ Failed to create or update petition.");
      handleError("Failed to create or update petition.");
    }
  };

  // ✅ Sign petition
  const handleSignPetition = async (id) => {
    try {
      const res = await axios.post(`${API_URL}/petition/${id}/sign`, {
        userId: loggedInUserId || "guest",
        name: user?.name || "Anonymous",
      });
      if (res.data.success) {
        // alert("✅ Petition signed successfully!");
        handleSuccess("Petition signed successfully!");
        setPetitions((prev) =>
          prev.map((p) => (p._id === id ? res.data.data : p))
        );
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Error signing petition:", err);
    }
  };

  // ✅ Delete petition
  const handleDeletePetition = async (id) => {
    if (!window.confirm("Are you sure you want to delete this petition?"))
      return;

    try {
      const res = await axios.post(`${API_URL}/petition/${id}/delete`, {
        userId: loggedInUserId,
      });
      if (res.data.success) {
        // alert("✅ Petition deleted successfully!");
        handleSuccess("Petition deleted successfully!");
        setPetitions(petitions.filter((p) => p._id !== id));
      } else alert(res.data.message);
    } catch (err) {
      console.error("Error deleting petition:", err);
    }
  };

  // ✅ Close petition
  const handleClosePetition = async (petitionId) => {
    try {
      const response = await axios.post(
        `${API_URL}/petition/${petitionId}/close`,
        { userId: loggedInUserId }
      );
      if (response.data.success) {
        // alert("✅ Petition closed successfully!");
        handleSuccess("Petition closed successfully!");
        fetchPetitions();
      } else {
        alert(response.data.message || "Failed to close petition.");
      }
    } catch (err) {
      console.error("Error closing petition:", err);
      // alert("❌ Error closing petition.");
      handleError("Error closing petition");
    }
  };

  // ✅ Edit petition
  const handleEditPetition = (petition) => {
    setNewPetition({
      _id: petition._id,
      title: petition.title,
      description: petition.description,
      category: petition.category,
      manualLocation: petition.manualLocation,
      browserLocation: petition.browserLocation,
    });
    setShowModal(true);
  };

  // ✅ Filter petitions
const filteredPetitions = petitions.filter((p) => {
  // Tab Filters
  if (activeTab === "mine" && p.createdBy !== loggedInUserId) return false;
  if (activeTab === "signed" && !p.signatures.some(s => s.userId === loggedInUserId)) return false;

  // Status Filter
  if (filterStatus !== "all" && (p.status || "pending") !== filterStatus) return false;

  // Category Filter
  if (filterCategory !== "all" && p.category !== filterCategory) return false;

  // Location Filter
  if (filterLocation !== "all" && p.manualLocation !== filterLocation) return false;

  return true;
});

const getShortAddress = (fullAddress) => {
  if (!fullAddress) return "Unknown Location";

  // Remove extra spaces
  const clean = fullAddress.trim();

  // Limit characters
  if (clean.length > 30) {
    return clean.substring(0, 30) + "...";
  }

  return clean;
};



  return (
    <div className="petition-section" style={{ width: "100%" }}>
      <div className="petition-container">
        <div className="petition-fixed-header">
        {/* HEADER */}
<div className="petition-header" style={{ color: "#21003f" }}>
  <h2>Citizen Petitions</h2>
  <button className="create-btn" onClick={() => setShowModal(true)}>
    + Create Petition
  </button>
</div>

{/* FILTER BAR - Should be OUTSIDE header */}
<div className="petition-filter-bar">
  <div className="filter-group">
    <label>Status</label>
    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
      <option value="all">All Statuses</option>
      <option value="approved">Approved</option>
      <option value="pending">Pending</option>
      <option value="closed">Closed</option>
    </select>
  </div>

  <div className="filter-group">
    <label>Category</label>
    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
      <option value="all">All Categories</option>
      <option value="Environment">Environment</option>
      <option value="Infrastructure">Infrastructure</option>
      <option value="Education">Education</option>
      <option value="Healthcare">Healthcare</option>
      <option value="Public Safety">Public Safety</option>
      <option value="Miscellaneous">Miscellaneous</option>
    </select>
  </div>

  <div className="filter-group">
    <label>Location</label>
    <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
      <option value="all">All Locations</option>
      {[...new Set(petitions.map(p => p.manualLocation || "Unknown"))]
        .map((loc, i) => (
          <option key={i} value={loc}>{loc}</option>
        ))}
    </select>
  </div>
</div>

{/* TABS */}
<div className="petition-tabs">
  {["all", "mine", "signed"].map((tab) => (
    <button
      key={tab}
      className={activeTab === tab ? "active" : ""}
      onClick={() => setActiveTab(tab)}
    >
      {tab === "all"
        ? "All Petitions"
        : tab === "mine"
        ? "My Petitions"
        : "Signed Petitions"}
    </button>
  ))}
    </div>
</div>

        {/* Petition List */}
        <div className="petition-list">
          {filteredPetitions.length > 0 ? (
            filteredPetitions.map((p) => {
              const alreadySigned = p.signatures.some(
                (s) => s.userId === loggedInUserId
              );

              return (
                <div key={p._id} className="petition-card" style={{position:"relative"}}>
                  <div className="petition-top-left">
                      <span className="petition-category">{p.category}</span>
                      <span className="petition-status"
                            style={{ color: p.status === "approved" ? "green" : "orange" }}>
                        {p.status || "pending"}
                      </span>
                    </div>

                    <h3 className="petition-title">{p.title}</h3>

                  <p>{p.description}</p>
                  {/* <span className="petition-category">{p.category}</span> */}
                 <p className="petition-location">
                        <FiMapPin size={15} style={{ marginRight: "4px" }} />
                        {p.manualLocation
                          ? getShortAddress(p.manualLocation)
                          : p.browserLocation?.latitude && p.browserLocation?.longitude
                            ? `${p.browserLocation.latitude.toFixed(3)}, ${p.browserLocation.longitude.toFixed(3)}`
                            : "Location not specified"}

                        {/* INFO ICON FOR FULL ADDRESS */}
                        {p.manualLocation && (
                          <span
                            onClick={() => {
                              setSelectedAddress(p.manualLocation);
                              setShowAddressModal(true);
                            }}
                            style={{
                              marginLeft: "6px",
                              cursor: "pointer",
                              color: "#5a2a9e",
                              fontWeight: "bold",
                            }}
                          >
                            <FiInfo size={15} style={{ marginLeft: "6px", cursor: "pointer", color: "#5a2a9e" }} />
                          </span>
                        )}
                      </p>

                  <div className="petition-meta">
                    <p className="signature-count">
                      <FiPenTool size={15} style={{ marginRight: "4px" }} />
                      {p.signatures.length}
                      {p.signatures.length === 1 ? "Signature" : "Signatures"}
                    </p>
                  </div>

                  <div className="petition-actions">
                    {p.isClosed ? (
                      <button className="close-btn" disabled>
                        <FiLock style={{ marginRight: "6px" }} />
                        Closed
                      </button>
                    ) : (
                      <>
                        <button
                          className="sign-btn"
                          disabled={alreadySigned}
                          onClick={() =>
                            !alreadySigned && handleSignPetition(p._id)
                          }
                          style={{
                            backgroundColor: alreadySigned
                              ? "#4CAF50"
                              : "#007bff",
                            cursor: alreadySigned ? "not-allowed" : "pointer",
                          }}
                        >
                         {alreadySigned ? (
                          <>
                          <FiCheckCircle style={{ marginRight: "5px" }} />
                          Signed
                          </>
                          ) : (
                          "Sign"
                        )}

                        </button>

                        {activeTab === "mine" && (
                          <>
                            <button
                              className="edit-btn"
                              onClick={() => handleEditPetition(p)}
                            >
                              <FiEdit /> Edit
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeletePetition(p._id)}
                            >
                              <FiTrash2 /> Delete
                            </button>
                            <button
                              className="close-btn"
                              onClick={() => handleClosePetition(p._id)}
                            >
                              <FiLock /> Close Petition
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p>No petitions found.</p>
          )}
        </div>
      </div>

      {/* ✅ Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{newPetition._id ? "Edit Petition" : "Create New Petition"}</h2>
            <form onSubmit={handleCreatePetition}>
              <input
                type="text"
                placeholder="Petition Title"
                value={newPetition.title}
                onChange={(e) =>
                  setNewPetition({ ...newPetition, title: e.target.value })
                }
              />
              <textarea
                placeholder="Describe your petition..."
                value={newPetition.description}
                onChange={(e) =>
                  setNewPetition({
                    ...newPetition,
                    description: e.target.value,
                  })
                }
              ></textarea>

              <select
                value={newPetition.category}
                onChange={(e) =>
                  setNewPetition({ ...newPetition, category: e.target.value })
                }
                className="petition-select"
                required
              >
                <option value="">-- Select Category --</option>
                <option value="Environment">Environment</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Public Safety">Public Safety</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>

              <input
                type="text"
                placeholder="Enter your location"
                value={newPetition.manualLocation}
                onChange={(e) =>
                  setNewPetition({
                    ...newPetition,
                    manualLocation: e.target.value,
                  })
                }
              />

              <button
                type="button"
                className="detect-btn"
                onClick={detectLocation}
              >
                <FiCrosshair style={{ marginRight: "6px" }} /> Detect My Location

              </button>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {newPetition._id ? "Update Petition" : "Create Petition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        <ToastContainer />
        {showAddressModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>Full Location</h2>
                <p style={{ marginTop: "10px" }}>{selectedAddress}</p>

                <button
                  className="cancel-btn"
                  onClick={() => setShowAddressModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
    </div>
  );
};

export default PetitionsSection;
