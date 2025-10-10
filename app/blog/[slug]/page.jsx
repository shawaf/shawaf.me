/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
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

const MarkdownComponents = {
  h2: ({ children, ...props }) => (
    <h2
      className="text-3xl font-semibold mt-12 mb-4 first:mt-0 text-foreground"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="text-2xl font-semibold mt-10 mb-3 text-foreground"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4
      className="text-xl font-semibold mt-8 mb-2 text-foreground"
      {...props}
    >
      {children}
    </h4>
  ),
  p: ({ children, ...props }) => (
    <p className="text-lg leading-relaxed text-muted-foreground" {...props}>
      {children}
    </p>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-foreground" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic text-foreground/80" {...props}>
      {children}
    </em>
  ),
  ul: ({ children, ...props }) => (
    <ul className="list-disc list-outside pl-6 space-y-2" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal list-outside pl-6 space-y-2" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="text-lg leading-relaxed text-muted-foreground" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-4 border-accent pl-4 italic text-muted-foreground"
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ inline, className, children, ...props }) => {
    if (inline) {
      return (
        <code
          className="rounded bg-muted px-2 py-0.5 text-sm text-foreground"
          {...props}
        >
          {children}
        </code>
      );
    }

    const language = className?.replace("language-", "") || "";

    return (
      <pre className="rounded-lg bg-muted p-4 overflow-x-auto text-sm">
        <code className={language ? `language-${language}` : undefined} {...props}>
          {children}
        </code>
      </pre>
    );
  },
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th className="bg-muted px-3 py-2 text-sm font-semibold" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="px-3 py-2 text-sm text-muted-foreground" {...props}>
      {children}
    </td>
  ),
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent underline-offset-4 hover:underline"
      {...props}
    >
      {children}
    </a>
  ),
  img: ({ src = "", alt = "", title, ...props }) => {
    const isVideoEmbed = /youtube\.com|youtu\.be|vimeo\.com/.test(src);
    const isVideoFile = /\.(mp4|webm|ogg)$/i.test(src);

    if (isVideoEmbed) {
      const embedSrc = src.includes("embed")
        ? src
        : src.replace("watch?v=", "embed/");

      return (
        <div className="relative w-full overflow-hidden rounded-lg border border-border">
          <div className="aspect-video">
            <iframe
              src={embedSrc}
              title={alt || title || "Embedded video"}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {(title || alt) && (
            <p className="bg-muted px-4 py-2 text-sm text-muted-foreground">
              {title || alt}
            </p>
          )}
        </div>
      );
    }

    if (isVideoFile) {
      return (
        <figure className="space-y-2">
          <video
            src={src}
            controls
            className="w-full rounded-lg border border-border"
          />
          {(title || alt) && (
            <figcaption className="text-sm text-muted-foreground">
              {title || alt}
            </figcaption>
          )}
        </figure>
      );
    }

    return (
      <figure className="space-y-2">
        <img
          src={src}
          alt={alt}
          className="w-full rounded-lg border border-border"
          {...props}
        />
        {title && (
          <figcaption className="text-sm text-muted-foreground">{title}</figcaption>
        )}
      </figure>
    );
  },
};

const BlogPostPage = async ({ params }) => {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

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
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={MarkdownComponents}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </section>
  );
};

export default BlogPostPage;
