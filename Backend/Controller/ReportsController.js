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
    // ----------------------------------------
    // 1) Extract User ID (JWT)
    // ----------------------------------------
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID missing"
      });
    }

    // Convert to ObjectId for matching
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(userId);
    } catch (e) {
      console.log("⚠ Invalid ObjectId, using string match fallback");
      objectId = userId; // fallback if wrong format
    }

    // ----------------------------------------
    // 2) Petitions created by user
    // ----------------------------------------
    const userPetitionStatusAgg = await Petition.aggregate([
      {
        $match: {
          $or: [
            { createdBy: objectId },       // match ObjectId
            { createdBy: userId }          // match string
          ]
        }
      },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const userPetitionCategoryAgg = await Petition.aggregate([
      {
        $match: {
          $or: [
            { createdBy: objectId },
            { createdBy: userId }
          ]
        }
      },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const userPetitionSignaturesAgg = await Petition.aggregate([
      {
        $match: {
          $or: [
            { createdBy: objectId },
            { createdBy: userId }
          ]
        }
      },
      { $project: { sigCount: { $size: { $ifNull: ["$signatures", []] } } } },
      { $group: { _id: null, totalSignatures: { $sum: "$sigCount" } } }
    ]);

    const userTotalSignatures =
      (userPetitionSignaturesAgg[0]?.totalSignatures) || 0;

    // ----------------------------------------
    // 3) Polls created by user
    // ----------------------------------------
    const userPollStatusAgg = await Poll.aggregate([
        { 
          $match: { 
            $or: [
              { createdBy: objectId },
              { authorId: objectId.toString() }
            ] 
          } 
        },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]);

    const userPollVotesAgg = await Poll.aggregate([
  { 
    $match: {
      $or: [
        { createdBy: objectId },
        { authorId: objectId.toString() }
      ]
    }
  },
  { $group: { _id: null, totalVotes: { $sum: { $ifNull: ["$totalVotes", 0] } } } }
]);


    const userTotalVotes =
      (userPollVotesAgg[0]?.totalVotes) || 0;

    const userPollLocationAgg = await Poll.aggregate([
  { 
    $match: {
      $or: [
        { createdBy: objectId },
        { authorId: objectId.toString() }
      ]
    }
  },
  { $group: { _id: "$location", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 20 }
]);


    // ----------------------------------------
    // 4) Totals
    // ----------------------------------------
    const totalMyPetitions = await Petition.countDocuments({
      $or: [{ 
        createdBy: objectId },
         { createdBy: userId }]
    });

    const totalMyPolls = await Poll.countDocuments({
  $or: [
    { createdBy: objectId },
    { authorId: objectId.toString() }
  ]
});


    const myActiveEngagement = userTotalSignatures + userTotalVotes;

    // ----------------------------------------
    // 5) Convert aggregation arrays to maps
    // ----------------------------------------
    const aggToMap = arr =>
      arr.reduce((acc, cur) => {
        acc[cur._id || "unknown"] = cur.count;
        return acc;
      }, {});

    const petitionStatusMap = aggToMap(userPetitionStatusAgg);
    const pollStatusMap = aggToMap(userPollStatusAgg);

    // ----------------------------------------
    // 6) Send final response
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
          status: pollStatusMap,
          byLocation: userPollLocationAgg.map(x => ({
            location: x._id,
            count: x.count
          }))
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
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
