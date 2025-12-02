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

export async function getMediumPosts(limit = 6) {
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
          return feed.items.slice(0, limit).map((item) => ({
            title: item.title,
            link: item.link,
            publishedAt: item.isoDate || item.pubDate,
            excerpt: item["content:encodedSnippet"] || item.contentSnippet || "",
            categories: item.categories || [],
          }));
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
