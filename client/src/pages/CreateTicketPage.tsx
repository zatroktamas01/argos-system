import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function CreateTicketPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] =
    useState("Software");

  const [priority, setPriority] =
    useState("Medium");

  const [likelyCause, setLikelyCause] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleCreateTicket = async () => {
    if (!title.trim()) return;

    try {
      setLoading(true);

      const response = await api.post("/api/tickets", {
        title,
        category,
        priority,
        likelyCause,
      });

      navigate(
        `/tickets/${response.data.id}`
      );
    } catch (error) {
      console.error(
        "Failed to create ticket:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Create Ticket
        </h1>

        <p className="mt-2 text-slate-400">
          Create a new IT support incident
        </p>

      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

        <div className="space-y-6">

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-300">

              Ticket Title

            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Describe the issue..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
            />

          </div>

          <div className="grid gap-6 md:grid-cols-2">

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">

                Category

              </label>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
              >
                <option value="Software">
                  Software
                </option>

                <option value="Network">
                  Network
                </option>

                <option value="Hardware">
                  Hardware
                </option>

                <option value="Security">
                  Security
                </option>

              </select>

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">

                Priority

              </label>

              <select
                value={priority}
                onChange={(event) =>
                  setPriority(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
              >
                <option value="Low">
                  Low
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="High">
                  High
                </option>

                <option value="Critical">
                  Critical
                </option>

              </select>

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-300">

              Likely Cause

            </label>

            <textarea
              value={likelyCause}
              onChange={(event) =>
                setLikelyCause(
                  event.target.value
                )
              }
              placeholder="Potential root cause..."
              className="h-32 w-full rounded-lg border border-slate-700 bg-slate-950 p-4 text-white outline-none"
            />

          </div>

          <button
            onClick={handleCreateTicket}
            disabled={loading}
            className="rounded-lg bg-violet-600 px-6 py-3 font-medium hover:bg-violet-500 disabled:opacity-50"
          >
            {loading
              ? "Creating..."
              : "Create Ticket"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default CreateTicketPage;