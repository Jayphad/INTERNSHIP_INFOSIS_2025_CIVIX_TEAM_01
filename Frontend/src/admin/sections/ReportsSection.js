import React, { useState } from "react";

const ReportsSection = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [petitions, setPetitions] = useState([
    {
      id: 1,
      title: "Fix Streetlights in Ward 3",
      desc: "Several areas have no streetlights causing safety issues.",
      category: "Infrastructure",
    },
    {
      id: 2,
      title: "Increase Green Zones",
      desc: "Requesting more parks and plantation drives.",
      category: "Environment",
    },
    {
      id: 2,
      title: "Increase Green Zones",
      desc: "Requesting more parks and plantation drives.",
      category: "Environment",
    },
  ]);

  const [newPetition, setNewPetition] = useState({
    title: "",
    description: "",
    category: "",
  });

  const handleCreatePetition = (e) => {
    e.preventDefault();
    if (!newPetition.title || !newPetition.description) return;
    setPetitions([...petitions, { id: Date.now(), ...newPetition }]);
    setShowModal(false);
    setNewPetition({ title: "", description: "", category: "" });
  };

  return (
    <div className="petition-section" style={{width:"100%"}}>
      <div className="petition-container">
        <div className="petition-header">
          <h2>Citizen Petitions</h2>
          <button className="create-btn" onClick={() => setShowModal(true)}>
            + Create Petition
          </button>
        </div>

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

        <div className="petition-list">
          {petitions.map((p) => (
            <div key={p.id} className="petition-card">
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <span className="petition-category">{p.category}</span>
              <div className="petition-actions">
                <button className="sign-btn">Sign</button>
                <button className="view-btn">View</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create New Petition</h2>
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
              <input
                type="text"
                placeholder="Category (e.g., Environment)"
                value={newPetition.category}
                onChange={(e) =>
                  setNewPetition({ ...newPetition, category: e.target.value })
                }
              />
              <div className="modal-buttons">
                <button type="submit" className="submit-btn">
                  Submit
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsSection;
