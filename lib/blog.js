import fs from "fs/promises";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const postsFile = path.join(dataDir, "posts.json");

const slugify = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

async function ensureDataFile() {
  try {
    await fs.access(postsFile);
  } catch (error) {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(postsFile, "[]", "utf8");
  }
}

export async function getBlogPosts() {
  await ensureDataFile();
  const raw = await fs.readFile(postsFile, "utf8");
  const posts = JSON.parse(raw);
  return posts
    .map((post) => ({
      ...post,
      publishedAt: post.publishedAt,
    }))
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

export async function getBlogPostBySlug(slug) {
  const posts = await getBlogPosts();
  return posts.find((post) => post.slug === slug);
}

export async function addBlogPost({
  title,
  slug,
  excerpt,
  content,
  tags = [],
}) {
  if (!title || !content) {
    throw new Error("Title and content are required");
  }

  const normalisedSlug = slug ? slugify(slug) : slugify(title);
  if (!normalisedSlug) {
    throw new Error("Unable to generate a slug for this post");
  }

  const posts = await getBlogPosts();
  if (posts.some((post) => post.slug === normalisedSlug)) {
    throw new Error("A post with this slug already exists");
  }

  const trimmedExcerpt = excerpt?.trim() || content.slice(0, 240).trim();
  const postTags = Array.isArray(tags)
    ? tags
    : String(tags)
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

  const newPost = {
    title: title.trim(),
    slug: normalisedSlug,
    excerpt: trimmedExcerpt,
    content: content.trim(),
    tags: postTags,
    publishedAt: new Date().toISOString(),
  };

  const updatedPosts = [newPost, ...posts];
  await fs.writeFile(postsFile, JSON.stringify(updatedPosts, null, 2));

  return newPost;
}
