import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { socket } from "../socket";
import Badge from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";

type Notification = {
  type: "warning" | "critical" | "sla" | "info";
  title: string;
  message: string;
  ticketId: string;
  createdAt: string;
};

function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get(
          "/api/notifications"
        );

        setNotifications(response.data);
      } catch (error) {
        console.error(
          "Failed to load notifications:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    socket.on(
      "notification-created",
      (notification: Notification) => {
        setNotifications((current) => [
          notification,
          ...current,
        ]);
      }
    );

    return () => {
      socket.off("notification-created");
    };
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Notifications
        </h1>

        <p className="mt-2 text-slate-400">
          Live system alerts for SLA, assignments and critical incidents
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        {loading ? (
          <LoadingSpinner />
        ) : notifications.length === 0 ? (
          <p className="text-slate-400">
            No active notifications.
          </p>
        ) : (
          <div className="space-y-4">
            {notifications.map((item, index) => (
              <div
                key={`${item.ticketId}-${item.createdAt}-${index}`}
                className="rounded-xl border border-slate-800 bg-slate-950 p-5"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">
                      {item.title}
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      {item.message}
                    </p>
                  </div>

                  <Badge
                    text={item.type.toUpperCase()}
                    variant={
                      item.type === "critical"
                        ? "danger"
                        : item.type === "sla"
                          ? "warning"
                          : "info"
                    }
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
                  <span>
                    {new Date(item.createdAt).toLocaleString()}
                  </span>

                  <Link
                    to={`/tickets/${item.ticketId}`}
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

export default NotificationsPage;