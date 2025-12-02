import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { getMediumPostBySlug } from "@/lib/medium";

export const dynamic = "force-dynamic";

const formatDate = (date) => {
  if (!date) return "Unpublished";

  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export async function generateMetadata({ params }) {
  const post = await getMediumPostBySlug(params.slug);

  if (!post) {
    return {};
  }

  return {
    title: `${post.title} | Mohamed Elshawaf`,
    description: post.excerpt,
  };
}

const MediumPostPage = async ({ params }) => {
  const post = await getMediumPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <section className="container mx-auto max-w-3xl py-16">
      <Link
        href="/blog"
        className="text-sm text-muted-foreground transition-colors hover:text-accent"
      >
        ← Back to all articles
      </Link>

      <article className="mt-8 space-y-8">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span className="rounded-full border border-border/70 bg-muted/70 px-3 py-1 text-foreground/80">
              Medium
            </span>
            <span className="rounded-full bg-muted/60 px-3 py-1 text-foreground/80">
              {formatDate(post.publishedAt)}
            </span>
          </div>
          <h1 className="text-4xl font-bold leading-tight text-foreground">{post.title}</h1>
          {post.excerpt ? (
            <p className="text-lg text-muted-foreground">{post.excerpt}</p>
          ) : null}
        </div>

        {post.categories?.length ? (
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {post.categories.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border/70 bg-muted/60 px-3 py-1 text-foreground/80"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        <div
          className="space-y-6 text-base leading-relaxed text-muted-foreground [&_a]:text-accent [&_a:hover]:underline [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl [&_h1]:font-bold [&_h2]:font-semibold [&_h3]:font-semibold [&_img]:rounded-xl [&_img]:border [&_img]:border-border"
          dangerouslySetInnerHTML={{
            __html: post.content || "<p>This article is loading from Medium. Please try again.</p>",
          }}
        />

        <div className="flex flex-wrap gap-3">
          <Link
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/60 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-accent/60 hover:text-accent"
          >
            Read on Medium
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </section>
  );
};

export default MediumPostPage;
