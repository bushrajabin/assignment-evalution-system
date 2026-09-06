const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");

// Teacher: create assignment
exports.createAssignment = async (req, res) => {
  try {
    const { title, question, expectedAnswer, submissionType, maxMarks, deadline } = req.body;

    if (!title || !question || !expectedAnswer || !maxMarks || !deadline) {
      return res.status(400).json({ message: "title, question, expectedAnswer, maxMarks and deadline are required" });
    }

    const assignment = await Assignment.create({
      teacher: req.user._id,
      title,
      question,
      expectedAnswer,
      submissionType: submissionType || "text",
      maxMarks,
      deadline,
    });

    res.status(201).json({ assignment });
  } catch (err) {
    res.status(500).json({ message: "Failed to create assignment", error: err.message });
  }
};

// Teacher: list own assignments. Student: list all assignments (with own submission status).
exports.listAssignments = async (req, res) => {
  try {
    if (req.user.role === "teacher") {
      const assignments = await Assignment.find({ teacher: req.user._id }).sort({ createdAt: -1 });
      return res.json({ assignments });
    }

    // student
    const assignments = await Assignment.find().sort({ deadline: 1 });
    const submissions = await Submission.find({ student: req.user._id }).select(
      "assignment aiScore finalMarks evaluationStatus"
    );
    const submissionMap = new Map(submissions.map((s) => [String(s.assignment), s]));

    const enriched = assignments.map((a) => {
      const sub = submissionMap.get(String(a._id));
      return {
        ...a.toObject(),
        mySubmission: sub
          ? {
              submitted: true,
              evaluationStatus: sub.evaluationStatus,
              marks: sub.finalMarks !== null ? sub.finalMarks : sub.aiScore,
            }
          : { submitted: false },
      };
    });

    res.json({ assignments: enriched });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch assignments", error: err.message });
  }
};

exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    res.json({ assignment });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch assignment", error: err.message });
  }
};

// Teacher: update assignment
exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    const fields = ["title", "question", "expectedAnswer", "submissionType", "maxMarks", "deadline"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) assignment[f] = req.body[f];
    });

    await assignment.save();
    res.json({ assignment });
  } catch (err) {
    res.status(500).json({ message: "Failed to update assignment", error: err.message });
  }
};

// Teacher: delete assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, teacher: req.user._id });
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    await Submission.deleteMany({ assignment: assignment._id });
    res.json({ message: "Assignment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete assignment", error: err.message });
  }
};

// Teacher: performance overview across all their assignments
exports.getPerformanceOverview = async (req, res) => {
  try {
    const assignments = await Assignment.find({ teacher: req.user._id }).select("_id title maxMarks");
    const assignmentIds = assignments.map((a) => a._id);

    const submissions = await Submission.find({ assignment: { $in: assignmentIds } })
      .populate("student", "name email")
      .populate("assignment", "title maxMarks");

    const byStudent = {};
    submissions.forEach((s) => {
      const key = String(s.student._id);
      if (!byStudent[key]) {
        byStudent[key] = {
          studentId: s.student._id,
          name: s.student.name,
          email: s.student.email,
          submissions: [],
          totalMarks: 0,
          totalMax: 0,
        };
      }
      const marks = s.finalMarks !== null ? s.finalMarks : s.aiScore || 0;
      const maxMarks = s.assignment.maxMarks || 100;
      byStudent[key].submissions.push({
        assignmentTitle: s.assignment.title,
        marks,
        maxMarks,
      });
      byStudent[key].totalMarks += marks;
      byStudent[key].totalMax += maxMarks;
    });

    const performance = Object.values(byStudent).map((s) => ({
      ...s,
      averagePercent: s.totalMax > 0 ? Math.round((s.totalMarks / s.totalMax) * 100) : 0,
    }));

    res.json({ performance });
  } catch (err) {
    res.status(500).json({ message: "Failed to compute performance overview", error: err.message });
  }
};
