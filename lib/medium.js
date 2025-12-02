import Parser from "rss-parser";

const mediumUsername = process.env.MEDIUM_USERNAME || "shawaf";
const mediumFeedUrl = process.env.MEDIUM_FEED_URL || `https://medium.com/feed/@${mediumUsername}`;

const parser = new Parser({
  headers: {
    Accept: "application/rss+xml, application/xml",
    "User-Agent": "shawaf-me-medium-integration",
  },
});

export async function getMediumPosts(limit = 6) {
  try {
    const feed = await parser.parseURL(mediumFeedUrl);
    return (feed.items || []).slice(0, limit).map((item) => ({
      title: item.title,
      link: item.link,
      publishedAt: item.isoDate || item.pubDate,
      excerpt: item["content:encodedSnippet"] || item.contentSnippet || "",
      categories: item.categories || [],
    }));
  } catch (error) {
    console.error("Failed to load Medium feed", error);
    return [];
  }
}
