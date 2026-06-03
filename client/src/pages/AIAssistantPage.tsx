import { useState } from "react";
import api from "../api/api";

function AIAssistantPage() {
  const [message, setMessage] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedTicketId, setSavedTicketId] = useState("");

  const handleAsk = async () => {
    if (!message) return;

    try {
      setLoading(true);
      setSavedTicketId("");

      const response = await api.post(
        "/api/chat",
        {
          message,
        }
      );

      const parsed = JSON.parse(response.data.reply);

      if (parsed.allowed === false) {
        alert(
          parsed.troubleshootingSteps?.[0] ||
          "Only IT support related requests are allowed."
        );

        return;
      }

      setAnalysis(parsed);

    } catch (error) {
      console.error(error);

    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!analysis) return;

    try {
      setSaving(true);

      const response = await api.post("/api/tickets", {
        title: analysis.title,
        category: analysis.category,
        priority: analysis.priority,
        likelyCause: analysis.likelyCause,
      });

      setSavedTicketId(response.data.id);
    } catch (error) {
      console.error("Failed to create ticket:", error);
    } finally {
      setSaving(false);
    }
  };

  const priorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-600";
      case "High":
        return "bg-orange-500";
      case "Medium":
        return "bg-yellow-500";
      default:
        return "bg-cyan-500";
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Assistant</h1>
        <p className="mt-2 text-slate-400">
          Ask AI to analyze support incidents
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe the IT issue..."
          className="h-40 w-full rounded-lg border border-slate-700 bg-slate-950 p-4 text-white outline-none"
        />

        <button
          onClick={handleAsk}
          disabled={loading}
          className="mt-4 rounded-lg bg-violet-600 px-6 py-3 font-medium hover:bg-violet-500 disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze Issue"}
        </button>
      </div>

      {analysis && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div>
              <h2 className="text-2xl font-bold">{analysis.title}</h2>
              <p className="mt-2 text-slate-400">{analysis.category}</p>
            </div>

            <span
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${priorityColor(
                analysis.priority
              )}`}
            >
              {analysis.priority}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCreateTicket}
              disabled={saving || !!savedTicketId}
              className="rounded-lg bg-emerald-600 px-6 py-3 font-medium hover:bg-emerald-500 disabled:opacity-50"
            >
              {saving
                ? "Creating Ticket..."
                : savedTicketId
                  ? "Ticket Created"
                  : "Create Ticket"}
            </button>

            {savedTicketId && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-400">
                Created: {savedTicketId}
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="mb-4 text-xl font-semibold">Likely Cause</h3>
              <p className="text-slate-300">{analysis.likelyCause}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="mb-4 text-xl font-semibold">
                Recommended Resolution
              </h3>
              <p className="text-slate-300">
                {analysis.recommendedResolution}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="mb-4 text-xl font-semibold">
              Troubleshooting Steps
            </h3>

            <div className="space-y-3">
              {analysis.troubleshootingSteps?.map(
                (step: string, index: number) => (
                  <div key={index} className="rounded-lg bg-slate-800 p-4">
                    {step}
                  </div>
                )
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="mb-4 text-xl font-semibold">Manual Test Cases</h3>

            <div className="space-y-3">
              {analysis.manualTestCases?.map((test: string, index: number) => (
                <div key={index} className="rounded-lg bg-slate-800 p-4">
                  {test}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIAssistantPage;