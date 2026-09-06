import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function CreateAssignment() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    question: "",
    expectedAnswer: "",
    submissionType: "text",
    maxMarks: 100,
    deadline: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/assignments", form);
      navigate("/teacher");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create assignment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl text-ink mb-1">New assignment</h1>
      <p className="text-slate mb-8">Define the question, the expected solution, and the grading window.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm text-ink mb-1">Title</label>
          <input
            required
            value={form.title}
            onChange={update("title")}
            className="w-full border border-rule rounded-md px-3 py-2 bg-white focus:border-ink outline-none"
            placeholder="e.g. Newton's Laws — Short Answer"
          />
        </div>

        <div>
          <label className="block text-sm text-ink mb-1">Question</label>
          <textarea
            required
            rows={3}
            value={form.question}
            onChange={update("question")}
            className="w-full border border-rule rounded-md px-3 py-2 bg-white focus:border-ink outline-none"
            placeholder="What the student is being asked to answer or solve."
          />
        </div>

        <div>
          <label className="block text-sm text-ink mb-1">Expected answer / model solution</label>
          <textarea
            required
            rows={5}
            value={form.expectedAnswer}
            onChange={update("expectedAnswer")}
            className="w-full border border-rule rounded-md px-3 py-2 bg-white focus:border-ink outline-none"
            placeholder="The reference answer the AI evaluator will grade against."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-ink mb-1">Submission type</label>
            <select
              value={form.submissionType}
              onChange={update("submissionType")}
              className="w-full border border-rule rounded-md px-3 py-2 bg-white focus:border-ink outline-none"
            >
              <option value="text">Text</option>
              <option value="code">Code</option>
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-ink mb-1">Max marks</label>
            <input
              type="number"
              min={1}
              required
              value={form.maxMarks}
              onChange={update("maxMarks")}
              className="w-full border border-rule rounded-md px-3 py-2 bg-white focus:border-ink outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-ink mb-1">Deadline</label>
          <input
            type="datetime-local"
            required
            value={form.deadline}
            onChange={update("deadline")}
            className="w-full border border-rule rounded-md px-3 py-2 bg-white focus:border-ink outline-none"
          />
        </div>

        {error && <p className="text-rose text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-ink text-paper rounded-full px-6 py-2.5 text-sm font-medium hover:bg-ink/90 disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create assignment"}
        </button>
      </form>
    </div>
  );
}
