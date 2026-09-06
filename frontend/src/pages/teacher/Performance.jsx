import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../../api/axios";

export default function Performance() {
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/assignments/performance/overview").then(({ data }) => {
      setPerformance(data.performance);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="max-w-5xl mx-auto px-6 py-10 text-slate">Loading...</div>;

  const chartData = performance.map((p) => ({ name: p.name.split(" ")[0], average: p.averagePercent }));

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl text-ink mb-1">Student performance</h1>
      <p className="text-slate mb-8">Average score across all your assignments, per student.</p>

      {performance.length === 0 ? (
        <div className="ruled-top ruled py-16 text-center text-slate">No graded submissions yet.</div>
      ) : (
        <>
          <div className="bg-white border border-rule rounded-md p-4 mb-8" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DDD8CC" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="average" fill="#D9A441" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="ruled-top">
            {performance.map((p) => (
              <div key={p.studentId} className="ruled py-4 flex items-center justify-between">
                <div>
                  <p className="text-ink font-medium">{p.name}</p>
                  <p className="text-sm text-slate">{p.email} · {p.submissions.length} submission(s)</p>
                </div>
                <p className="font-display text-xl text-ink">{p.averagePercent}%</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
