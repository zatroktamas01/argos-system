import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
} from "react-router-dom";
import api from "../api/api";

type Comment = {
  id: number;
  text: string;
  author: string;
  createdAt: string;
};

type Activity = {
  id: number;
  type: string;
  message: string;
  createdAt: string;
};

type Ticket = {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  assignedTo: string;
  likelyCause: string;
  slaDueAt: string;
  comments: Comment[];
  activities: Activity[];

  attachments?: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
    uploadedAt: string;
  }[];
};

function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const currentUser = JSON.parse(
    localStorage.getItem("argos_user") || "{}"
  );

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [savingComment, setSavingComment] = useState(false);
  const [summary, setSummary] = useState("");
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [customerUpdate, setCustomerUpdate] = useState("");
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [uploadingFile, setUploadingFile] =
    useState(false);
  const [assignedTo, setAssignedTo] = useState("");
  const [generatingCustomerUpdate, setGeneratingCustomerUpdate] =
    useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await api.get(`/api/tickets/${id}`);

        setTicket(response.data);
        setAssignedTo(response.data.assignedTo || "");
      } catch (error) {
        console.error("Failed to load ticket:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  };

  const getSlaLabel = () => {
    if (!ticket) return "";

    if (ticket.status === "Resolved") return "Resolved";

    const now = new Date().getTime();
    const due = new Date(ticket.slaDueAt).getTime();
    const hoursLeft = (due - now) / (1000 * 60 * 60);

    if (hoursLeft < 0) return "Overdue";
    if (hoursLeft <= 2) return "Due Soon";

    return "On Track";
  };

  const getSlaClass = (label: string) => {
    switch (label) {
      case "Overdue":
        return "bg-red-500/20 text-red-400";
      case "Due Soon":
        return "bg-yellow-500/20 text-yellow-400";
      case "Resolved":
        return "bg-emerald-500/20 text-emerald-400";
      default:
        return "bg-cyan-500/20 text-cyan-400";
    }
  };

  const handleStatusChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (!ticket) return;

    try {
      setUpdating(true);

      const response = await api.patch(
        `/api/tickets/${ticket.id}/status`,
        {
          status: event.target.value,
        }
      );

      setTicket(response.data);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssign = async () => {
    if (!ticket) return;

    try {
      const response = await api.patch(
        `/api/tickets/${ticket.id}/assign`,
        {
          assignedTo,
        }
      );

      setTicket(response.data);
    } catch (error) {
      console.error("Failed to assign ticket:", error);
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticket) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this ticket?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/api/tickets/${ticket.id}`);

      navigate("/tickets");
    } catch (error) {
      console.error("Failed to delete ticket:", error);
      alert("Failed to delete ticket");
    }
  };

  const handleAddComment = async () => {
    if (!ticket || !commentText.trim()) return;

    try {
      setSavingComment(true);

      const response = await api.post(
        `/api/tickets/${ticket.id}/comments`,
        {
          text: commentText,
        }
      );

      setTicket(response.data.ticket);
      setCommentText("");
    } finally {
      setSavingComment(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!ticket) return;

    try {
      setGeneratingSummary(true);

      const response = await api.post(
        `/api/tickets/${ticket.id}/summary`
      );

      setSummary(response.data.summary);
      setTicket(response.data.ticket);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleGenerateCustomerUpdate = async () => {
    if (!ticket) return;

    try {
      setGeneratingCustomerUpdate(true);

      const response = await api.post(
        `/api/tickets/${ticket.id}/customer-update`
      );

      setCustomerUpdate(response.data.update);
      setTicket(response.data.ticket);
    } finally {
      setGeneratingCustomerUpdate(false);
    }
  };

  const handleUploadFile = async () => {

    if (!ticket || !selectedFile) return;

    try {

      setUploadingFile(true);

      const formData = new FormData();

      formData.append(
        "file",
        selectedFile
      );

      const response = await api.post(
        `/api/tickets/${ticket.id}/attachments`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setTicket((current) => {

        if (!current) return current;

        return {
          ...current,
          attachments: [
            ...(current.attachments || []),
            response.data.attachment,
          ],
        };

      });

      setSelectedFile(null);

      alert(
        "File uploaded successfully"
      );

    } catch (error) {

      console.error(
        "Upload failed:",
        error
      );

      alert(
        "Failed to upload file"
      );

    } finally {

      setUploadingFile(false);

    }

  };

  if (loading) {
    return <p className="text-slate-400">Loading ticket...</p>;
  }

  if (!ticket) {
    return <p className="text-red-400">Ticket not found.</p>;
  }

  const slaLabel = getSlaLabel();

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Ticket #{ticket.id}
          </h1>

          <p className="mt-2 text-slate-400">
            {ticket.title}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {currentUser.role === "admin" && (
            <button
              onClick={handleDeleteTicket}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
            >
              Delete Ticket
            </button>
          )}

          <span className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-400">
            {ticket.priority} Priority
          </span>
        </div>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Ticket Status
          </h2>

          <div className="flex items-center gap-4">
            <select
              value={ticket.status}
              onChange={handleStatusChange}
              disabled={updating}
              className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            {updating && (
              <span className="text-sm text-slate-400">
                Updating...
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Ticket Assignment
          </h2>

          <div className="flex flex-wrap items-center gap-4">
            <input
              value={assignedTo}
              onChange={(event) =>
                setAssignedTo(event.target.value)
              }
              placeholder="Assign to..."
              className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
            />

            <button
              onClick={handleAssign}
              className="rounded-lg bg-cyan-600 px-5 py-3 font-medium hover:bg-cyan-500"
            >
              Assign Ticket
            </button>
          </div>

          <p className="mt-4 text-sm text-slate-400">
            Current Assignee:{" "}
            <span className="text-white">
              {ticket.assignedTo || "Unassigned"}
            </span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            SLA Tracking
          </h2>

          <div className="space-y-4">
            <p className="text-slate-200">
              {new Date(ticket.slaDueAt).toLocaleString()}
            </p>

            <span
              className={`rounded px-3 py-1 text-sm ${getSlaClass(
                slaLabel
              )}`}
            >
              {slaLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Issue Description
          </h2>

          <p className="leading-7 text-slate-300">
            {ticket.title}
          </p>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            AI Analysis
          </h2>

          <div className="space-y-3 text-slate-300">
            <p>Category: {ticket.category}</p>
            <p>Priority: {ticket.priority}</p>
            <p>Likely Cause: {ticket.likelyCause}</p>
            <p>Status: {ticket.status}</p>
            <p>
              Assigned To:{" "}
              {ticket.assignedTo || "Unassigned"}
            </p>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-6 text-xl font-semibold">
          Comments
        </h2>

        <textarea
          value={commentText}
          onChange={(event) =>
            setCommentText(event.target.value)
          }
          placeholder="Write an internal support note..."
          className="h-28 w-full rounded-lg border border-slate-700 bg-slate-950 p-4 text-white outline-none"
        />

        <button
          onClick={handleAddComment}
          disabled={savingComment}
          className="mt-3 rounded-lg bg-violet-600 px-5 py-3 font-medium hover:bg-violet-500 disabled:opacity-50"
        >
          {savingComment ? "Saving..." : "Add Comment"}
        </button>

        <div className="mt-6 space-y-4">
          {ticket.comments?.length ? (
            ticket.comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-lg border border-slate-700 bg-slate-800 p-4"
              >
                <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
                  <span>{comment.author}</span>
                  <span>
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-slate-200">
                  {comment.text}
                </p>
              </div>
            ))
          ) : (
            <p className="text-slate-400">No comments yet.</p>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            AI Incident Summary
          </h2>

          <div className="flex gap-3">
            <button
              onClick={handleGenerateSummary}
              disabled={generatingSummary}
              className="rounded-lg bg-cyan-600 px-5 py-3 font-medium hover:bg-cyan-500 disabled:opacity-50"
            >
              {generatingSummary
                ? "Generating..."
                : "Generate AI Summary"}
            </button>

            {summary && (
              <button
                onClick={() => handleCopy(summary)}
                className="rounded-lg bg-slate-700 px-5 py-3 font-medium hover:bg-slate-600"
              >
                Copy Summary
              </button>
            )}
          </div>
        </div>

        {summary ? (
          <div className="whitespace-pre-wrap rounded-lg border border-slate-700 bg-slate-800 p-6 leading-7 text-slate-200">
            {summary}
          </div>
        ) : (
          <p className="text-slate-400">
            No AI summary generated yet.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            AI Customer Update
          </h2>

          <div className="flex gap-3">
            <button
              onClick={handleGenerateCustomerUpdate}
              disabled={generatingCustomerUpdate}
              className="rounded-lg bg-emerald-600 px-5 py-3 font-medium hover:bg-emerald-500 disabled:opacity-50"
            >
              {generatingCustomerUpdate
                ? "Generating..."
                : "Generate Customer Update"}
            </button>

            {customerUpdate && (
              <button
                onClick={() => handleCopy(customerUpdate)}
                className="rounded-lg bg-slate-700 px-5 py-3 font-medium hover:bg-slate-600"
              >
                Copy Update
              </button>
            )}
          </div>
        </div>

        {customerUpdate ? (
          <div className="whitespace-pre-wrap rounded-lg border border-slate-700 bg-slate-800 p-6 leading-7 text-slate-200">
            {customerUpdate}
          </div>
        ) : (
          <p className="text-slate-400">
            No customer update generated yet.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">

        <h2 className="mb-6 text-xl font-semibold">
          Attachments
        </h2>

        <div className="flex flex-wrap items-center gap-4">

          <input
            type="file"
            onChange={(event) =>
              setSelectedFile(
                event.target.files?.[0] || null
              )
            }
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white"
          />

          <button
            onClick={handleUploadFile}
            disabled={
              !selectedFile || uploadingFile
            }
            className="rounded-lg bg-violet-600 px-5 py-3 font-medium hover:bg-violet-500 disabled:opacity-50"
          >
            {uploadingFile
              ? "Uploading..."
              : "Upload File"}
          </button>

        </div>

        <div className="mt-6 space-y-4">

          {ticket.attachments?.length ? (

            ticket.attachments.map(
              (attachment, index) => (

                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-4"
                >

                  <div>
                    <p className="font-medium text-slate-200">
                      {attachment.originalName}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {new Date(
                        attachment.uploadedAt
                      ).toLocaleString()}
                    </p>
                  </div>

                  <a
                    href={`http://localhost:5000${attachment.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
                  >
                    Open
                  </a>

                </div>

              )
            )

          ) : (

            <p className="text-slate-400">
              No attachments uploaded yet.
            </p>

          )}

        </div>

      </section>

      <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-6 text-xl font-semibold">
          Activity Timeline
        </h2>

        <div className="space-y-4">
          {ticket.activities?.length ? (
            [...ticket.activities].reverse().map((activity) => (
              <div
                key={activity.id}
                className="rounded-lg border border-slate-700 bg-slate-800 p-4"
              >
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>{activity.message}</span>
                  <span>
                    {new Date(activity.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400">No activity yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default TicketDetailsPage;