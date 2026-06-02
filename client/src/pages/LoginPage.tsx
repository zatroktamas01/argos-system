import argosLogo from "../assets/argos-logo.svg";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

function LoginPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "register">(
    "login"
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("tamas@test.com");
  const [password, setPassword] = useState("123456");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async () => {
    try {
      setLoading(true);
      setError("");

      const endpoint =
        mode === "login"
          ? "/api/auth/login"
          : "/api/auth/register";

      const payload =
        mode === "login"
          ? { email, password }
          : { name, email, password };

      const response = await api.post(endpoint, payload);

      localStorage.setItem(
        "argos_token",
        response.data.token
      );

      localStorage.setItem(
        "argos_user",
        JSON.stringify(response.data.user)
      );

      navigate("/");
    } catch (error) {
      console.error(error);

      setError(
        mode === "login"
          ? "Invalid email or password"
          : "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <img
            src={argosLogo}
            alt="Argos Logo"
            className="mb-4 h-24 w-24 rounded-2xl"
          />

          <h1 className="text-4xl font-bold tracking-tight">
            ARGOS
          </h1>

          <p className="text-xl font-semibold tracking-[0.35em] text-violet-400">
            SYSTEM
          </p>

          <p className="mt-3 text-slate-400">
            AI-powered IT support workspace
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 rounded-lg bg-slate-950 p-1">
          <button
            onClick={() => setMode("login")}
            className={`rounded-md py-3 text-sm font-medium ${mode === "login"
                ? "bg-violet-600 text-white"
                : "text-slate-400"
              }`}
          >
            Log In
          </button>

          <button
            onClick={() => setMode("register")}
            className={`rounded-md py-3 text-sm font-medium ${mode === "register"
                ? "bg-violet-600 text-white"
                : "text-slate-400"
              }`}
          >
            Register
          </button>
        </div>

        <div className="mt-8 space-y-5">
          {mode === "register" && (
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Name
              </label>

              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Email
            </label>

            <input
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
            />
          </div>

          {mode === "login" && (
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-violet-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full rounded-lg bg-violet-600 px-6 py-3 font-medium hover:bg-violet-500 disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Log In"
                : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;