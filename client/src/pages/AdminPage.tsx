import { useEffect, useState } from "react";
import api from "../api/api";
import Badge from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState("");
  const [deletingUserId, setDeletingUserId] = useState("");

  const currentUser = JSON.parse(
    localStorage.getItem("argos_user") || "{}"
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/api/admin/users");
        setUsers(response.data);
      } catch (error) {
        console.error(error);
        setError("You do not have permission to view this page.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (
    userId: string,
    currentRole: string
  ) => {
    const nextRole = currentRole === "admin" ? "agent" : "admin";

    try {
      setUpdatingUserId(userId);

      const response = await api.patch(
        `/api/admin/users/${userId}/role`,
        { role: nextRole }
      );

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === userId
            ? { ...user, role: response.data.role }
            : user
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update user role");
    } finally {
      setUpdatingUserId("");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) return;

    try {
      setDeletingUserId(userId);

      await api.delete(`/api/admin/users/${userId}`);

      setUsers((currentUsers) =>
        currentUsers.filter((user) => user._id !== userId)
      );
    } catch (error) {
      console.error(error);
      alert("Failed to delete user");
    } finally {
      setDeletingUserId("");
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get("/api/export/tickets/csv", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "argos-ticket-report.csv");

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      alert("Failed to export CSV");
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await api.get("/api/export/tickets/pdf", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "argos-ticket-report.pdf");

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      alert("Failed to export PDF");
    }
  };

  if (currentUser.role !== "admin") {
    return (
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>

        <p className="mt-4 text-red-400">
          Access denied. Admin role required.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>

        <p className="mt-2 text-slate-400">
          Manage users, access roles and permissions
        </p>

        <button
          onClick={handleExportCSV}
          className="mt-4 inline-flex items-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500"
        >
          Export CSV Report
        </button>

        <button
          onClick={handleExportPDF}
          className="ml-3 mt-4 inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
        >
          Export PDF Report
        </button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : users.length === 0 ? (
          <EmptyState
            title="No Users Found"
            description="There are currently no registered users."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="pb-4">Name</th>
                  <th className="pb-4">Email</th>
                  <th className="pb-4">Role</th>
                  <th className="pb-4">Created</th>
                  <th className="pb-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-slate-800"
                  >
                    <td className="py-4">{user.name}</td>

                    <td>{user.email}</td>

                    <td>
                      <Badge
                        text={user.role.toUpperCase()}
                        variant={
                          user.role === "admin"
                            ? "danger"
                            : "info"
                        }
                      />
                    </td>

                    <td>
                      {new Date(user.createdAt).toLocaleString()}
                    </td>

                    <td>
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            handleRoleChange(user._id, user.role)
                          }
                          disabled={
                            updatingUserId === user._id ||
                            user.email === currentUser.email
                          }
                          className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {updatingUserId === user._id
                            ? "Updating..."
                            : user.role === "admin"
                              ? "Make Agent"
                              : "Make Admin"}
                        </button>

                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={
                            deletingUserId === user._id ||
                            user.email === currentUser.email
                          }
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingUserId === user._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;