import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import Badge from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

type AuditLog = {
  ticketId: string;
  title: string;
  type: string;
  message: string;
  createdAt: string;
};

function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get("/api/audit-logs");
        setLogs(response.data);
      } catch (error) {
        console.error(error);
        setError("Failed to load audit logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Audit Log</h1>

        <p className="mt-2 text-slate-400">
          Review ticket activity and system changes
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : logs.length === 0 ? (
          <EmptyState
            title="No Audit Logs Found"
            description="Ticket activity and system changes will appear here."
          />
        ) : (
          <div className="space-y-4">
            {logs.map((log, index) => (
              <div
                key={`${log.ticketId}-${index}`}
                className="rounded-lg border border-slate-800 bg-slate-950 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{log.message}</h2>

                    <p className="mt-1 text-sm text-slate-400">
                      {log.title}
                    </p>
                  </div>

                  <Badge text={log.type} variant="info" />
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
                  <span>{new Date(log.createdAt).toLocaleString()}</span>

                  <Link
                    to={`/tickets/${log.ticketId}`}
                    className="text-violet-400 hover:underline"
                  >
                    Open Ticket
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuditLogPage;