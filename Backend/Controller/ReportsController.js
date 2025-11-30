const mongoose = require('mongoose');
const Petition = require("../Models/Petition");
const Poll = require('../Models/polls');


const safeNumber = v => (typeof v === 'number' ? v : (v ? Number(v) : 0));

exports.getOverview = async (req, res) => {
  try {
    // 1) Total petitions and breakdown by status
    const petitionStatusAgg = await Petition.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // 2) Distribution by category (manualLocation or category)
    const petitionCategoryAgg = await Petition.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 3) Total signatures (sum length of signatures arrays) and active engagement
    // Use $project + $sum pattern
    const petitionSignaturesAgg = await Petition.aggregate([
      { $project: { sigCount: { $size: { $ifNull: ["$signatures", []] } } } },
      { $group: { _id: null, totalSignatures: { $sum: "$sigCount" } } }
    ]);

    const totalSignatures = (petitionSignaturesAgg[0] && petitionSignaturesAgg[0].totalSignatures) || 0;

    // 4) Poll totals & breakdowns
    const pollStatusAgg = await Poll.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const pollDistributionAgg = await Poll.aggregate([
      { $group: { _id: "$location", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // 5) Total poll votes (sum totalVotes)
    const pollVotesAgg = await Poll.aggregate([
      { $group: { _id: null, totalVotes: { $sum: { $ifNull: ["$totalVotes", 0] } } } }
    ]);
    const totalPollVotes = (pollVotesAgg[0] && pollVotesAgg[0].totalVotes) || 0;

    // 6) Derived numbers
    const totalPetitions = await Petition.countDocuments();
    const totalPolls = await Poll.countDocuments();
    const activeEngagement = totalSignatures + totalPollVotes;

    // Helper: convert aggregation results to simple map
    const aggToMap = (arr) =>
      arr.reduce((acc, cur) => {
        const key = cur._id === null ? 'unknown' : cur._id;
        acc[key] = cur.count;
        return acc;
      }, {});

    const petitionStatusMap = aggToMap(petitionStatusAgg);
    const pollStatusMap = aggToMap(pollStatusAgg);

    // Build response shaped for frontend
    const response = {
      success: true,
      data: {
        totals: {
          petitions: totalPetitions,
          polls: totalPolls,
          activeEngagement
        },
        petitions: {
          status: petitionStatusMap,
          byCategory: petitionCategoryAgg.map(x => ({ category: x._id, count: x.count }))
        },
        polls: {
          status: pollStatusMap,
          byLocation: pollDistributionAgg.map(x => ({ location: x._id, count: x.count }))
        },
        totalsDetail: {
          totalSignatures,
          totalPollVotes
        },
        generatedAt: new Date()
      }
    };

    return res.json(response);
  } catch (err) {
    console.error("ReportsController.getOverview error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


exports.getMyActivity = async (req, res) => {
  try {
     const userId = req.user?.id || req.user?._id || req.params.userId;
    // supports JWT auth OR param-based route

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID missing" });
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    // ----------------------------------------
    // 1) Petition Status for THIS USER
    // ----------------------------------------
    const userPetitionStatusAgg = await Petition.aggregate([
      { $match: { createdBy: objectId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // ----------------------------------------
    // 2) Petition Categories for THIS USER
    // ----------------------------------------
    const userPetitionCategoryAgg = await Petition.aggregate([
      { $match: { createdBy: objectId } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // ----------------------------------------
    // 3) Signatures received for user petitions
    // ----------------------------------------
    const userPetitionSignaturesAgg = await Petition.aggregate([
      { $match: { createdBy: objectId } },
      { $project: { sigCount: { $size: { $ifNull: ["$signatures", []] } } } },
      { $group: { _id: null, totalSignatures: { $sum: "$sigCount" } } }
    ]);

    const userTotalSignatures =
      (userPetitionSignaturesAgg[0] && userPetitionSignaturesAgg[0].totalSignatures) || 0;

    // ----------------------------------------
    // 4) Polls created by this user (per-status)
    // ----------------------------------------
    const userPollStatusAgg = await Poll.aggregate([
      { $match: { createdBy: objectId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // ----------------------------------------
    // 5) Votes on user's polls
    // ----------------------------------------
    const userPollVotesAgg = await Poll.aggregate([
      { $match: { createdBy: objectId } },
      { $group: { _id: null, totalVotes: { $sum: { $ifNull: ["$totalVotes", 0] } } } }
    ]);

    const userTotalVotes =
      (userPollVotesAgg[0] && userPollVotesAgg[0].totalVotes) || 0;

    // ----------------------------------------
    // 6) Totals
    // ----------------------------------------
    const totalMyPetitions = await Petition.countDocuments({ createdBy: objectId });
    const totalMyPolls = await Poll.countDocuments({ createdBy: objectId });

    const myActiveEngagement = userTotalSignatures + userTotalVotes;

    // ----------------------------------------
    // 7) Convert agg to map
    // ----------------------------------------
    const aggToMap = (arr) =>
      arr.reduce((acc, cur) => {
        const key = (cur._id === null || cur._id === undefined) ? "unknown" : cur._id;
        acc[key] = cur.count;
        return acc;
      }, {});

    const petitionStatusMap = aggToMap(userPetitionStatusAgg);
    const pollStatusMap = aggToMap(userPollStatusAgg);

    // ----------------------------------------
    // 8) Prepare final formatted response
    // ----------------------------------------
    return res.json({
      success: true,
      data: {
        totals: {
          petitions: totalMyPetitions,
          polls: totalMyPolls,
          activeEngagement: myActiveEngagement
        },
        petitions: {
          status: petitionStatusMap,
          byCategory: userPetitionCategoryAgg.map(x => ({
            category: x._id,
            count: x.count
          }))
        },
        polls: {
          status: pollStatusMap
        },
        totalsDetail: {
          totalSignatures: userTotalSignatures,
          totalPollVotes: userTotalVotes
        },
        generatedAt: new Date()
      }
    });
  } catch (err) {
    console.error("ReportsController.getMyActivity error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
