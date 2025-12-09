const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    description: { type: String },
    // Manual location entered by user
    manualLocation: {
      type: String,
      default: "",
    },

    // Browser detected latitude & longitude
    browserLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    closesOn: { type: String },

    authorId: { type: String, required: true },
    authorName: { type: String },

    options: [
      {
        id: String,
        text: String,
      },
    ],

    status: {
      type: String,
      enum: ["active", "review", "closed"],
      default: "review",
    },

    results: { type: Object, default: {} },
    totalVotes: { type: Number, default: 0 },
    votedBy: { type: [String], default: [] },
    
    userVote: { type: Object, default: {} },

    feedback: {
                type: [
                    {
                    userId: { type: String },
                    type: { type: String },
                    details: { type: String },
                    date: { type: Date, default: Date.now }
                    }
                ],
                default: []
                },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Poll", pollSchema);
