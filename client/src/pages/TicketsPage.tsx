import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/api";
import { socket } from "../socket";
import Badge from "../components/Badge";

type Ticket = {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  assignedTo: string;
  likelyCause: string;
  slaDueAt: string;
};

function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const fetchTickets = async () => {
    try {
      const response = await api.get("/api/tickets");
      setTickets(response.data);
    } catch (error) {
      console.error("Failed to load tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    socket.on("ticket-created", (ticket: Ticket) => {
      setTickets((current) => [ticket, ...current]);
    });

    socket.on("ticket-updated", (updatedTicket: Ticket) => {
      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === updatedTicket.id ? updatedTicket : ticket
        )
      );
    });

    socket.on("ticket-deleted", (ticketId: string) => {
      setTickets((current) =>
        current.filter((ticket) => ticket.id !== ticketId)
      );
    });

    return () => {
      socket.off("ticket-created");
      socket.off("ticket-updated");
      socket.off("ticket-deleted");
    };
  }, []);

  const getSlaLabel = (ticket: Ticket) => {
    if (ticket.status === "Resolved") {
      return "Resolved";
    }

    const now = new Date().getTime();
    const due = new Date(ticket.slaDueAt).getTime();
    const hoursLeft = (due - now) / (1000 * 60 * 60);

    if (hoursLeft < 0) return "Overdue";
    if (hoursLeft <= 2) return "Due Soon";

    return "On Track";
  };

  const filteredTickets = tickets.filter((ticket) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      (ticket.title || "").toLowerCase().includes(searchText) ||
      (ticket.id || "").toLowerCase().includes(searchText) ||
      (ticket.category || "").toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "All" || ticket.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Tickets</h1>

        <p className="mt-2 text-sm text-slate-400 sm:text-base">
          Manage and monitor support tickets
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tickets..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
        {loading ? (
          <p className="text-slate-400">Loading tickets...</p>
        ) : filteredTickets.length === 0 ? (
          <p className="text-slate-400">No tickets found.</p>
        ) : (
          <>
            <div className="space-y-4 md:hidden">
              {filteredTickets.map((ticket) => {
                const slaLabel = getSlaLabel(ticket);

                return (
                  <div
                    key={ticket.id}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="text-sm font-semibold text-violet-400 hover:underline"
                        >
                          {ticket.id}
                        </Link>

                        <h2 className="mt-1 text-base font-semibold text-white">
                          {ticket.title}
                        </h2>
                      </div>

                      <Badge text={ticket.status || "N/A"} variant="info" />
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Category</span>
                        <span className="text-right text-slate-300">
                          {ticket.category}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Priority</span>
                        <Badge
                          text={ticket.priority || "N/A"}
                          variant={
                            ticket.priority === "Critical" ||
                            ticket.priority === "High"
                              ? "danger"
                              : ticket.priority === "Medium"
                              ? "warning"
                              : "info"
                          }
                        />
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Assigned To</span>
                        <span className="text-right text-slate-300">
                          {ticket.assignedTo || "Unassigned"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">SLA</span>
                        <Badge
                          text={slaLabel}
                          variant={
                            slaLabel === "Overdue"
                              ? "danger"
                              : slaLabel === "Due Soon"
                              ? "warning"
                              : slaLabel === "Resolved"
                              ? "success"
                              : "info"
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] text-left">
                <thead className="border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="pb-4">Ticket ID</th>
                    <th className="pb-4">Title</th>
                    <th className="pb-4">Category</th>
                    <th className="pb-4">Priority</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Assigned To</th>
                    <th className="pb-4">SLA</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTickets.map((ticket) => {
                    const slaLabel = getSlaLabel(ticket);

                    return (
                      <tr
                        key={ticket.id}
                        className="border-b border-slate-800 hover:bg-slate-800/60"
                      >
                        <td className="py-4">
                          <Link
                            to={`/tickets/${ticket.id}`}
                            className="text-violet-400 hover:underline"
                          >
                            {ticket.id}
                          </Link>
                        </td>

                        <td>{ticket.title}</td>
                        <td>{ticket.category}</td>

                        <td>
                          <Badge
                            text={ticket.priority || "N/A"}
                            variant={
                              ticket.priority === "Critical" ||
                              ticket.priority === "High"
                                ? "danger"
                                : ticket.priority === "Medium"
                                ? "warning"
                                : "info"
                            }
                          />
                        </td>

                        <td>
                          <Badge
                            text={ticket.status || "N/A"}
                            variant={
                              ticket.status === "Resolved"
                                ? "success"
                                : ticket.status === "In Progress"
                                ? "warning"
                                : "info"
                            }
                          />
                        </td>

                        <td>
                          <span className="rounded bg-slate-700 px-3 py-1 text-sm text-slate-300">
                            {ticket.assignedTo || "Unassigned"}
                          </span>
                        </td>

                        <td>
                          <Badge
                            text={slaLabel}
                            variant={
                              slaLabel === "Overdue"
                                ? "danger"
                                : slaLabel === "Due Soon"
                                ? "warning"
                                : slaLabel === "Resolved"
                                ? "success"
                                : "info"
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TicketsPage;