import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import ScoreBadge from "../../components/ScoreBadge";

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/assignments").then(({ data }) => {
      setAssignments(data.assignments);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="max-w-5xl mx-auto px-6 py-10 text-slate">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl text-ink mb-1">Assignments</h1>
      <p className="text-slate mb-8">Everything currently open across your classes.</p>

      {assignments.length === 0 && (
        <div className="ruled-top ruled py-16 text-center text-slate">No assignments posted yet.</div>
      )}

      <div className="ruled-top">
        {assignments.map((a) => {
          const overdue = new Date() > new Date(a.deadline) && !a.mySubmission?.submitted;
          return (
            <div key={a._id} className="ruled py-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl text-ink">{a.title}</h2>
                <p className="text-sm text-slate mt-1">
                  Due {new Date(a.deadline).toLocaleString()} · {a.maxMarks} marks · {a.submissionType}
                  {overdue && <span className="text-rose"> · deadline passed</span>}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                {a.mySubmission?.submitted ? (
                  <ScoreBadge marks={a.mySubmission.marks} maxMarks={a.maxMarks} />
                ) : (
                  <span className="text-sm text-amber">Not submitted</span>
                )}
                <Link
                  to={`/student/assignment/${a._id}`}
                  className="text-sm text-ink underline underline-offset-2"
                >
                  {a.mySubmission?.submitted ? "View" : "Submit"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
