import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import ScoreBadge from "../../components/ScoreBadge";

export default function ViewSubmissions() {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [overrideDrafts, setOverrideDrafts] = useState({});

  const load = () => {
    api.get(`/submissions/assignment/${assignmentId}`).then(({ data }) => {
      setAssignment(data.assignment);
      setSubmissions(data.submissions);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  const handleReEvaluate = async (id) => {
    await api.post(`/submissions/${id}/re-evaluate`);
    load();
  };

  const handleOverride = async (id) => {
    const draft = overrideDrafts[id];
    if (draft === undefined || draft === "") return;
    await api.put(`/submissions/${id}/override`, { finalMarks: Number(draft) });
    load();
  };

  if (loading) return <div className="max-w-5xl mx-auto px-6 py-10 text-slate">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl text-ink">{assignment.title}</h1>
      <p className="text-slate mt-1 mb-8">
        {submissions.length} submission{submissions.length !== 1 ? "s" : ""} · max {assignment.maxMarks} marks
      </p>

      {submissions.length === 0 && (
        <div className="ruled-top ruled py-16 text-center text-slate">No submissions yet.</div>
      )}

      <div className="ruled-top">
        {submissions.map((s) => {
          const isOpen = openId === s._id;
          const displayedMarks = s.finalMarks !== null ? s.finalMarks : s.aiScore;
          return (
            <div key={s._id} className="ruled py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-ink font-medium">{s.student.name}</p>
                  <p className="text-sm text-slate">
                    {s.student.email} · submitted {new Date(s.createdAt).toLocaleString()}
                    {s.isLate && <span className="text-rose"> · late</span>}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <ScoreBadge marks={displayedMarks} maxMarks={assignment.maxMarks} />
                  <button
                    onClick={() => setOpenId(isOpen ? null : s._id)}
                    className="text-sm text-ink underline underline-offset-2"
                  >
                    {isOpen ? "Hide" : "Review"}
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="mt-4 bg-white border border-rule rounded-md p-5 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate mb-1">Submitted answer</p>
                    <p className="text-ink whitespace-pre-wrap text-sm">
                      {s.extractedText || s.answerText || "(no text content)"}
                    </p>
                    {s.filePath && (
                      <a
                        href={`${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}/uploads/${s.filePath.split("/").pop()}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-ink underline underline-offset-2 inline-block mt-2"
                      >
                        Download original file ({s.fileOriginalName})
                      </a>
                    )}
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate mb-1">AI feedback</p>
                    <p className="text-sm text-ink">{s.aiFeedback || "Not evaluated yet."}</p>
                  </div>

                  {s.mistakes?.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate mb-1">Flagged issues</p>
                      <ul className="list-disc list-inside text-sm text-ink space-y-1">
                        {s.mistakes.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2 ruled-top">
                    <button
                      onClick={() => handleReEvaluate(s._id)}
                      className="text-sm border border-ink/20 rounded-full px-4 py-1.5 hover:bg-ink hover:text-paper transition-colors mt-4"
                    >
                      Re-run AI evaluation
                    </button>

                    <div className="flex items-center gap-2 mt-4">
                      <input
                        type="number"
                        placeholder="Override marks"
                        min={0}
                        max={assignment.maxMarks}
                        value={overrideDrafts[s._id] ?? ""}
                        onChange={(e) =>
                          setOverrideDrafts({ ...overrideDrafts, [s._id]: e.target.value })
                        }
                        className="w-32 border border-rule rounded-md px-3 py-1.5 text-sm bg-white focus:border-ink outline-none"
                      />
                      <button
                        onClick={() => handleOverride(s._id)}
                        className="text-sm bg-ink text-paper rounded-full px-4 py-1.5 hover:bg-ink/90"
                      >
                        Save marks
                      </button>
                    </div>
                  </div>
                  {s.teacherOverridden && (
                    <p className="text-xs text-amber">Marks manually overridden by teacher.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
