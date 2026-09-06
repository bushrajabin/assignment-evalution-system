const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    question: { type: String, required: true },
    expectedAnswer: { type: String, required: true },
    submissionType: {
      type: String,
      enum: ["text", "code", "pdf", "image"],
      default: "text",
    },
    maxMarks: { type: Number, required: true, default: 100 },
    deadline: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
