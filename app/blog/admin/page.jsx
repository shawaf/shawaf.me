"use client";

import { useEffect, useState } from "react";

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginFeedback, setLoginFeedback] = useState(null);
  const [publishFeedback, setPublishFeedback] = useState(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/blog/session", { cache: "no-store" });
        if (response.ok) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

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
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Unable to authenticate");
      }

      setIsAuthenticated(true);
      setPublishFeedback({ type: "success", text: "Signed in successfully." });
    } catch (error) {
      setLoginFeedback({ type: "error", text: error.message });
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setPublishFeedback(null);

    const payload = {
      title,
      slug,
      excerpt,
      content,
      tags,
    };

    try {
      const response = await fetch("/api/blog/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Unable to publish the article");
      }

      setPublishFeedback({ type: "success", text: "Article published successfully." });
      setTitle("");
      setSlug("");
      setExcerpt("");
      setContent("");
      setTags("");
    } catch (error) {
      setPublishFeedback({ type: "error", text: error.message });
    } finally {
      setSubmitting(false);
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
        <h1 className="text-3xl font-bold mb-6 text-center">Private Publishing Portal</h1>
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
    <section className="container mx-auto py-16 max-w-2xl">
      <h1 className="text-4xl font-bold mb-4">Publish a new article</h1>
      <p className="text-muted-foreground mb-10">
        Share hands-on lessons about software engineering, architecture, and developer
        productivity. Fill in the fields below and publish when you are ready.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
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
        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={12}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
            required
          />
        </div>
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
        {publishFeedback ? (
          <p
            className={`text-sm ${
              publishFeedback.type === "error" ? "text-red-400" : "text-emerald-400"
            }`}
          >
            {publishFeedback.text}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex justify-center items-center rounded-md bg-accent text-accent-foreground px-6 py-3 font-semibold hover:bg-accent-hover transition-colors disabled:opacity-60"
        >
          {submitting ? "Publishing…" : "Publish article"}
        </button>
      </form>
    </section>
  );
};

export default AdminPage;
