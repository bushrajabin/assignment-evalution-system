const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");
const ctrl = require("../controllers/submissionController");

router.use(protect);

// Student
router.post("/assignment/:assignmentId", requireRole("student"), upload.single("file"), ctrl.submitAssignment);
router.get("/mine", requireRole("student"), ctrl.mySubmissions);

// Teacher
router.get("/assignment/:assignmentId", requireRole("teacher"), ctrl.listSubmissionsForAssignment);
router.post("/:id/re-evaluate", requireRole("teacher"), ctrl.reEvaluate);
router.put("/:id/override", requireRole("teacher"), ctrl.overrideMarks);

module.exports = router;
