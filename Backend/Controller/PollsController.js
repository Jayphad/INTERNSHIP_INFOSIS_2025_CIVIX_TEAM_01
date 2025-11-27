const Poll = require("../Models/polls");

// CREATE POLL
exports.createPoll = async (req, res) => {
  try {
  
    const poll = new Poll(req.body);
    const createdPoll = await poll.save();
    res.status(200).json({ success: true, data: createdPoll });
  } catch (err) {
    console.error("Error creating poll:", err); // <- This will show in backend console
    res.status(500).json({ success: false, message: err.message });
  }
};


// GET ALL POLLS
exports.getAllPolls = async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.json({ success: true, data: polls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET SINGLE POLL
exports.getPoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ success: false, message: "Poll not found" });
    res.json({ success: true, data: poll });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE POLL
exports.deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ success: false, message: "Poll not found" });

    await poll.deleteOne();
    res.json({ success: true, message: "Poll deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// VOTE ON POLL
exports.votePoll = async (req, res) => {
  try {
    const { userId, optionId } = req.body;
    const poll = await Poll.findById(req.params.id);

    if (!poll) return res.status(404).json({ success: false, message: "Poll not found" });

    if (poll.status === "closed")
      return res.status(400).json({ success: false, message: "Poll is closed" });

    if (poll.votedBy.includes(userId))
      return res.status(400).json({ success: false, message: "Already voted" });

    poll.results[optionId] = (poll.results[optionId] || 0) + 1;
    poll.votedBy.push(userId);
    poll.userVote[userId] = optionId;
    poll.totalVotes += 1;

    await poll.save();

    res.json({ success: true, message: "Vote submitted", data: poll });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// SUBMIT FEEDBACK
exports.submitFeedback = async (req, res) => {
  console.log("FEEDBACK HIT:", req.params.id, req.body);

  try {
    const { userId, type, details } = req.body;
    const poll = await Poll.findById(req.params.id);

    if (!poll)
      return res.status(404).json({ success: false, message: "Poll not found" });

    // ⭐ FIX: Ensure the feedback array exists
    if (!Array.isArray(poll.feedback)) {
      console.log("Feedback was undefined, initializing array...");
      poll.feedback = [];
    }

    poll.feedback.push({
      userId,
      type,
      details,
      date: new Date()
    });

    await poll.save();

    // ⭐ Return normalized poll
    res.json({
      success: true,
      message: "Feedback added",
      data: { ...poll.toObject(), id: poll._id }
    });

  } catch (err) {
    console.error("Feedback Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// CLOSE POLL
exports.closePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) return res.status(404).json({ success: false, message: "Poll not found" });

    poll.status = "closed";
    await poll.save();

    res.json({ success: true, message: "Poll closed", data: poll });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE POLL
exports.updatePoll = async (req, res) => {
  try {
    const updated = await Poll.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, message: "Poll updated", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
