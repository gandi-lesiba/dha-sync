import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Search,
  Truck,
  BarChart3,
  Folder,
  FileText,
  Users,
  ClipboardList,
  Settings,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_BY_ROLE = {
  officer: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/cases", label: "Cases", icon: Folder },
    { to: "/documents", label: "Documents", icon: FileText },
  ],
  supervisor: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/cases", label: "Cases", icon: Folder },
    { to: "/documents", label: "Documents", icon: FileText },
    { to: "/deportation", label: "Deportation", icon: Truck },
    { to: "/reports", label: "Reports", icon: BarChart3 },
  ],
  admin: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/cases", label: "Cases", icon: Folder },
    { to: "/users", label: "Users", icon: Users },
    { to: "/audit", label: "Audit Log", icon: ClipboardList },
    { to: "/settings", label: "Settings", icon: Settings },
  ],
};

const ROLE_LABEL = { officer: "Case Officer", supervisor: "Supervisor", admin: "Administrator" };

const PAGE_SUBTITLE_BY_PATH = [
  { test: (p) => p === "/", label: (role) => `${ROLE_LABEL[role] || ""} Dashboard` },
  { test: (p) => p === "/cases", label: () => "Cases" },
  { test: (p) => /^\/cases\/new$/.test(p), label: () => "Register New Case" },
  { test: (p) => /^\/cases\/\d+/.test(p), label: () => "Case Detail" },
  { test: (p) => p === "/documents", label: () => "Documents" },
  { test: (p) => p === "/deportation", label: () => "Deportation Workflow" },
  { test: (p) => p === "/reports", label: () => "Reports & Analytics" },
  { test: (p) => p === "/users", label: () => "User Management" },
  { test: (p) => p === "/audit", label: () => "Audit Log" },
  { test: (p) => p === "/settings", label: () => "Settings" },
];

function pageSubtitle(pathname, role) {
  const match = PAGE_SUBTITLE_BY_PATH.find((entry) => entry.test(pathname));
  return match ? match.label(role) : "";
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = NAV_BY_ROLE[user?.role] || [];
  const initial = (user?.full_name || user?.username || "?").charAt(0).toUpperCase();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="fixed inset-x-0 top-0 z-20 flex h-[58px] items-center justify-between bg-dha-blue px-5 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-white text-xs font-bold text-dha-blue">
            DHA
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Case Management &amp; Deportation Workflow System</div>
            <div className="text-xs text-[#a9c1d8]">{pageSubtitle(location.pathname, user?.role)}</div>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full bg-[#134a7a] px-3 py-1.5 md:flex">
          <Search className="h-4 w-4 text-[#a9c1d8]" />
          <input
            placeholder="Search case number, name..."
            className="w-56 bg-transparent text-sm text-white placeholder-[#a9c1d8] focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-dha-blue">
            {ROLE_LABEL[user?.role] || user?.role}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#134a7a] text-sm font-semibold">
            {initial}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-[#c9d8e8] hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 z-10 mt-[58px] w-[210px] border-r border-gray-200 bg-white">
        <nav className="py-6">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 border-l-4 px-5 py-3 text-sm ${
                  isActive
                    ? "border-l-dha-blue bg-dha-blue-light font-semibold text-dha-blue"
                    : "border-l-transparent text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="ml-[210px] mt-[58px] p-7">{children}</main>
    </div>
  );
}