const express = require("express");
const { getOverview, getMyActivity } = require("../Controller/ReportsController");
const { exportReportPDF } = require("../Controller/ReportsExportController");

const authMiddleware = require("../Middleware/authMiddleware"); 
// ^ default import because module.exports = function

const router = express.Router();

router.get("/overview", getOverview);

router.get("/my-activity", authMiddleware, getMyActivity);

router.get("/export/pdf", exportReportPDF);

module.exports = router;
