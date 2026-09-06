import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function TeacherDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/assignments")
      .then(({ data }) => setAssignments(data.assignments))
      .catch((err) => setError(err.response?.data?.message || "Failed to load assignments"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this assignment and all its submissions?")) return;
    await api.delete(`/assignments/${id}`);
    setAssignments((prev) => prev.filter((a) => a._id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-ink">Your assignments</h1>
          <p className="text-slate mt-1">Create, manage, and review submissions.</p>
        </div>
        <Link
          to="/teacher/new"
          className="bg-ink text-paper rounded-full px-5 py-2.5 text-sm font-medium hover:bg-ink/90"
        >
          + New assignment
        </Link>
      </div>

      {loading && <p className="text-slate">Loading...</p>}
      {error && <p className="text-rose">{error}</p>}

      {!loading && assignments.length === 0 && (
        <div className="ruled-top ruled py-16 text-center text-slate">
          No assignments yet. Create your first one to start collecting submissions.
        </div>
      )}

      <div className="ruled-top">
        {assignments.map((a) => (
          <div key={a._id} className="ruled py-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl text-ink">{a.title}</h2>
              <p className="text-sm text-slate mt-1">
                {a.maxMarks} marks · due {new Date(a.deadline).toLocaleString()} · {a.submissionType}
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <Link
                to={`/teacher/assignment/${a._id}/submissions`}
                className="text-sm text-ink underline underline-offset-2"
              >
                View submissions
              </Link>
              <button
                onClick={() => handleDelete(a._id)}
                className="text-sm text-rose hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
