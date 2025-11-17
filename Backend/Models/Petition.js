const mongoose = require("mongoose");

const petitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String },
    createdBy: { type: String, required: true }, // store user id or email

    // Store manual location entered by user
    manualLocation: {
      type: String,
      default: "",
    },

    // Store browser-detected location (latitude & longitude)
    browserLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
    },

    signatures: [
      {
        userId: String,
        name: String,
        signedAt: { type: Date, default: Date.now },
      },
    ],
    isClosed: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending"
    }


  },
  { timestamps: true }
);

module.exports = mongoose.model("Petition", petitionSchema);
