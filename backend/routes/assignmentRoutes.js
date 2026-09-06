const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/assignmentController");

router.use(protect);

router.post("/", requireRole("teacher"), ctrl.createAssignment);
router.get("/", ctrl.listAssignments);
router.get("/performance/overview", requireRole("teacher"), ctrl.getPerformanceOverview);
router.get("/:id", ctrl.getAssignment);
router.put("/:id", requireRole("teacher"), ctrl.updateAssignment);
router.delete("/:id", requireRole("teacher"), ctrl.deleteAssignment);

module.exports = router;
