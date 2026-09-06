import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setDone(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-ink mb-1">Choose a new password</h1>
        <p className="text-slate mb-8">This link works once and expires after 30 minutes.</p>

        {done ? (
          <p className="text-leaf text-sm">Password updated. Redirecting to sign in...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-ink mb-1">New password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-rule rounded-md px-3 py-2 bg-white focus:border-ink outline-none"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm text-ink mb-1">Confirm new password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full border border-rule rounded-md px-3 py-2 bg-white focus:border-ink outline-none"
              />
            </div>

            {error && <p className="text-rose text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-paper rounded-md py-2.5 font-medium hover:bg-ink/90 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        )}

        <p className="text-sm text-slate mt-6">
          <Link to="/login" className="text-ink underline underline-offset-2">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}