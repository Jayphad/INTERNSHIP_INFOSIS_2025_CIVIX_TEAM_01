const express = require("express");
const router = express.Router();
const petitionController = require("../Controller/PetitionController");
const {
  createPetition,
  getAllPetitions,
  signPetition,
  getUserPetitions,
  approvePetition
} = require("../Controller/PetitionController");

router.post("/create", createPetition);
router.get("/all", getAllPetitions);
router.get("/user/:userId", getUserPetitions);
router.put("/:id/update", petitionController.updatePetition);
router.post("/:id/delete", petitionController.deletePetition);
router.post("/:id/close", petitionController.closePetition);

// ✅ Approve petition (Admin only)
router.post("/:id/approve", approvePetition);

router.post("/:id/sign", petitionController.signPetition);
router.post("/:id/unsign", petitionController.unsignPetition);





module.exports = router;
