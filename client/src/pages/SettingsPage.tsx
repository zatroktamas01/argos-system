import { useState } from "react";
import api from "../api/api";

function SettingsPage() {
  const storedUser = JSON.parse(
    localStorage.getItem("argos_user") || "{}"
  );

  const [email, setEmail] = useState(
    storedUser.email || ""
  );

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [emailLoading, setEmailLoading] =
    useState(false);

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpdateEmail = async () => {
    try {
      setEmailLoading(true);
      setMessage("");
      setError("");

      const response = await api.patch(
        "/api/auth/update-email",
        {
          email,
        }
      );

      localStorage.setItem(
        "argos_token",
        response.data.token
      );

      localStorage.setItem(
        "argos_user",
        JSON.stringify(response.data.user)
      );

      setMessage("Email updated successfully.");
    } catch (error) {
      console.error(error);
      setError("Failed to update email.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      setPasswordLoading(true);
      setMessage("");
      setError("");

      await api.patch(
        "/api/auth/update-password",
        {
          currentPassword,
          newPassword,
        }
      );

      setCurrentPassword("");
      setNewPassword("");

      setMessage("Password updated successfully.");
    } catch (error) {
      console.error(error);
      setError(
        "Failed to update password. Check current password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Account Settings
        </h1>

        <p className="mt-2 text-slate-400">
          Manage your email, password and account profile
        </p>
      </div>

      {(message || error) && (
        <div
          className={`mb-6 rounded-xl border p-4 ${
            message
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {message || error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            Profile
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Your current account information
          </p>

          <div className="mt-6 space-y-4">
            <div className="rounded-lg bg-slate-800 p-4">
              <p className="text-sm text-slate-400">
                Name
              </p>

              <p className="mt-1 font-medium">
                {storedUser.name}
              </p>
            </div>

            <div className="rounded-lg bg-slate-800 p-4">
              <p className="text-sm text-slate-400">
                Role
              </p>

              <p className="mt-1 font-medium uppercase text-violet-400">
                {storedUser.role}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            Change Email
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Update your login email address
          </p>

          <div className="mt-6">
            <label className="mb-2 block text-sm text-slate-300">
              New Email
            </label>

            <input
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
            />

            <button
              onClick={handleUpdateEmail}
              disabled={emailLoading}
              className="mt-4 rounded-lg bg-violet-600 px-5 py-3 font-medium hover:bg-violet-500 disabled:opacity-50"
            >
              {emailLoading
                ? "Saving..."
                : "Change Email"}
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold">
            Change Password
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Update your account password securely
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Current Password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleUpdatePassword}
            disabled={passwordLoading}
            className="mt-4 rounded-lg bg-cyan-600 px-5 py-3 font-medium hover:bg-cyan-500 disabled:opacity-50"
          >
            {passwordLoading
              ? "Saving..."
              : "Change Password"}
          </button>
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;