import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="ruled bg-paper sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-2xl text-ink tracking-tight">
          Gradeline
        </Link>

        {user && (
          <nav className="flex items-center gap-6 text-sm">
            {user.role === "teacher" ? (
              <>
                <Link to="/teacher" className="text-ink/80 hover:text-ink">Dashboard</Link>
                <Link to="/teacher/new" className="text-ink/80 hover:text-ink">New assignment</Link>
                <Link to="/teacher/performance" className="text-ink/80 hover:text-ink">Performance</Link>
              </>
            ) : (
              <>
                <Link to="/student" className="text-ink/80 hover:text-ink">Assignments</Link>
                <Link to="/student/submissions" className="text-ink/80 hover:text-ink">My submissions</Link>
              </>
            )}
            <span className="text-slate">{user.name}</span>
            <button
              onClick={handleLogout}
              className="border border-ink/20 rounded-full px-4 py-1.5 text-ink hover:bg-ink hover:text-paper transition-colors"
            >
              Sign out
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
