import { useEffect, useState, useCallback } from "react";
import api from "../api/api";
import Badge from "../components/Badge";
import EmptyState from "../components/EmptyState";

type Article = {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
};

function KnowledgeBasePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

 const fetchArticles = useCallback(async () => {
  try {
    const response = await api.get("/api/knowledge", {
      params: { search },
    });

    setArticles(Array.isArray(response.data) ? response.data : []);
  } catch {
    setError("Failed to load knowledge articles.");
  }
}, [search]);

  const createArticle = async () => {
    try {
      setError("");

      await api.post("/api/knowledge", {
        title,
        category,
        content,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });

      setTitle("");
      setCategory("General");
      setTags("");
      setContent("");

      fetchArticles();
    } catch {
      setError("Failed to create article. Admin access required.");
    }
  };

  const handleDelete = async (articleId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this article?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/api/knowledge/${articleId}`);

      setArticles((currentArticles) =>
        currentArticles.filter(
          (article) => article._id !== articleId
        )
      );
    } catch {
      setError("Failed to delete article. Admin access required.");
    }
  };

useEffect(() => {
  fetchArticles();
}, [fetchArticles]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Knowledge Base</h1>

      <p className="mt-2 text-slate-400">
        Troubleshooting docs, internal wiki and support articles.
      </p>

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-xl font-semibold">Create Article</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
          />

          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
          />

          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags separated by comma"
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white md:col-span-2"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Troubleshooting steps..."
            rows={5}
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white md:col-span-2"
          />

          <button
            onClick={createArticle}
            className="w-fit rounded-lg bg-violet-600 px-5 py-3 font-medium text-white hover:bg-violet-500 md:col-span-2"
          >
            Create Article
          </button>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles..."
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
        />

        <button
          onClick={fetchArticles}
          className="rounded-lg bg-violet-600 px-5 py-3 font-medium text-white hover:bg-violet-500"
        >
          Search
        </button>
      </div>

      <div className="mt-8 grid gap-4">
        {articles.length === 0 ? (
          <EmptyState
            title="No Articles Found"
            description="Create your first knowledge base article or adjust the search filters."
          />
        ) : (
          articles.map((article) => (
            <div
              key={article._id}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {article.title}
                  </h2>

                  <div className="mt-2">
                    <Badge
                      text={article.category}
                      variant="info"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(article._id)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
                >
                  Delete
                </button>
              </div>

              <p className="text-slate-300">{article.content}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {article.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default KnowledgeBasePage;