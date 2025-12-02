import Link from "next/link";
import { ArrowUpRight, Rss } from "lucide-react";

import { getBlogPosts } from "@/lib/blog";
import { getMediumPosts } from "@/lib/medium";

export const metadata = {
  title: "Blog | Mohamed Elshawaf",
  description:
    "Technical deep dives, architecture lessons, and engineering leadership insights by Mohamed Elshawaf.",
};

const formatDate = (date, fallback) => {
  const value = date || fallback;
  if (!value) {
    return "Unpublished";
  }

  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const MediumBadge = () => (
  <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
    <Rss className="h-3.5 w-3.5 text-accent" />
    Medium Feed
  </span>
);

const BlogPage = async () => {
  const [posts, mediumPosts] = await Promise.all([getBlogPosts(), getMediumPosts(9)]);

  return (
    <section className="container mx-auto py-16">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 px-6 py-12 shadow-xl shadow-accent/10 backdrop-blur-xl xl:px-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(0,255,153,0.14),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.12),transparent_30%),radial-gradient(circle_at_50%_85%,rgba(255,255,255,0.05),transparent_25%)]" />

        <div className="relative space-y-8">
          <div className="space-y-3 text-center">
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-2 text-sm font-medium text-muted-foreground shadow-inner">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Architecture notes, delivery lessons, and career signals
            </div>
            <h1 className="text-balance text-4xl font-semibold leading-tight xl:text-5xl">
              A developer-first journal of shipped work
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
              Everything I publish here mirrors the way I work: pragmatic, traceable, and ready for production. Articles are pulled
              directly from my Medium feed so you can read them here without leaving the portfolio.
            </p>
          </div>

          {mediumPosts.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {mediumPosts.map((post) => (
                <article
                  key={post.link}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-background/70 p-6 text-left shadow-md transition hover:-translate-y-1 hover:border-accent/60 hover:shadow-accent/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                  <div className="relative mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <MediumBadge />
                    <span className="rounded-full bg-muted/70 px-2 py-1">{formatDate(post.publishedAt)}</span>
                  </div>
                  <h2 className="relative text-xl font-semibold leading-tight text-foreground transition group-hover:text-accent">
                    <Link href={post.link} target="_blank" className="inline-flex items-start gap-2">
                      <span className="flex-1">{post.title}</span>
                      <ArrowUpRight className="mt-1 h-4 w-4" />
                    </Link>
                  </h2>
                  <p className="relative mt-3 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
                  {post.categories?.length ? (
                    <div className="relative mt-4 flex flex-wrap gap-2 text-xs">
                      {post.categories.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-border/60 bg-muted/60 px-2 py-1 text-foreground/80"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Articles will appear here as soon as Medium publishes the feed.
            </p>
          )}

          {posts.length ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Local drafts</p>
                  <p className="text-lg text-muted-foreground">
                    Private essays and drafts stored inside this site, ready to be promoted.
                  </p>
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {posts.map((post) => (
                  <article
                    key={post.slug}
                    className="flex h-full flex-col rounded-2xl border border-border/70 bg-card/70 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-accent/60"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                      {formatDate(post.publishedAt, post.updatedAt)}
                    </span>
                    <h3 className="mt-3 text-xl font-semibold">
                      <Link href={`/blog/${post.slug}`} className="hover:text-accent">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-2 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
                    {post.tags?.length ? (
                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-border/60 bg-muted/60 px-2 py-1 text-foreground/80"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default BlogPage;
