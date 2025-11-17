import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Petitions.css";

const API_URL = "http://localhost:8080";

const AdminPetitionsSection = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [petitions, setPetitions] = useState([]);

  const fetchPetitions = async () => {
    try {
      const res = await axios.get(`${API_URL}/petition/all`);
      if (res.data.success) setPetitions(res.data.data);
    } catch (err) {
      console.error("Error fetching petitions:", err);
    }
  };

  useEffect(() => {
    fetchPetitions();
  }, []);

  const handleApprovePetition = async (id) => {
    try {
      const res = await axios.post(`${API_URL}/petition/${id}/approve`);
      if (res.data.success) {
        alert("✅ Petition approved successfully!");
        fetchPetitions();
      } else {
        alert(res.data.message || "Failed to approve petition.");
      }
    } catch (err) {
      console.error("Error approving petition:", err);
      alert("❌ Failed to approve petition.");
    }
  };

  const filteredPetitions =
    activeTab === "approved"
      ? petitions.filter((p) => p.status === "approved")
      : petitions;

  return (
    <div className="petition-section" style={{ width: "100%" }}>
      <div className="petition-container">
        <div className="petition-header" style={{ color: "#21003f" }}>
          <h2>Admin Petition Management</h2>
        </div>

        {/* Tabs */}
        <div className="petition-tabs">
          {["all", "approved"].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "all" ? "All Petitions" : "Approved Petitions"}
            </button>
          ))}
        </div>

        {/* Petition List */}
        <div className="petition-list">
          {filteredPetitions.length > 0 ? (
            filteredPetitions.map((p) => (
              <div key={p._id} className="petition-card">
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <span className="petition-category">{p.category}</span>
                <p className="petition-location">
                  📍{" "}
                  {p.manualLocation ||
                    (p.browserLocation
                      ? `${p.browserLocation.latitude?.toFixed(3)}, ${p.browserLocation.longitude?.toFixed(3)}`
                      : "Location not specified")}
                </p>
                <div className="petition-meta">
                  <p className="signature-count">
                    ✍️ {p.signatures.length} Signatures
                  </p>
                  <p>
                    🏷️ Status:{" "}
                    <strong
                      style={{
                        color: p.status === "approved" ? "green" : "orange",
                      }}
                    >
                      {p.status}
                    </strong>
                  </p>
                </div>

                {/* Admin Actions */}
                {p.status === "pending" && (
                  <button
                    className="approve-btn"
                    onClick={() => handleApprovePetition(p._id)}
                  >
                    ✅ Approve
                  </button>
                )}
              </div>
            ))
          ) : (
            <p>No petitions found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPetitionsSection;
