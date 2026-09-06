import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import ScoreBadge from "../../components/ScoreBadge";

export default function MySubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/submissions/mine").then(({ data }) => {
      setSubmissions(data.submissions);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="max-w-4xl mx-auto px-6 py-10 text-slate">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl text-ink mb-1">My submissions</h1>
      <p className="text-slate mb-8">A record of everything you've turned in.</p>

      {submissions.length === 0 && (
        <div className="ruled-top ruled py-16 text-center text-slate">You haven't submitted anything yet.</div>
      )}

      <div className="ruled-top">
        {submissions.map((s) => (
          <div key={s._id} className="ruled py-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg text-ink">{s.assignment?.title}</h2>
              <p className="text-sm text-slate mt-1">
                Submitted {new Date(s.createdAt).toLocaleString()}
                {s.isLate && <span className="text-rose"> · late</span>}
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <ScoreBadge
                marks={s.finalMarks !== null ? s.finalMarks : s.aiScore}
                maxMarks={s.assignment?.maxMarks}
              />
              <Link
                to={`/student/assignment/${s.assignment?._id}`}
                className="text-sm text-ink underline underline-offset-2"
              >
                Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
