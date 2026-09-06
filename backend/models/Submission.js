const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // The raw submitted content
    answerText: { type: String, default: "" },
    filePath: { type: String, default: null },
    fileOriginalName: { type: String, default: null },
    fileMimeType: { type: String, default: null },

    // Extracted plain text used for evaluation (from PDF/OCR/code/text)
    extractedText: { type: String, default: "" },

    isLate: { type: Boolean, default: false },

    // AI evaluation results
    aiScore: { type: Number, default: null },
    aiFeedback: { type: String, default: "" },
    mistakes: [{ type: String }],
    evaluationStatus: {
      type: String,
      enum: ["pending", "evaluated", "failed"],
      default: "pending",
    },
    evaluationRaw: { type: mongoose.Schema.Types.Mixed, default: null },

    // Teacher override
    finalMarks: { type: Number, default: null },
    teacherOverridden: { type: Boolean, default: false },
    teacherComment: { type: String, default: "" },
  },
  { timestamps: true }
);

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
