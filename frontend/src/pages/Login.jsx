import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      navigate(user.role === "teacher" ? "/teacher" : "/student");
    } catch {
      // error already set in context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-ink mb-1">Welcome back</h1>
        <p className="text-slate mb-8">Sign in to Gradeline to continue.</p>

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
          <div>
            <label className="block text-sm text-ink mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-rule rounded-md px-3 py-2 bg-white focus:border-ink outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-rose text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-paper rounded-md py-2.5 font-medium hover:bg-ink/90 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-ink underline underline-offset-2">
            Forgot password?
          </Link>
        </div>

        {error && <p className="text-rose text-sm">{error}</p>}

        <p className="text-sm text-slate mt-6">
          New here?{" "}
          <Link to="/register" className="text-ink underline underline-offset-2">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
