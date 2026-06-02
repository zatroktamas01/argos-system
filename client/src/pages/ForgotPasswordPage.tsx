import { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (!email.trim()) return;

    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-3xl font-bold">
          Password Reminder
        </h1>

        <p className="mt-2 text-slate-400">
          Enter your email address and we will show a demo password reset message.
        </p>

        <div className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Email
            </label>

            <input
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
            />
          </div>

          {sent && (
            <p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-400">
              Demo reset message generated. In production, this would send a reset email.
            </p>
          )}

          <button
            onClick={handleSubmit}
            className="w-full rounded-lg bg-violet-600 px-6 py-3 font-medium hover:bg-violet-500"
          >
            Send Password Reminder
          </button>

          <Link
            to="/login"
            className="block text-center text-sm text-violet-400 hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;