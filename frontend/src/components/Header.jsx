import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../components/authentication/authContext";

const Header = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);

  if (loading) return null;
  if (!user) return null;

  const navItems = useMemo(
    () => [
      { path: "/dashboard", label: "Dashboard", roles: ["HOD", "MANAGER", "ADMIN", "USER", "VIEWER"] },
      { path: "/units", label: "Unit In/Out", roles: ["HOD", "MANAGER", "ADMIN", "USER"] },
      { path: "/list_of_employees", label: "List of Employees", roles: ["HOD"] },
    ],
    []
  );

  const filteredNavItems = useMemo(() => {
    return navItems.filter((i) => i.roles.includes(user.role));
  }, [navItems, user.role]);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = (user?.name || user?.email || "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div
          className={[
            "mt-3 flex items-center justify-between gap-3",
            "rounded-2xl border",
            "bg-white/70 backdrop-blur-xl",
            scrolled ? "shadow-md border-slate-200/70" : "shadow-sm border-white/40",
          ].join(" ")}
        >
          <div className="flex items-center gap-3 pl-4 py-3">
            <Link
              to="/dashboard"
              className="font-semibold text-slate-900 tracking-tight text-base sm:text-lg"
            >
              LabTool
            </Link>
          </div>

          <nav className="hidden lg:flex items-center justify-center gap-1 px-2">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={[
                  "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                  isActive(item.path)
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center pr-3 py-2" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-100 transition-colors"
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-semibold">
                {initials}
              </div>

              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-sm font-semibold text-slate-900 max-w-35 truncate">
                  {user?.name || user?.email}
                </span>
                <span className="text-xs text-slate-500 uppercase tracking-wide">
                  {user.role}
                </span>
              </div>

              <span className="text-slate-500 text-sm">▾</span>
            </button>

            {menuOpen && (
              <div className="hidden lg:block absolute right-0 top-18 w-72 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-xl shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {user?.name || "User"}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{user?.email}</div>
                  <div className="mt-1">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="p-2">
                  {filteredNavItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMenuOpen(false)}
                      className={[
                        "block rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                        isActive(item.path)
                          ? "bg-slate-900 text-white"
                          : "text-slate-700 hover:bg-slate-100",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  ))}

                  <div className="my-2 h-px bg-slate-100" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`lg:hidden ${menuOpen ? "" : "hidden"}`}>
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setMenuOpen(false)}
        />

        <div className="fixed right-0 top-0 h-full w-80 max-w-[85vw] z-50 bg-white shadow-2xl">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900 truncate">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-slate-500 truncate">{user?.email}</div>
            </div>
            <button
              className="rounded-lg px-3 py-2 hover:bg-slate-100"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <div className="p-3">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={[
                  "block rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                  isActive(item.path)
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100",
                ].join(" ")}
              >
                {item.label}
              </Link>
            ))}

            <div className="my-3 h-px bg-slate-100" />

            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left rounded-xl px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;