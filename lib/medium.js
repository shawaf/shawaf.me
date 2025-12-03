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

const normaliseImageUrl = (url) => {
  if (!url) return null;

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  if (url.startsWith("/")) {
    return `https://${mediumProfileDomain}${url}`;
  }

  return url;
};

const extractFirstImage = (rawContent = "", enclosureUrl) => {
  const candidate = enclosureUrl || (() => {
    const match = rawContent.match(/<img[^>]+src=["']([^"'>]+)["'][^>]*>/i);
    return match?.[1];
  })();

  return normaliseImageUrl(candidate);
};

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
  const slug =
    deriveSlugFromLink(link) ||
    toSafeSlug(item.guid) ||
    toSafeSlug(item.title) ||
    `medium-post-${index}`;
  const rawContent = item["content:encoded"] || item.content || "";
  const image = normaliseImageUrl(extractFirstImage(rawContent, item.enclosure?.url));
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
    image,
    categories: item.categories || [],
  };
};

async function fetchMediumArticle(slug) {
  if (!slug) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  const trimmedSlug = slug.replace(/^\/+/, "");
  const slugParts = trimmedSlug.split("-");
  const possibleId = slugParts.find((part) => /^[a-f0-9]{12}$/i.test(part));

  const candidatePaths = new Set([
    trimmedSlug,
    `@${mediumUsername}/${trimmedSlug}`,
  ]);

  if (possibleId) {
    candidatePaths.add(`p/${possibleId}`);
  }

  if (!trimmedSlug.startsWith("p/")) {
    candidatePaths.add(`p/${trimmedSlug}`);
  }

  const candidates = Array.from(candidatePaths).flatMap((path) => [
    `https://${mediumProfileDomain}/${path}?format=json`,
    `https://medium.com/${path}?format=json`,
  ]);

  try {
    for (const url of candidates) {
      try {
        const response = await fetch(url, {
          headers: {
            ...mediumHeaders,
            Accept: "application/json",
          },
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          continue;
        }

        const raw = await response.text();
        const trimmed = raw.replace(/^\)\]\}while\(1\);<\/x>/, "");
        const data = JSON.parse(trimmed);
        const value = data?.payload?.value;

        if (!value) {
          continue;
        }

        const paragraphs = value.content?.bodyModel?.paragraphs || [];
        const previewImageId = value.virtuals?.previewImage?.imageId;
        const html = paragraphs
          .map((p) => {
            const text = p.text || "";

            switch (p.type) {
              case "H1":
                return `<h1>${text}</h1>`;
              case "H2":
                return `<h2>${text}</h2>`;
              case "H3":
                return `<h3>${text}</h3>`;
              case "BQ":
                return `<blockquote>${text}</blockquote>`;
              case "IMG": {
                const src = p.metadata?.id
                  ? `https://miro.medium.com/v2/resize:fit:1400/${p.metadata.id}`
                  : null;
                return src ? `<figure><img src="${src}" alt="${text}" /></figure>` : "";
              }
              default:
                return `<p>${text}</p>`;
            }
          })
          .join("\n");

        const categories = value.virtuals?.tags?.map((tag) => tag.name) || [];
        const excerpt =
          value.content?.subtitle ||
          paragraphs
            .map((p) => p.text)
          .join(" ")
          .replace(/\s+/g, " ")
          .slice(0, 260);

        const paragraphImage = paragraphs.find((p) => p.type === "IMG" && p.metadata?.id);
        const imageId = paragraphImage?.metadata?.id || previewImageId;
        const image = imageId ? `https://miro.medium.com/v2/resize:fit:1400/${imageId}` : null;

        return {
          slug,
          title: value.title || slug,
          link: value.mediumUrl || `https://${mediumProfileDomain}/${slug}`,
          publishedAt: value.firstPublishedAt
            ? new Date(value.firstPublishedAt).toISOString()
            : null,
          excerpt,
          content: html,
          image,
          categories,
        };
      } catch (error) {
        console.warn(`Medium article fallback failed for ${url}`, error);
      }
    }

    return null;
  } finally {
    clearTimeout(timeout);
  }
}

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

  const safeSlug = toSafeSlug(slug) || slug;
  const posts = await getMediumPosts(30, { includeContent: true });
  const matched = posts.find((post) => post.slug === safeSlug || post.slug === slug);

  if (matched) {
    return matched;
  }

  return fetchMediumArticle(safeSlug);
}
