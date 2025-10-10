"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const contentGuidance =
  "Use Markdown or the quick actions to structure your post. Embed images and videos, style headings, and drop in fenced code blocks for technical deep dives.";

const statusLabels = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

const formatDate = (value) => {
  if (!value) return "Not published";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginFeedback, setLoginFeedback] = useState(null);
  const [formFeedback, setFormFeedback] = useState(null);
  const [postsError, setPostsError] = useState(null);
  const [postsLoading, setPostsLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("draft");
  const [activeTab, setActiveTab] = useState("edit");
  const [editingSlug, setEditingSlug] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  const textareaRef = useRef(null);

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setTags("");
    setStatus("draft");
    setActiveTab("edit");
    setEditingSlug(null);
    setFormFeedback(null);
  };

  const fetchPosts = useCallback(async () => {
    setPostsLoading(true);
    setPostsError(null);

    try {
      const response = await fetch(
        "/api/blog/posts?includeDrafts=1&includeArchived=1",
        { cache: "no-store", credentials: "include" }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 401) {
          setIsAuthenticated(false);
        }
        throw new Error(data.error || "Unable to load posts");
      }

      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      setPostsError(error.message);
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/blog/session", {
          cache: "no-store",
          credentials: "include",
        });
        if (response.ok) {
          setIsAuthenticated(true);
          await fetchPosts();
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [fetchPosts]);

  const applyFormatting = (before, after = "", placeholder = "") => {
    const textarea = textareaRef.current;
    const fallbackPlaceholder = placeholder || "text";

    if (!textarea) {
      setContent((prev) => `${prev}${before}${fallbackPlaceholder}${after}`);
      return;
    }

    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText =
      selectionStart !== selectionEnd
        ? value.slice(selectionStart, selectionEnd)
        : fallbackPlaceholder;

    const nextValue =
      value.slice(0, selectionStart) +
      before +
      selectedText +
      after +
      value.slice(selectionEnd);

    setContent(nextValue);

    const start = selectionStart + before.length;
    const end = start + selectedText.length;

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start, end);
    });
  };

  const insertTemplate = (template, placeholder) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      setContent((prev) => `${prev}${template}`);
      return;
    }

    const { selectionStart, selectionEnd, value } = textarea;
    const nextValue =
      value.slice(0, selectionStart) +
      template +
      value.slice(selectionEnd);

    setContent(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      if (placeholder) {
        const index = template.indexOf(placeholder);
        if (index >= 0) {
          const start = selectionStart + index;
          const end = start + placeholder.length;
          textarea.setSelectionRange(start, end);
          return;
        }
      }
      const cursor = selectionStart + template.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginSubmitting(true);
    setLoginFeedback(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      username: formData.get("username"),
      password: formData.get("password"),
    };

    try {
      const response = await fetch("/api/blog/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Unable to authenticate");
      }

      setIsAuthenticated(true);
      setFormFeedback({ type: "success", text: "Signed in successfully." });
      await fetchPosts();
    } catch (error) {
      setLoginFeedback({ type: "error", text: error.message });
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormFeedback(null);

    if (!content.trim()) {
      setFormFeedback({ type: "error", text: "Content cannot be empty." });
      setActiveTab("edit");
      setSubmitting(false);
      return;
    }

    const payload = {
      title,
      slug,
      excerpt,
      content,
      tags,
      status,
    };

    try {
      const endpoint = editingSlug
        ? `/api/blog/posts/${encodeURIComponent(editingSlug)}`
        : "/api/blog/posts";
      const method = editingSlug ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Unable to save the article");
      }

      const message = editingSlug
        ? "Article updated successfully."
        : status === "published"
        ? "Article published successfully."
        : "Draft saved successfully.";

      setFormFeedback({ type: "success", text: message });

      if (editingSlug) {
        const updated = data.post;
        setEditingSlug(updated.slug);
        setTitle(updated.title);
        setSlug(updated.slug);
        setExcerpt(updated.excerpt || "");
        setContent(updated.content || "");
        setTags(updated.tags?.join(", ") || "");
        setStatus(updated.status);
      } else {
        resetForm();
      }

      await fetchPosts();
    } catch (error) {
      setFormFeedback({ type: "error", text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (post) => {
    setEditingSlug(post.slug);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt || "");
    setContent(post.content || "");
    setTags(post.tags?.join(", ") || "");
    setStatus(post.status || "draft");
    setActiveTab("edit");
    setFormFeedback(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleArchive = async (post) => {
    try {
      const response = await fetch(`/api/blog/posts/${post.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "archived" }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Unable to archive the article");
      }

      await fetchPosts();
      setFormFeedback({ type: "success", text: `Archived “${post.title}”.` });
    } catch (error) {
      setFormFeedback({ type: "error", text: error.message });
    }
  };

  const handleRestore = async (post) => {
    try {
      const response = await fetch(`/api/blog/posts/${post.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "draft" }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Unable to restore the article");
      }

      await fetchPosts();
      setFormFeedback({
        type: "success",
        text: `Restored “${post.title}” to your drafts.`,
      });
    } catch (error) {
      setFormFeedback({ type: "error", text: error.message });
    }
  };

  const handleDelete = async (post) => {
    if (
      !window.confirm(
        `Delete “${post.title}”? This cannot be undone and will remove the post entirely.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/blog/posts/${post.slug}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Unable to delete the article");
      }

      if (editingSlug === post.slug) {
        resetForm();
      }

      await fetchPosts();
      setFormFeedback({
        type: "success",
        text: `Deleted “${post.title}”.`,
      });
    } catch (error) {
      setFormFeedback({ type: "error", text: error.message });
    }
  };

  if (loading) {
    return (
      <section className="container mx-auto py-24 text-center">
        <p className="text-muted-foreground">Loading dashboard…</p>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="container mx-auto py-24 max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Private Publishing Portal
        </h1>
        <p className="text-muted-foreground mb-6 text-center">
          Enter your credentials to manage the programming blog. This interface is hidden
          from public navigation and secured with a password only you know.
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              required
            />
          </div>
          {loginFeedback ? (
            <p
              className={`text-sm ${
                loginFeedback.type === "error" ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {loginFeedback.text}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loginSubmitting}
            className="w-full inline-flex justify-center items-center rounded-md bg-accent text-accent-foreground px-4 py-2 font-semibold hover:bg-accent-hover transition-colors disabled:opacity-60"
          >
            {loginSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="container mx-auto py-16">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {editingSlug ? "Edit article" : "Publish a new article"}
          </h1>
          <p className="text-muted-foreground">
            Craft deep technical stories with nested headings, formatted code snippets, and
            embedded media. Use the preview tab to check rendering before publishing or
            saving to drafts.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium">
                Slug (optional)
              </label>
              <input
                id="slug"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="auto-generated when left blank"
                className="w-full rounded-md border border-border bg-background px-3 py-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="excerpt" className="text-sm font-medium">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              rows={3}
              className="w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <label htmlFor="content" className="text-sm font-medium">
                  Content
                </label>
                <p className="text-xs text-muted-foreground">{contentGuidance}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyFormatting("**", "**", "bold text")}
                  className="text-xs font-semibold rounded-md border border-border px-2 py-1 hover:bg-muted"
                >
                  Bold
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting("_", "_", "italic text")}
                  className="text-xs font-semibold rounded-md border border-border px-2 py-1 hover:bg-muted"
                >
                  Italic
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting("`", "`", "inline code")}
                  className="text-xs font-semibold rounded-md border border-border px-2 py-1 hover:bg-muted"
                >
                  Code
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting("## ", "", "Section title")}
                  className="text-xs font-semibold rounded-md border border-border px-2 py-1 hover:bg-muted"
                >
                  Heading
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting("> ", "", "Pull quote")}
                  className="text-xs font-semibold rounded-md border border-border px-2 py-1 hover:bg-muted"
                >
                  Quote
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyFormatting("\n```language\n", "\n```\n", "// code snippet")
                  }
                  className="text-xs font-semibold rounded-md border border-border px-2 py-1 hover:bg-muted"
                >
                  Code block
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting("- ", "", "Bullet point")}
                  className="text-xs font-semibold rounded-md border border-border px-2 py-1 hover:bg-muted"
                >
                  Bullet list
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting("1. ", "", "Ordered item")}
                  className="text-xs font-semibold rounded-md border border-border px-2 py-1 hover:bg-muted"
                >
                  Numbered list
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate("[Link text](https://example.com)", "https://example.com")}
                  className="text-xs font-semibold rounded-md border border-border px-2 py-1 hover:bg-muted"
                >
                  Link
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertTemplate(
                      "\n![Alt text](https://images.unsplash.com/... \"Caption\")\n",
                      "https://images.unsplash.com/..."
                    )
                  }
                  className="text-xs font-semibold rounded-md border border-border px-2 py-1 hover:bg-muted"
                >
                  Image
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertTemplate(
                      "\n![Video](https://www.youtube.com/watch?v=... \"Video title\")\n",
                      "https://www.youtube.com/watch?v=..."
                    )
                  }
                  className="text-xs font-semibold rounded-md border border-border px-2 py-1 hover:bg-muted"
                >
                  Video
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-border">
              <div className="flex border-b border-border text-sm font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  className={`flex-1 px-4 py-2 ${
                    activeTab === "edit"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`flex-1 px-4 py-2 ${
                    activeTab === "preview"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Preview
                </button>
              </div>
              {activeTab === "edit" ? (
                <textarea
                  ref={textareaRef}
                  id="content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={16}
                  className="w-full rounded-b-lg bg-background px-4 py-3 focus:outline-none"
                  required
                />
              ) : (
                <div className="prose prose-invert max-w-none px-4 py-6">
                  {content ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Start writing in the editor to see a live preview.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="tags" className="text-sm font-medium">
                Tags (comma separated)
              </label>
              <input
                id="tags"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Visibility
              </label>
              <select
                id="status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2"
              >
                <option value="draft">Save as draft</option>
                <option value="published">Publish immediately</option>
                <option value="archived">Archive (hide from blog)</option>
              </select>
            </div>
          </div>

          {formFeedback ? (
            <p
              className={`text-sm ${
                formFeedback.type === "error"
                  ? "text-red-400"
                  : "text-emerald-400"
              }`}
            >
              {formFeedback.text}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center items-center rounded-md bg-accent text-accent-foreground px-6 py-3 font-semibold hover:bg-accent-hover transition-colors disabled:opacity-60"
            >
              {submitting ? "Saving…" : editingSlug ? "Update article" : "Save article"}
            </button>
            {editingSlug ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex justify-center items-center rounded-md border border-border px-6 py-3 font-semibold text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                Cancel editing
              </button>
            ) : null}
          </div>
        </form>

        <div className="mt-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Your articles</h2>
            <button
              type="button"
              onClick={fetchPosts}
              className="text-sm font-semibold text-accent hover:text-accent/80"
            >
              Refresh
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Review every post regardless of status. Edit to iterate, archive to hide from the
            public feed, or delete if you no longer need it.
          </p>

          {postsLoading ? (
            <p className="text-muted-foreground">Loading posts…</p>
          ) : postsError ? (
            <p className="text-red-400">{postsError}</p>
          ) : posts.length ? (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Last updated</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.slug} className="border-t border-border">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">{post.title}</div>
                        <div className="text-xs text-muted-foreground">/{post.slug}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            post.status === "published"
                              ? "bg-emerald-500/10 text-emerald-300"
                              : post.status === "archived"
                              ? "bg-amber-500/10 text-amber-300"
                              : "bg-slate-500/10 text-slate-200"
                          }`}
                        >
                          {statusLabels[post.status] || post.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(post.updatedAt || post.publishedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(post)}
                            className="text-xs font-semibold text-accent hover:text-accent/80"
                          >
                            Edit
                          </button>
                          {post.status === "archived" ? (
                            <button
                              type="button"
                              onClick={() => handleRestore(post)}
                              className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleArchive(post)}
                              className="text-xs font-semibold text-amber-300 hover:text-amber-200"
                            >
                              Archive
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(post)}
                            className="text-xs font-semibold text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground">You have not authored any posts yet.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminPage;
