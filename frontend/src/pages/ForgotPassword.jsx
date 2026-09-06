import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [devResetUrl, setDevResetUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setDevResetUrl("");
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setMessage(data.message);
      if (data.devResetUrl) setDevResetUrl(data.devResetUrl);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-ink mb-1">Reset your password</h1>
        <p className="text-slate mb-8">Enter your email and we'll send you a reset link.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-ink mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-rule rounded-md px-3 py-2 bg-white focus:border-ink outline-none"
              placeholder="you@school.edu"
            />
          </div>

          {error && <p className="text-rose text-sm">{error}</p>}
          {message && <p className="text-leaf text-sm">{message}</p>}

          {devResetUrl && (
            <div className="bg-white border border-rule rounded-md p-3 text-sm">
              <p className="text-slate mb-1">
                No email server is configured yet, so here's your reset link directly:
              </p>
              <Link to={devResetUrl.replace(window.location.origin, "")} className="text-ink underline break-all">
                {devResetUrl}
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-paper rounded-md py-2.5 font-medium hover:bg-ink/90 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="text-sm text-slate mt-6">
          <Link to="/login" className="text-ink underline underline-offset-2">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}