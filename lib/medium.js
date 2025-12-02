import Parser from "rss-parser";

const mediumUsername = process.env.MEDIUM_USERNAME || "mohamedelshawaf";
const mediumProfileDomain = process.env.MEDIUM_DOMAIN || `${mediumUsername}.medium.com`;
const mediumFeedUrl =
  process.env.MEDIUM_FEED_URL || `https://medium.com/feed/@${mediumUsername}`;

const mediumHeaders = {
  Accept: "application/rss+xml, application/xml",
  "User-Agent": "shawaf-me-medium-integration",
};

const parser = new Parser({
  headers: mediumHeaders,
});

const toSafeSlug = (value) =>
  value
    ?.toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || null;

const deriveSlugFromLink = (link) => {
  try {
    const url = new URL(link);
    const lastSegment = url.pathname.split("/").filter(Boolean).pop();
    return toSafeSlug(lastSegment);
  } catch (_error) {
    return null;
  }
};

const stripHtml = (value = "") => value.replace(/<[^>]*>/g, " ");

async function fetchMediumFeed(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      headers: mediumHeaders,
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Medium feed: ${response.statusText}`);
    }

    const xml = await response.text();
    return parser.parseString(xml);
  } finally {
    clearTimeout(timeout);
  }
}

const normaliseItem = (item, index) => {
  const link = item.link;
  const slug = deriveSlugFromLink(link) || toSafeSlug(item.guid) || `medium-post-${index}`;
  const rawContent = item["content:encoded"] || item.content || "";
  const excerptSource =
    item["content:encodedSnippet"] || item.contentSnippet || stripHtml(rawContent).trim();
  const excerpt = excerptSource ? `${excerptSource}`.replace(/\s+/g, " ").trim().slice(0, 260) : "";

  return {
    slug,
    title: item.title,
    link,
    publishedAt: item.isoDate || item.pubDate,
    excerpt,
    content: rawContent,
    categories: item.categories || [],
  };
};

export async function getMediumPosts(limit = 6, { includeContent = false } = {}) {
  try {
    const candidates = [
      mediumFeedUrl,
      `https://${mediumProfileDomain}/feed`,
      `https://medium.com/feed/@${mediumUsername}`,
    ];

    for (const url of candidates) {
      try {
        const feed = await fetchMediumFeed(url);

        if (feed?.items?.length) {
          return feed.items.slice(0, limit).map((item, index) => {
            const normalised = normaliseItem(item, index);

            if (!includeContent) {
              const { content, ...rest } = normalised;
              return rest;
            }

            return normalised;
          });
        }
      } catch (error) {
        console.warn(`Medium feed attempt failed for ${url}`, error);
      }
    }

    return [];
  } catch (error) {
    console.error("Failed to load Medium feed", error);
    return [];
  }
}

export async function getMediumPostBySlug(slug) {
  if (!slug) return null;

  const posts = await getMediumPosts(30, { includeContent: true });
  return posts.find((post) => post.slug === slug) || null;
}
