import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import ScoreBadge from "../../components/ScoreBadge";

export default function AssignmentDetail() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get(`/assignments/${id}`), api.get("/submissions/mine")]).then(
      ([aRes, sRes]) => {
        setAssignment(aRes.data.assignment);
        const existing = sRes.data.submissions.find((s) => s.assignment?._id === id);
        if (existing) setResult(existing);
        setLoading(false);
      }
    );
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("answerText", answerText);
      if (file) formData.append("file", file);

      const { data } = await api.post(`/submissions/assignment/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data.submission);
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto px-6 py-10 text-slate">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl text-ink mb-1">{assignment.title}</h1>
      <p className="text-slate mb-6">
        Due {new Date(assignment.deadline).toLocaleString()} · {assignment.maxMarks} marks
      </p>

      <div className="bg-white border border-rule rounded-md p-5 mb-8">
        <p className="text-xs uppercase tracking-wide text-slate mb-1">Question</p>
        <p className="text-ink whitespace-pre-wrap">{assignment.question}</p>
      </div>

      {result ? (
        <div className="bg-white border border-rule rounded-md p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-display text-xl text-ink">Your result</p>
            <ScoreBadge
              marks={result.finalMarks !== null ? result.finalMarks : result.aiScore}
              maxMarks={assignment.maxMarks}
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate mb-1">Feedback</p>
            <p className="text-sm text-ink">{result.aiFeedback}</p>
          </div>
          {result.mistakes?.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-slate mb-1">Points to improve</p>
              <ul className="list-disc list-inside text-sm text-ink space-y-1">
                {result.mistakes.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}
          {result.teacherOverridden && (
            <p className="text-xs text-amber">Marks were reviewed and adjusted by your teacher.</p>
          )}
          {result.teacherComment && (
            <div>
              <p className="text-xs uppercase tracking-wide text-slate mb-1">Teacher comment</p>
              <p className="text-sm text-ink">{result.teacherComment}</p>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-ink mb-1">Your answer</label>
            <textarea
              rows={8}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="w-full border border-rule rounded-md px-3 py-2 bg-white focus:border-ink outline-none"
              placeholder={
                assignment.submissionType === "code"
                  ? "Paste your code here, or attach a file below."
                  : "Type your answer here, or attach a file below."
              }
            />
          </div>
          <div>
            <label className="block text-sm text-ink mb-1">
              Attach file {assignment.submissionType !== "text" && `(${assignment.submissionType})`}
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm text-slate"
            />
          </div>

          {error && <p className="text-rose text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting || (!answerText.trim() && !file)}
            className="bg-ink text-paper rounded-full px-6 py-2.5 text-sm font-medium hover:bg-ink/90 disabled:opacity-50"
          >
            {submitting ? "Evaluating..." : "Submit assignment"}
          </button>
        </form>
      )}
    </div>
  );
}
