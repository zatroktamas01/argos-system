import {
  useEffect,
  useState,
} from "react";

import api from "../api/api";

import { socket } from "../socket";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Stats = {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  highPriorityTickets: number;
};

function DashboardPage() {

  const [stats, setStats] =
    useState<Stats | null>(null);

  const [loading, setLoading] =
    useState(true);

  const fetchStats = async () => {

    try {

      const response =
        await api.get("/api/stats");

      setStats(response.data);

    } catch (error) {

      console.error(
        "Failed to load stats:",
        error
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchStats();

  }, []);

  useEffect(() => {

    socket.on(
      "dashboard-refresh",
      () => {

        fetchStats();

      }
    );

    return () => {

      socket.off(
        "dashboard-refresh"
      );

    };

  }, []);

  if (loading) {

    return (
      <p className="text-slate-400">
        Loading dashboard...
      </p>
    );

  }

  const priorityData = [
    {
      name: "High/Critical",
      value:
        stats?.highPriorityTickets || 0,
    },
    {
      name: "Other",
      value:
        (stats?.totalTickets || 0) -
        (stats?.highPriorityTickets || 0),
    },
  ];

  const barData = [
    {
      name: "Open",
      tickets:
        stats?.openTickets || 0,
    },
    {
      name: "In Progress",
      tickets:
        stats?.inProgressTickets || 0,
    },
    {
      name: "Resolved",
      tickets:
        stats?.resolvedTickets || 0,
    },
    {
      name: "High Priority",
      tickets:
        stats?.highPriorityTickets || 0,
    },
  ];

  const colors = [
    "#38bdf8",
    "#8b5cf6",
    "#34d399",
    "#f87171",
  ];

  return (

    <div>

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="mt-2 text-slate-400">
          AI-powered IT support analytics overview
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

          <p className="text-sm text-slate-400">
            Total Tickets
          </p>

          <h2 className="mt-4 text-4xl font-bold">
            {stats?.totalTickets}
          </h2>

        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

          <p className="text-sm text-slate-400">
            Open Tickets
          </p>

          <h2 className="mt-4 text-4xl font-bold text-cyan-400">
            {stats?.openTickets}
          </h2>

        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

          <p className="text-sm text-slate-400">
            In Progress
          </p>

          <h2 className="mt-4 text-4xl font-bold text-violet-400">
            {stats?.inProgressTickets}
          </h2>

        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

          <p className="text-sm text-slate-400">
            Resolved
          </p>

          <h2 className="mt-4 text-4xl font-bold text-emerald-400">
            {stats?.resolvedTickets}
          </h2>

        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

          <p className="text-sm text-slate-400">
            High Priority
          </p>

          <h2 className="mt-4 text-4xl font-bold text-red-400">
            {stats?.highPriorityTickets}
          </h2>

        </div>

      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">

          <h3 className="mb-4 text-xl font-semibold">
            Ticket Status Overview
          </h3>

          <div className="h-72">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart data={barData}>

                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                />

                <YAxis
                  stroke="#94a3b8"
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor:
                      "#0f172a",
                    border:
                      "1px solid #334155",
                    color: "#fff",
                  }}
                />

                <Bar
                  dataKey="tickets"
                  fill="#8b5cf6"
                  radius={[8, 8, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">

          <h3 className="mb-4 text-xl font-semibold">
            Priority Distribution
          </h3>

          <div className="h-72">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={priorityData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >

                  {priorityData.map(
                    (_, index) => (

                      <Cell
                        key={index}
                        fill={
                          colors[
                            index %
                              colors.length
                          ]
                        }
                      />

                    )
                  )}

                </Pie>

                <Tooltip
                  contentStyle={{
                    backgroundColor:
                      "#0f172a",
                    border:
                      "1px solid #334155",
                    color: "#fff",
                  }}
                />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </section>

      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">

          <h3 className="mb-4 text-xl font-semibold">
            Recent Activity
          </h3>

          <div className="space-y-4">

            <div className="rounded-lg bg-slate-800 p-4">
              AI-generated tickets are now tracked
            </div>

            <div className="rounded-lg bg-slate-800 p-4">
              Dynamic ticket routing enabled
            </div>

            <div className="rounded-lg bg-slate-800 p-4">
              Backend statistics API connected
            </div>

          </div>

        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">

          <h3 className="mb-4 text-xl font-semibold">
            AI Recommendations
          </h3>

          <div className="space-y-4">

            <div className="rounded-lg bg-slate-800 p-4">
              Review high priority incidents
            </div>

            <div className="rounded-lg bg-slate-800 p-4">
              Monitor repeated VPN related issues
            </div>

            <div className="rounded-lg bg-slate-800 p-4">
              AI confidence trending stable
            </div>

          </div>

        </section>

      </div>

    </div>

  );
}

export default DashboardPage;