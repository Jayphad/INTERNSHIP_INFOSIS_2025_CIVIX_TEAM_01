const express = require("express");
const router = express.Router();
const pollController = require("../Controller/PollsController");

router.post("/create", pollController.createPoll);
router.get("/all", pollController.getAllPolls);
router.get("/:id", pollController.getPoll);
router.post("/:id/delete", pollController.deletePoll);
router.post("/:id/vote", pollController.votePoll);
router.post("/:id/feedback", pollController.submitFeedback);
router.post("/:id/close", pollController.closePoll);
router.put("/:id/update", pollController.updatePoll);

module.exports = router;
