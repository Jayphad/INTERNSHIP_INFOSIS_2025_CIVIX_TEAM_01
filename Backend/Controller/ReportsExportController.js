const PDFDocument = require("pdfkit");
const Petition = require("../Models/Petition");
const Poll = require("../Models/polls");

exports.exportReportPDF = async (req, res) => {
  try {
    // --- Fetch data (same as overview) ---
    const petitions = await Petition.find();
    const polls = await Poll.find();

    const totalPetitions = petitions.length;
    const totalPolls = polls.length;
    const activeEngagement =
      petitions.reduce((sum, p) => sum + p.signatures.length, 0) +
      polls.reduce((sum, p) => sum + p.totalVotes, 0);

    const petitionStatus = petitions.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});

    const pollStatus = polls.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});

    // --- PDF GENERATION ---
    const doc = new PDFDocument();
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=civix_report.pdf");

    doc.fontSize(22).text("Civix Report & Analytics", { underline: true });
    doc.moveDown();

    doc.fontSize(16).text("📌 Overview", { bold: true });
    doc.fontSize(12)
      .text(`Total Petitions: ${totalPetitions}`)
      .text(`Total Polls: ${totalPolls}`)
      .text(`Active Engagement: ${activeEngagement}`)
      .moveDown();

    doc.fontSize(16).text("📌 Petition Status Breakdown");
    Object.keys(petitionStatus).forEach((key) => {
      doc.fontSize(12).text(`${key}: ${petitionStatus[key]}`);
    });
    doc.moveDown();

    doc.fontSize(16).text("📌 Poll Status Breakdown");
    Object.keys(pollStatus).forEach((key) => {
      doc.fontSize(12).text(`${key}: ${pollStatus[key]}`);
    });
    doc.moveDown();

    doc.text("Report Generated On: " + new Date().toLocaleString());

    doc.end();
    doc.pipe(res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "PDF generation failed" });
  }
};
