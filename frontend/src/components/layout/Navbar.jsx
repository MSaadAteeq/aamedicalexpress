import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { Ambulance, LayoutDashboard, ShieldCheck, House, ClipboardList, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tripHistoryHref = user?.role === "admin" ? "/admin/trip-history" : "/trip-history";

  const navItems = [
    { href: "/", label: "Home", icon: House },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, authOnly: true },
    { href: "/request-ride", label: "Request Ride", icon: Ambulance, authOnly: true },
    { href: tripHistoryHref, label: "Trip History", icon: ClipboardList, authOnly: true },
    { href: "/emergency-ride", label: "Emergency", icon: Ambulance },
    ...(user?.role === "admin"
      ? [{ href: "/admin/dashboard", label: "Dispatch", icon: ShieldCheck, authOnly: true }]
      : []),
  ];
  const visibleNavItems = navItems.filter((item) => (item.authOnly ? isAuthenticated : true));

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Ambulance size={16} />
          </span>
          PMT Member
        </Link>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 md:hidden"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <nav className="hidden max-w-full items-center gap-1 overflow-x-auto sm:gap-2 md:flex">
          {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={clsx(
                  "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition",
                  pathname === item.href ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <item.icon size={14} />
                {item.label}
              </Link>
            ))}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              Sign Out
            </button>
          ) : (
            <Link to="/login" className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white">
              Login
            </Link>
          )}
        </nav>
      </div>

      {isMobileMenuOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-2">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                  pathname === item.href ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                )}
              >
                <item.icon size={14} />
                {item.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700"
              >
                Sign Out
              </button>
            ) : (
              <Link to="/login" className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white">
                Login
              </Link>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
