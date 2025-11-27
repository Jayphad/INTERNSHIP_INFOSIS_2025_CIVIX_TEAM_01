const Petition = require("../Models/Petition");

// ✅ Create a new petition
exports.createPetition = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      createdBy,
      manualLocation,
      browserLocation,
      goal,
    } = req.body;

    if (!title || !description || !createdBy) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const petition = new Petition({
      title,
      description,
      category,
      createdBy,
      manualLocation: manualLocation || "",
      browserLocation: browserLocation || {}, // latitude & longitude
      goal: goal || 99,
    });

    await petition.save();

    res.json({
      success: true,
      message: "Petition created successfully",
      data: petition,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ✅ Get all petitions
exports.getAllPetitions = async (req, res) => {
  try {
    const petitions = await Petition.find().sort({ createdAt: -1 });
    res.json({ success: true, data: petitions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Sign a petition
exports.signPetition = async (req, res) => {
  try {
    const { userId, name } = req.body;
    const petition = await Petition.findById(req.params.id);

    if (!petition)
      return res.status(404).json({ success: false, message: "Petition not found" });

    if (petition.isClosed)
      return res.status(400).json({ success: false, message: "Petition is closed. Signing is disabled." });

    // ✅ Compare userId safely as string
    const alreadySigned = petition.signatures.some(
      (sig) => sig.userId.toString().trim() === userId.toString().trim()
    );

    if (alreadySigned)
      return res.status(400).json({ success: false, message: "Already signed" });

    // ✅ Push userId as string
    petition.signatures.push({ userId: userId.toString(), name });

    await petition.save();

    res.json({ success: true, message: "Petition signed successfully", data: petition });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ✅ Get petitions created by a specific user
exports.getUserPetitions = async (req, res) => {
  try {
    const { userId } = req.params;
    const petitions = await Petition.find({ createdBy: userId });
    res.json({ success: true, data: petitions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// ✅ Update petition (only by creator)
exports.updatePetition = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, manualLocation, userId } = req.body;
    const petition = await Petition.findById(id);

    if (!petition)
      return res.status(404).json({ success: false, message: "Petition not found" });

    // ✅ Compare ObjectId correctly
    if (petition.createdBy.toString() !== userId)
      return res.status(403).json({ success: false, message: "Unauthorized action" });

    petition.title = title || petition.title;
    petition.description = description || petition.description;
    petition.category = category || petition.category;
    petition.manualLocation = manualLocation || petition.manualLocation;

    // ✅ Reset status to 'review' whenever edited
    petition.status = 'review';

    await petition.save();
    res.json({ success: true, message: "Petition updated successfully", data: petition });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// ✅ Delete petition (only by creator)
exports.deletePetition = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition)
      return res.status(404).json({ success: false, message: "Petition not found" });

    // compare ObjectId and string safely
    if (petition.createdBy.toString() !== req.body.userId)
      return res.status(403).json({ success: false, message: "Unauthorized action" });

    await petition.deleteOne();
    res.json({ success: true, message: "Petition deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ✅ Close petition (no more signing)
exports.closePetition = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition)
      return res.status(404).json({ success: false, message: "Petition not found" });

    if (petition.createdBy !== req.body.userId)
      return res.status(403).json({ success: false, message: "Unauthorized action" });

    petition.isClosed = true;
    await petition.save();

    res.json({
      success: true,
      message: "Petition closed successfully",
      data: petition
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ✅ Approve petition (Admin action)
exports.approvePetition = async (req, res) => {
  try {
    const { id } = req.params;

    const petition = await Petition.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );

    if (!petition)
      return res.status(404).json({ success: false, message: "Petition not found" });

    res.json({
      success: true,
      message: "Petition approved successfully",
      data: petition,
    });
  } catch (err) {
    console.error("Error approving petition:", err);
    res.status(500).json({ success: false, message: "Failed to approve petition" });
  }
};

// ✅ Unsign a petition (remove user signature)
exports.unsignPetition = async (req, res) => {
  try {
    const { id } = req.params; // Petition ID
    const { userId } = req.body;

    const petition = await Petition.findById(id);
    if (!petition)
      return res.status(404).json({ success: false, message: "Petition not found" });

    // Remove signature by userId
    const initialLength = petition.signatures.length;
    petition.signatures = petition.signatures.filter(
      (sig) => sig.userId.toString() !== userId.toString()
    );

    if (petition.signatures.length === initialLength) {
      return res
        .status(400)
        .json({ success: false, message: "You haven't signed this petition." });
    }

    await petition.save();
    res.json({ success: true, message: "Signature removed successfully", data: petition });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to remove signature" });
  }
};
