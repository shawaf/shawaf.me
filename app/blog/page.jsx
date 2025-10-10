import Link from "next/link";
import { getBlogPosts } from "@/lib/blog";

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

const BlogPage = async () => {
  const posts = await getBlogPosts();

  return (
    <section className="container mx-auto py-16">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="h1 mb-6">Thoughts on Building Reliable Software</h1>
        <p className="text-muted-foreground">
          Curated essays about shipping resilient products, leading high-performing teams,
          and exploring modern web technologies. New articles are added through a private
          publishing workflow so every post is intentional and hands-on.
        </p>
      </div>
      {posts.length ? (
        <div className="grid gap-10 md:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="border border-border rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              <span className="text-sm uppercase tracking-wide text-accent font-semibold mb-2">
                {formatDate(post.publishedAt, post.updatedAt)}
              </span>
              <h2 className="text-2xl font-bold mb-3 text-left">
                <Link href={`/blog/${post.slug}`} className="hover:text-accent transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="text-muted-foreground mb-6 flex-1 text-left">{post.excerpt}</p>
              {post.tags?.length ? (
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-muted text-foreground rounded-full border border-border"
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
        <p className="text-muted-foreground text-center">
          No articles have been published yet. Sign in to the private dashboard to share your
          latest engineering lessons.
        </p>
      )}
    </section>
  );
};

export default BlogPage;
