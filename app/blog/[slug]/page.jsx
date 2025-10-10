import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/blog";

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) {
    return {};
  }

  return {
    title: `${post.title} | Mohamed Elshawaf`,
    description: post.excerpt,
  };
}

const BlogPostPage = async ({ params }) => {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const paragraphs = post.content.split(/\n{2,}/).map((paragraph) => paragraph.trim());

  return (
    <section className="container mx-auto py-16 max-w-3xl">
      <Link href="/blog" className="text-sm text-muted-foreground hover:text-accent transition-colors">
        ← Back to all articles
      </Link>
      <article className="mt-10">
        <p className="text-accent font-semibold uppercase tracking-wide mb-2">
          {formatDate(post.publishedAt)}
        </p>
        <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
        {post.tags?.length ? (
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-8">
            {post.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-muted rounded-full border border-border">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
        <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </section>
  );
};

export default BlogPostPage;
