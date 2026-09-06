import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, error, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await register(form);
      navigate(user.role === "teacher" ? "/teacher" : "/student");
    } catch {
      // error already set in context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-ink mb-1">Create an account</h1>
        <p className="text-slate mb-8">Set up your Gradeline profile.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex rounded-md border border-rule overflow-hidden">
            {["student", "teacher"].map((role) => (
              <button
                type="button"
                key={role}
                onClick={() => setForm({ ...form, role })}
                className={`flex-1 py-2 text-sm capitalize transition-colors ${
                  form.role === role ? "bg-ink text-paper" : "bg-white text-ink"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm text-ink mb-1">Full name</label>
            <input
              required
              value={form.name}
              onChange={update("name")}
              className="w-full border border-rule rounded-md px-3 py-2 bg-white focus:border-ink outline-none"
              placeholder="Jordan Rivera"
            />
          </div>
          <div>
            <label className="block text-sm text-ink mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={update("email")}
              className="w-full border border-rule rounded-md px-3 py-2 bg-white focus:border-ink outline-none"
              placeholder="you@school.edu"
            />
          </div>
          <div>
            <label className="block text-sm text-ink mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={update("password")}
              className="w-full border border-rule rounded-md px-3 py-2 bg-white focus:border-ink outline-none"
              placeholder="At least 6 characters"
            />
          </div>

          {error && <p className="text-rose text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-paper rounded-md py-2.5 font-medium hover:bg-ink/90 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-slate mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-ink underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
