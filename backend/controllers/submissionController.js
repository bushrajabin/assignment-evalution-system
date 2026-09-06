const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const { evaluateSubmission } = require("../services/aiEvaluationService");
const { extractTextFromFile } = require("../services/textExtractionService");

// Student: submit an assignment (text and/or file)
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { answerText } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    const existing = await Submission.findOne({ assignment: assignmentId, student: req.user._id });
    if (existing) {
      return res.status(409).json({ message: "You have already submitted this assignment. Contact your teacher to resubmit." });
    }

    let extractedText = answerText || "";
    let filePath = null;
    let fileOriginalName = null;
    let fileMimeType = null;

    if (req.file) {
      filePath = req.file.path;
      fileOriginalName = req.file.originalname;
      fileMimeType = req.file.mimetype;
      const fromFile = await extractTextFromFile(req.file.path, req.file.mimetype);
      extractedText = [extractedText, fromFile].filter(Boolean).join("\n\n");
    }

    const isLate = new Date() > new Date(assignment.deadline);

    const submission = await Submission.create({
      assignment: assignment._id,
      student: req.user._id,
      answerText: answerText || "",
      filePath,
      fileOriginalName,
      fileMimeType,
      extractedText,
      isLate,
    });

    // Run AI evaluation immediately (synchronously) so the student gets instant feedback.
    try {
      const result = await evaluateSubmission({
        question: assignment.question,
        expectedAnswer: assignment.expectedAnswer,
        studentAnswer: extractedText,
        maxMarks: assignment.maxMarks,
      });

      const scaledScore = Math.round((result.score / 100) * assignment.maxMarks);

      submission.aiScore = scaledScore;
      submission.aiFeedback = result.feedback;
      submission.mistakes = result.mistakes;
      submission.evaluationRaw = result.raw;
      submission.evaluationStatus = "evaluated";
    } catch (evalErr) {
      console.error("Evaluation failed:", evalErr.message);
      submission.evaluationStatus = "failed";
    }

    await submission.save();
    res.status(201).json({ submission });
  } catch (err) {
    res.status(500).json({ message: "Submission failed", error: err.message });
  }
};

// Student: list own submissions
exports.mySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate("assignment", "title maxMarks deadline question")
      .sort({ createdAt: -1 });
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch submissions", error: err.message });
  }
};

// Teacher: list submissions for one of their assignments
exports.listSubmissionsForAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.assignmentId, teacher: req.user._id });
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    const submissions = await Submission.find({ assignment: assignment._id })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    res.json({ assignment, submissions });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch submissions", error: err.message });
  }
};

// Teacher: re-run AI evaluation manually
exports.reEvaluate = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate("assignment");
    if (!submission) return res.status(404).json({ message: "Submission not found" });
    if (String(submission.assignment.teacher) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized for this assignment" });
    }

    const result = await evaluateSubmission({
      question: submission.assignment.question,
      expectedAnswer: submission.assignment.expectedAnswer,
      studentAnswer: submission.extractedText,
      maxMarks: submission.assignment.maxMarks,
    });

    submission.aiScore = Math.round((result.score / 100) * submission.assignment.maxMarks);
    submission.aiFeedback = result.feedback;
    submission.mistakes = result.mistakes;
    submission.evaluationRaw = result.raw;
    submission.evaluationStatus = "evaluated";
    await submission.save();

    res.json({ submission });
  } catch (err) {
    res.status(500).json({ message: "Re-evaluation failed", error: err.message });
  }
};

// Teacher: override marks
exports.overrideMarks = async (req, res) => {
  try {
    const { finalMarks, teacherComment } = req.body;
    if (finalMarks === undefined || finalMarks === null) {
      return res.status(400).json({ message: "finalMarks is required" });
    }

    const submission = await Submission.findById(req.params.id).populate("assignment");
    if (!submission) return res.status(404).json({ message: "Submission not found" });
    if (String(submission.assignment.teacher) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized for this assignment" });
    }

    submission.finalMarks = finalMarks;
    submission.teacherOverridden = true;
    if (teacherComment !== undefined) submission.teacherComment = teacherComment;

    await submission.save();
    res.json({ submission });
  } catch (err) {
    res.status(500).json({ message: "Failed to override marks", error: err.message });
  }
};
