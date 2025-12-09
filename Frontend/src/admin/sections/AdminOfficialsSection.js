import React, { useEffect, useState } from "react";
import axios from "axios";
import { Check, X, User } from '../../assets/icons'; // Reusing icons for accordion
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const AdminOfficialsSection = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(null); // ✅ Track button action

  const fetchPendingOfficials = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:8080/api/admin/pending-officials",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Filter only pending officials
      const pendingOfficials = (response.data.officials || []).filter(
        (o) => !o.approved
      );

      setPending(pendingOfficials);
    } catch (error) {
      console.error("Error fetching pending officials:", error);
      toast.error("Failed to fetch pending officials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOfficials();
  }, []);

const handleStatusChange = async (officialId, approve) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      "http://localhost:8080/api/admin/update-official",
      { officialId, approve }, // send boolean
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success(response.data.message);
    fetchPendingOfficials(); // refresh list
  } catch (error) {
    console.error("Error updating status:", error);
    toast.error("Failed to update official status");
  }
};

  if (loading)
    return (
      <div className="w-full p-6 text-center text-lg font-semibold">
        Loading pending officials...
      </div>
    );

  return (
    <div className="p-6">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Manage Officials</h2>

      {pending.length === 0 ? (
        <div className="p-6 text-center text-gray-600 text-lg">
          🎉 No pending officials at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {pending.map((official) => (
            <div
              key={official._id}
              className="bg-white shadow-md rounded-lg p-5 border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <User size={32} className="text-purple-700" />
                <div>
                  <h3 className="text-lg font-semibold">{official.name}</h3>
                  <p className="text-sm text-gray-600">{official.email}</p>
                </div>
              </div>

              <div className="text-sm text-gray-500 mb-4">
                <p><strong>Latitude:</strong> {official.latitude}</p>
                <p><strong>Longitude:</strong> {official.longitude}</p>
              </div>

              <div className="flex gap-3 mt-4">
              <button
                    onClick={() => handleStatusChange(official._id, true)} // approve = true
                    className="flex items-center gap-2 bg-green-600 px-4 py-2 rounded-md text-white hover:bg-green-700"
                    >
                    <Check size={18} /> Approve
                    </button>

                    <button
                    onClick={() => handleStatusChange(official._id, false)} // approve = false
                    className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-md text-white hover:bg-red-700"
                    >
                    <X size={18} /> Reject
                    </button>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


export default AdminOfficialsSection;
