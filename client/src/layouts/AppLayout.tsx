import argosLogo from "../assets/argos-logo.svg";

import { useEffect, useState } from "react";

import { Outlet, NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Ticket,
  BookOpen,
  Sparkles,
  PlusCircle,
  LogOut,
  Shield,
  FlaskConical,
  Settings,
  Bell,
  ClipboardList,
  Circle,
  Menu,
  X,
} from "lucide-react";

import { socket } from "../socket";

type OnlineAgent = {
  socketId: string;
  name: string;
  email: string;
  role: string;
};

function AppLayout() {
  const navigate = useNavigate();

  const [onlineAgents, setOnlineAgents] = useState<OnlineAgent[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("argos_user") || "{}");

  useEffect(() => {
    if (user?.email) {
      socket.emit("agent-online", user);
    }

    socket.on("online-agents", (agents: OnlineAgent[]) => {
      setOnlineAgents(agents);
    });

    return () => {
      socket.off("online-agents");
    };
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("argos_token");
    localStorage.removeItem("argos_user");

    navigate("/login");
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition ${
      isActive
        ? "bg-violet-600 text-white"
        : "text-slate-300 hover:bg-slate-800"
    }`;

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 p-4 lg:hidden">
        <div className="flex items-center gap-3">
          <img
            src={argosLogo}
            alt="Argos Logo"
            className="h-10 w-10 rounded-xl"
          />

          <h1 className="text-lg font-bold">Argos System</h1>
        </div>

        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-slate-300 hover:bg-slate-800"
        >
          <Menu size={24} />
        </button>
      </div>

      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 transform flex-col border-r border-slate-800 bg-slate-900 p-6 transition-transform duration-300 lg:static lg:w-64 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-3">
              <img
                src={argosLogo}
                alt="Argos Logo"
                className="h-10 w-10 rounded-xl"
              />

              <h1 className="text-lg font-bold">Argos</h1>
            </div>

            <button
              onClick={closeSidebar}
              className="rounded-lg p-2 text-slate-300 hover:bg-slate-800"
            >
              <X size={22} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="hidden items-center gap-3 lg:flex">
              <img
                src={argosLogo}
                alt="Argos Logo"
                className="h-11 w-11 rounded-xl"
              />

              <div>
                <h1 className="text-xl font-bold">Argos System</h1>

                <p className="mt-1 text-sm text-slate-400">
                  AI-powered IT support
                </p>
              </div>
            </div>

            {user?.email && (
              <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm font-medium">{user.name}</p>

                <p className="mt-1 truncate text-xs text-slate-400">
                  {user.email}
                </p>

                <p className="mt-2 text-xs uppercase text-violet-400">
                  {user.role}
                </p>
              </div>
            )}

            <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold">Online Agents</p>

                <span className="rounded bg-emerald-500/20 px-2 py-1 text-xs text-emerald-400">
                  {onlineAgents.length}
                </span>
              </div>

              {onlineAgents.length === 0 ? (
                <p className="text-xs text-slate-500">No agents online</p>
              ) : (
                <div className="space-y-3">
                  {onlineAgents.map((agent) => (
                    <div
                      key={agent.socketId}
                      className="flex items-center gap-3"
                    >
                      <Circle
                        size={9}
                        className="fill-emerald-400 text-emerald-400"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-sm text-slate-200">
                          {agent.name || "Agent"}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {agent.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <nav className="mt-8 space-y-2">
              <NavLink
                to="/tickets"
                end
                className={navClass}
                onClick={closeSidebar}
              >
                <Ticket size={18} />
                Tickets
              </NavLink>

              <NavLink
                to="/tickets/new"
                className={navClass}
                onClick={closeSidebar}
              >
                <PlusCircle size={18} />
                Create Ticket
              </NavLink>

              <NavLink
                to="/"
                end
                className={navClass}
                onClick={closeSidebar}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </NavLink>

              <NavLink
                to="/ai"
                className={navClass}
                onClick={closeSidebar}
              >
                <Sparkles size={18} />
                AI Assistant
              </NavLink>

              <NavLink
                to="/knowledge"
                className={navClass}
                onClick={closeSidebar}
              >
                <BookOpen size={18} />
                Knowledge Base
              </NavLink>

              <NavLink
                to="/notifications"
                className={navClass}
                onClick={closeSidebar}
              >
                <Bell size={18} />
                Notifications
              </NavLink>

              <NavLink
                to="/test-center"
                className={navClass}
                onClick={closeSidebar}
              >
                <FlaskConical size={18} />
                Test Center
              </NavLink>

              <NavLink
                to="/settings"
                className={navClass}
                onClick={closeSidebar}
              >
                <Settings size={18} />
                Account Settings
              </NavLink>

              <NavLink
                to="/audit-logs"
                className={navClass}
                onClick={closeSidebar}
              >
                <ClipboardList size={18} />
                Audit Log
              </NavLink>

              {user.role === "admin" && (
                <NavLink
                  to="/admin"
                  className={navClass}
                  onClick={closeSidebar}
                >
                  <Shield size={18} />
                  Admin Panel
                </NavLink>
              )}
            </nav>
          </div>

          <button
            onClick={handleLogout}
            className="mt-6 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-slate-300 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={18} />
            Logout
          </button>
        </aside>

        <main className="flex flex-1 justify-center p-4 md:p-6 lg:block lg:p-8">
          <div className="w-full max-w-md md:max-w-4xl lg:max-w-none">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;