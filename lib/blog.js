import fs from "fs/promises";
import path from "path";

const storageDir = process.env.BLOG_DATA_DIR
  ? path.resolve(process.env.BLOG_DATA_DIR)
  : path.join(process.cwd(), "data");
const postsFile = path.join(storageDir, "posts.json");
const seedPostsUrl = new URL("../data/posts.json", import.meta.url);
let cachedSeedPosts = null;

const slugify = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const normaliseTags = (tags = []) => {
  if (Array.isArray(tags)) {
    return tags.map((tag) => tag.trim()).filter(Boolean);
  }

  return String(tags)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const normaliseStatus = (status) => {
  if (typeof status !== "string") {
    return undefined;
  }

  const value = status.toLowerCase();
  if (["draft", "published", "archived"].includes(value)) {
    return value;
  }

  return undefined;
};

const writableErrorCodes = new Set(["EACCES", "EROFS", "EPERM", "ENOENT"]);

async function loadSeedPosts() {
  if (!cachedSeedPosts) {
    try {
      const raw = await fs.readFile(seedPostsUrl, "utf8");
      const parsed = JSON.parse(raw);
      cachedSeedPosts = Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      cachedSeedPosts = [];
    }
  }
  return cachedSeedPosts;
}

async function ensureDataFile() {
  try {
    await fs.access(postsFile);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      try {
        await fs.mkdir(path.dirname(postsFile), { recursive: true });
        const seed = await loadSeedPosts();
        await fs.writeFile(postsFile, JSON.stringify(seed, null, 2));
        return true;
      } catch (writeError) {
        if (writableErrorCodes.has(writeError.code)) {
          return false;
        }
        throw writeError;
      }
    }

    if (writableErrorCodes.has(error.code)) {
      return false;
    }

    throw error;
  }
}

async function readPosts() {
  const hasWritableFile = await ensureDataFile();

  if (!hasWritableFile) {
    const seed = await loadSeedPosts();
    return seed.slice();
  }

  try {
    const raw = await fs.readFile(postsFile, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") {
      const seed = await loadSeedPosts();
      return seed.slice();
    }

    throw error;
  }
}

async function writePosts(posts) {
  try {
    await fs.mkdir(path.dirname(postsFile), { recursive: true });
    await fs.writeFile(postsFile, JSON.stringify(posts, null, 2));
  } catch (error) {
    if (writableErrorCodes.has(error.code)) {
      throw new Error(
        "Blog storage is read-only. Set BLOG_DATA_DIR to a writable location or configure external storage."
      );
    }

    throw error;
  }
}

const sortByPublishedDate = (a, b) => {
  const dateA = new Date(a.publishedAt || a.updatedAt || a.createdAt || 0).getTime();
  const dateB = new Date(b.publishedAt || b.updatedAt || b.createdAt || 0).getTime();
  return dateB - dateA;
};

const withDefaults = (post) => ({
  ...post,
  status: post.status || "published",
  tags: normaliseTags(post.tags),
  createdAt: post.createdAt || post.publishedAt || new Date().toISOString(),
  updatedAt: post.updatedAt || post.publishedAt || new Date().toISOString(),
  publishedAt:
    post.status === "draft"
      ? null
      : post.publishedAt || post.updatedAt || post.createdAt || null,
});

export async function getBlogPosts({
  includeDrafts = false,
  includeArchived = false,
} = {}) {
  const posts = await readPosts();

  return posts
    .map(withDefaults)
    .filter((post) => {
      if (post.status === "draft" && !includeDrafts) {
        return false;
      }

      if (post.status === "archived" && !includeArchived) {
        return false;
      }

      return true;
    })
    .sort(sortByPublishedDate);
}

export async function getBlogPostBySlug(
  slug,
  { includeDrafts = false, includeArchived = false } = {}
) {
  const posts = await getBlogPosts({ includeDrafts, includeArchived });
  return posts.find((post) => post.slug === slug);
}

export async function addBlogPost({
  title,
  slug,
  excerpt,
  content,
  tags = [],
  status,
}) {
  if (!title || !content) {
    throw new Error("Title and content are required");
  }

  const posts = await readPosts();

  const normalisedSlug = slug ? slugify(slug) : slugify(title);
  if (!normalisedSlug) {
    throw new Error("Unable to generate a slug for this post");
  }

  if (posts.some((post) => post.slug === normalisedSlug)) {
    throw new Error("A post with this slug already exists");
  }

  const trimmedContent = content.trim();
  const trimmedExcerpt = excerpt?.trim() || trimmedContent.slice(0, 240).trim();
  const postTags = normaliseTags(tags);
  const now = new Date().toISOString();
  const normalisedStatus = normaliseStatus(status) || "draft";

  const newPost = {
    title: title.trim(),
    slug: normalisedSlug,
    excerpt: trimmedExcerpt,
    content: trimmedContent,
    tags: postTags,
    status: normalisedStatus,
    createdAt: now,
    updatedAt: now,
    publishedAt: normalisedStatus === "published" ? now : null,
  };

  const updatedPosts = [newPost, ...posts.map(withDefaults)];
  await writePosts(updatedPosts.map(withDefaults));

  return newPost;
}

export async function updateBlogPost(targetSlug, updates) {
  const posts = await readPosts();
  const index = posts.findIndex((post) => post.slug === targetSlug);

  if (index === -1) {
    throw new Error("Post not found");
  }

  const current = withDefaults(posts[index]);
  const nextSlug = updates.slug ? slugify(updates.slug) : current.slug;

  if (!nextSlug) {
    throw new Error("Unable to generate a slug for this post");
  }

  if (nextSlug !== current.slug && posts.some((post) => post.slug === nextSlug)) {
    throw new Error("A post with this slug already exists");
  }

  const now = new Date().toISOString();
  const nextStatus = normaliseStatus(updates.status) || current.status;
  const nextTags =
    updates.tags !== undefined ? normaliseTags(updates.tags) : current.tags;
  const nextContent =
    updates.content !== undefined ? updates.content.trim() : current.content;
  const nextExcerpt =
    updates.excerpt !== undefined
      ? updates.excerpt.trim() || nextContent.slice(0, 240).trim()
      : current.excerpt;

  let nextPublishedAt = current.publishedAt;
  if (nextStatus === "published" && !nextPublishedAt) {
    nextPublishedAt = now;
  }
  if (nextStatus === "draft") {
    nextPublishedAt = null;
  }

  const updatedPost = {
    ...current,
    title: updates.title ? updates.title.trim() : current.title,
    slug: nextSlug,
    excerpt: nextExcerpt,
    content: nextContent,
    tags: nextTags,
    status: nextStatus,
    updatedAt: now,
    publishedAt: nextPublishedAt,
  };

  const updatedPosts = [...posts];
  updatedPosts[index] = updatedPost;

  await writePosts(updatedPosts.map(withDefaults));

  return updatedPost;
}

export async function deleteBlogPost(targetSlug) {
  const posts = await readPosts();
  const nextPosts = posts.filter((post) => post.slug !== targetSlug);

  if (nextPosts.length === posts.length) {
    throw new Error("Post not found");
  }

  await writePosts(nextPosts.map(withDefaults));

  return true;
}
