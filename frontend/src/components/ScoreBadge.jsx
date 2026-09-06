import React from "react";

export default function ScoreBadge({ marks, maxMarks }) {
  if (marks === null || marks === undefined) {
    return <span className="text-slate text-sm">Not yet graded</span>;
  }

  const pct = maxMarks ? Math.round((marks / maxMarks) * 100) : 0;
  const color = pct >= 75 ? "text-leaf" : pct >= 50 ? "text-amber" : "text-rose";

  return (
    <span className={`font-display text-lg ${color}`}>
      {marks}
      <span className="text-slate text-sm"> / {maxMarks}</span>
    </span>
  );
}
