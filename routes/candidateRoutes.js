const express = require("express");
const router = express.Router();
const User = require("./../models/user");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");
const Candidate = require("./../models/candidate");

const checkAdminRole = async (userID) => {
  try {
    console.log("Looking for user with ID:", userID);
    const user = await User.findById(userID);
    console.log("Fetched user:", user);
    if (user.role === "admin") {
      return true;
    }
  } catch (err) {
    return false;
  }
};
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    console.log("userRole", req.user.role);
    console.log("checking for user", req.user);
    console.log("checking for userId", req.user.id);

    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: "user has not admin role" });

    const data = req.body;

    ///new candidate
    const newCandidate = new Candidate(data);
    const response = await newCandidate.save();
    console.log("data saved successfully");
    res.status(200).json({ response: response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

// router.get("/profile", jwtAuthMiddleware, async (req, res) => {
//   try {
//     const userData = req.user;
//     const userId = userData.id;
//     const user = await User.findById(userId);
//     res.status(200).json({ user });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "internal server error" });
//   }
// });

router.put("/:candidateID", async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id)) {
      return res.status(403).json({ message: "user has not have admin role" });
    }
    const candidateID = req.params.candidateID;
    const updateCandidateData = req.body;
    const response = await Candidate.findByIdAndUpdate(
      candidateID,
      updateCandidateData,
      {
        new: true, //return the update document
        runValidators: true, //run mongoose validation
      }
    );
    if (!response) {
      return res.status(404).json({ error: "candidate not found" });
    }

    console.log("candidate data updated");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "interval server error" });
  }
});
router.delete("/:candidateID", async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id)) {
      return res.status(403).json({ message: "user has not have admin role" });
    }
    const candidateID = req.params.candidateID;

    const response = await Candidate.findByIdAndDelete(candidateID);
    if (!response) {
      return res.status(404).json({ error: "candidate not found" });
    }

    console.log("candidate data updated");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "interval server error" });
  }
});

//lets start voting
router.post("/vote/:candidateID", jwtAuthMiddleware, async (req, res) => {
  candidateID = req.params.candidateID;
  userID = req.user.id;

  try {
    //find the candidate with specifiic candidateID
    const candidate = await Candidate.findById(candidateID);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    if (user.isVoted) {
      return res.status(400).json({ message: "you have already voted" });
    }
    if (user.role == "admin") {
      return res.status(403).json({ message: "admin is not allowed" });
    }

    //update the candidate document to recorn the vote

    candidate.votes.push({ user: userID });
    candidate.voteCount++;
    await candidate.save();

    //update the user document
    user.isVoted = true;
    await user.save();

    res.status(200).json({ message: "vote record successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "interval server error" });
  }
});

//vote count
router.get("/vote/count", async (req, res) => {
  try {
    const candidate = await Candidate.find().sort({ voteCount: "desc" });

    //map the candidate to only return their name and voteCount
    const voteRecord = candidate.map((data) => {
      return {
        party: data.party,
        count: data.voteCount,
      };
    });
    return res.status(200).json(voteRecord);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "interval server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const candidateData = await Candidate.find({}, "name party -_id");
    res.status(200).json(candidateData);
    console.log("candidateData", candidateData);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "interval server error" });
  }
});
module.exports = router;
