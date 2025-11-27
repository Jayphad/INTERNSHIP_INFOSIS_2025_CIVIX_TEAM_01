const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    description: { type: String },
    location: { type: String },
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
