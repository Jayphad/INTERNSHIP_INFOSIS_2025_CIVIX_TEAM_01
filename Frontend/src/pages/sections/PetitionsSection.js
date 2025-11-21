import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Petitions.css";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../../utils";
const API_URL = "http://localhost:8080";

const PetitionsSection = ({ user }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [showModal, setShowModal] = useState(false); 
  const [showLocationModal, setShowLocationModal] = useState(false); 
  const [selectedFullLocation, setSelectedFullLocation] = useState("");
  const [petitions, setPetitions] = useState([]);
  const [newPetition, setNewPetition] = useState({
    title: "",
    description: "",
    category: "",
    manualLocation: "",
    browserLocation: { latitude: null, longitude: null },
  });

  const loggedInUserId = localStorage.getItem("id");

  // Fetch all petitions
  const fetchPetitions = async () => {
    try {
      const res = await axios.get(`${API_URL}/petition/all`);
      if (res.data.success) {
        const data = res.data.data || [];

        const processed = await Promise.all(
          data.map(async (p) => {
            if (p.manualLocation && p.manualLocation.trim() !== "") {
              return { ...p, _fullLocation: p.manualLocation };
            }

            if (
              p.browserLocation &&
              p.browserLocation.latitude &&
              p.browserLocation.longitude
            ) {
              try {
                const lat = p.browserLocation.latitude;
                const lon = p.browserLocation.longitude;

                const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(
                  lat
                )}&lon=${encodeURIComponent(
                  lon
                )}&format=json&addressdetails=1&accept-language=en`;

                const resp = await fetch(url, {
                  headers: { "User-Agent": "Civix Petition Viewer" },
                });

                if (resp.ok) {
                  const json = await resp.json();
                  const display = json.display_name || "";
                  return { ...p, _fullLocation: display };
                }
              } catch (e) {}

              return {
                ...p,
                _fullLocation: `${p.browserLocation.latitude}, ${p.browserLocation.longitude}`,
              };
            }

            return { ...p, _fullLocation: "" };
          })
        );

        setPetitions(processed);
      }
    } catch (err) {
      console.error("Error fetching:", err);
    }
  };

  useEffect(() => {
    const fromDashboard = localStorage.getItem("openCreatePetition");
    if (fromDashboard === "true") {
      setShowModal(true);
      localStorage.removeItem("openCreatePetition");
    }
    fetchPetitions();
  }, []);

  // Detect browser location
  const detectLocation = async () => {
    if (!navigator.geolocation) {
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
          handleSuccess("Location detected successfully");
        } catch (error) {
          setNewPetition((prev) => ({
            ...prev,
            manualLocation: `${latitude}, ${longitude}`,
            browserLocation: { latitude, longitude },
          }));
        }
      },
      () => handleError("Unable to fetch your location.")
    );
  };

  // Extract short location
  const extractShortAddress = (fullAddress) => {
    if (!fullAddress || fullAddress.trim() === "") return "Location not specified";

    const parts = fullAddress.split(",").map((s) => s.trim()).filter(Boolean);
    const tail = [...parts].reverse();
    const filtered = tail.filter((t) => !/^\d{4,}$/.test(t));

    const pick = filtered.slice(0, 4).reverse();

    const commonCountries = ["india", "united states", "usa", "uk"];
    while (pick.length && commonCountries.includes(pick[pick.length - 1].toLowerCase())) {
      pick.pop();
    }

    const chosen = pick.slice(Math.max(0, pick.length - 3));

    const short = chosen.join(", ");
    const hasMore = fullAddress.length > short.length + 10;

    return hasMore ? `${short} ` : short; // space added for dots
  };

  // Open modal
  const openLocationModal = (fullLocation) => {
    setSelectedFullLocation(fullLocation || "Location not specified");
    setShowLocationModal(true);
  };

  // Create or Update
  const handleCreatePetition = async (e) => {
    e.preventDefault();
    if (!newPetition.title || !newPetition.description) {
      alert("Please fill all fields");
      return;
    }

    try {
      if (newPetition._id) {
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
          handleSuccess("Petition updated successfully!");
          fetchPetitions();
          setShowModal(false);
        }
      } else {
        const res = await axios.post(`${API_URL}/petition/create`, {
          title: newPetition.title,
          description: newPetition.description,
          category: newPetition.category,
          createdBy: loggedInUserId || "guest",
          manualLocation: newPetition.manualLocation,
          browserLocation: newPetition.browserLocation,
        });

        if (res.data.success) {
          handleSuccess("Petition created successfully!");
          fetchPetitions();
          setShowModal(false);
        }
      }
    } catch (err) {
      handleError("Failed to create/update petition");
    }
  };

  // Sign
  const handleSignPetition = async (id) => {
    try {
      const res = await axios.post(`${API_URL}/petition/${id}/sign`, {
        userId: loggedInUserId || "guest",
        name: user?.name || "Anonymous",
      });

      if (res.data.success) {
        handleSuccess("Petition signed!");
        fetchPetitions();
      }
    } catch {}
  };

  // Delete
  const handleDeletePetition = async (id) => {
    if (!window.confirm("Delete this petition?")) return;

    try {
      const res = await axios.post(`${API_URL}/petition/${id}/delete`, {
        userId: loggedInUserId,
      });
      if (res.data.success) {
        handleSuccess("Deleted");
        fetchPetitions();
      }
    } catch {}
  };

  // Close petition
  const handleClosePetition = async (id) => {
    try {
      const res = await axios.post(`${API_URL}/petition/${id}/close`, {
        userId: loggedInUserId,
      });

      if (res.data.success) {
        handleSuccess("Petition closed!");
        fetchPetitions();
      }
    } catch {}
  };

  // Edit
  const handleEditPetition = (p) => {
    setNewPetition({
      _id: p._id,
      title: p.title,
      description: p.description,
      category: p.category,
      manualLocation: p.manualLocation,
      browserLocation: p.browserLocation,
    });
    setShowModal(true);
  };

  // Filter
  const filteredPetitions = petitions.filter((p) => {
    if (activeTab === "mine") return p.createdBy === loggedInUserId;
    if (activeTab === "signed")
      return p.signatures.some((s) => s.userId === loggedInUserId);
    return true;
  });

  return (
    <div className="petition-section">
      <div className="petition-container">
        
        {/* HEADER */}
        <div className="petition-header">
          <h2>Citizen Petitions</h2>
          <button className="create-btn" onClick={() => setShowModal(true)}>
            + Create Petition
          </button>
        </div>

        {/* TABS */}
        <div className="petition-tabs">
          {["all", "mine", "signed"].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "all" ? "All Petitions" : tab === "mine" ? "My Petitions" : "Signed Petitions"}
            </button>
          ))}
        </div>

        {/* PETITION CARDS */}
        <div className="petition-list">
          {filteredPetitions.map((p) => {
            const fullLoc =
              p.manualLocation && p.manualLocation.trim() !== ""
                ? p.manualLocation
                : p._fullLocation || "";

            const shortLoc = extractShortAddress(fullLoc);

            return (
              <div key={p._id} className="petition-card">
                
                {/* STATUS */}
                <span
                  className={`status-badge ${
                    p.status === "approved"
                      ? "status-approved"
                      : p.isClosed
                      ? "status-closed"
                      : "status-pending"
                  }`}
                >
                  {p.status || "pending"}
                </span>

                {/* CATEGORY */}
                <span className="petition-category">{p.category}</span>

                {/* TITLE */}
                <h3 className="petition-title">{p.title}</h3>

                {/* DESCRIPTION */}
                <p className="petition-desc">{p.description}</p>

                {/* LOCATION */}
                <p className="petition-location">
                  📍 {shortLoc}
                  {fullLoc.length > shortLoc.length && (
                    <span
                      className="view-full-dots"
                      onClick={() => openLocationModal(fullLoc)}
                    >
                      ……
                    </span>
                  )}
                </p>

                {/* SIGNATURE COUNT */}
                <p className="signature-count">
                  ✍️ {p.signatures.length}{" "}
                  {p.signatures.length === 1 ? "Signature" : "Signatures"}
                </p>

                {/* ACTION BUTTONS */}
               <div className="petition-actions">

  {/* If CLOSED → Show Closed Badge for ALL tabs */}
  {p.isClosed && (
    <button className="btn-secondary" disabled>
      Closed
    </button>
  )}

  {/* If NOT CLOSED → Show SIGN button */}
  {!p.isClosed && (
    <button
      className="sign-btn"
      disabled={p.signatures.some((s) => s.userId === loggedInUserId)}
      onClick={() =>
        !p.signatures.some((s) => s.userId === loggedInUserId) &&
        handleSignPetition(p._id)
      }
    >
      {p.signatures.some((s) => s.userId === loggedInUserId)
        ? "Signed"
        : "Sign"}
    </button>
  )}

  {/* Owner actions → only visible in My Petitions */}
  {activeTab === "mine" && (
    <div className="owner-actions">
      {!p.isClosed && (
        <>
          <button className="edit-btn" onClick={() => handleEditPetition(p)}>
            Edit
          </button>
          <button className="delete-btn" onClick={() => handleDeletePetition(p._id)}>
            Delete
          </button>
          <button className="close-btn" onClick={() => handleClosePetition(p._id)}>
            Close
          </button>
        </>
      )}
    </div>
  )}
</div>

              </div>
            );
          })}
        </div>
      </div>

      {/* FULL LOCATION MODAL */}
      {showLocationModal && (
        <div className="modal-overlay" onClick={() => setShowLocationModal(false)}>
          <div
            className="modal"
            style={{ maxWidth: 640 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Full Location</h2>
            <p style={{ textAlign: "left", color: "#333", lineHeight: 1.5 }}>
              {selectedFullLocation}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="cancel-btn" onClick={() => setShowLocationModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Create/Edit Modal */}
{showModal && (
  <div className="modal-overlay" onClick={() => setShowModal(false)}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
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
            setNewPetition({ ...newPetition, description: e.target.value })
          }
        ></textarea>

        <select
          className="petition-select"
          value={newPetition.category}
          onChange={(e) =>
            setNewPetition({ ...newPetition, category: e.target.value })
          }
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
            setNewPetition({ ...newPetition, manualLocation: e.target.value })
          }
        />

        <button
          type="button"
          className="detect-btn"
          onClick={detectLocation}
        >
          📍 Detect My Location
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
    </div>
  );
};

export default PetitionsSection;
