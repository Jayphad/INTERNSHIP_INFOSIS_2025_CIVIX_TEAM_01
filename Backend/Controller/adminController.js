const UserModel = require('../Models/user');

// --------------------- GET ALL PENDING OFFICIALS ---------------------
const getPendingOfficials = async (req, res) => {
  try {
    const admin = await UserModel.findById(req.user._id);

    if (!admin || !admin.isSuperAdmin) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const officials = await UserModel.find({ role: 'official', approved: false });
    res.status(200).json({ success: true, officials });

  } catch (err) {
    console.error("❌ getPendingOfficials error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------- APPROVE OR REJECT AN OFFICIAL ---------------------
const updateOfficialStatus = async (req, res) => {
  try {
    const { officialId, approve } = req.body;
    const admin = await UserModel.findById(req.user._id);

    if (!admin || !admin.isSuperAdmin) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const official = await UserModel.findById(officialId);
    if (!official) return res.status(404).json({ success: false, message: "Official not found" });

    // Ensure role is official
    if (official.role !== 'official') {
      return res.status(400).json({ success: false, message: "Cannot change status for non-officials" });
    }

    if (approve) {
      official.approved = true;
      await official.save();
      return res.status(200).json({ success: true, message: "Official approved", official });
    } else {
      await UserModel.findByIdAndDelete(officialId); // optional: delete on reject
      return res.status(200).json({ success: true, message: "Official rejected", officialId });
    }

  } catch (err) {
    console.error("❌ updateOfficialStatus error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getPendingOfficials, updateOfficialStatus };
