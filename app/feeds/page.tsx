import { format } from "date-fns"
import Image from "next/image"
import { Pool } from "pg";

let pool: Pool | null = null;

function getPool() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }

  return pool;
}

type FeedRow = {
  id: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
};

async function getFeeds(): Promise<FeedRow[]> {
  const activePool = getPool();
  if (!activePool) {
    return [];
  }

  try {
    const result = await activePool.query<FeedRow>(
      "SELECT * FROM feeds ORDER BY created_at DESC",
    );
    return result.rows;
  } catch (error) {
    console.error("Failed to fetch feeds", error);
    return [];
  }
}

export default async function FeedsPage() {
  const feeds = await getFeeds()

  // Sort by date DESC (newest first)
  const sortedFeeds = feeds.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto h-full">
        <div className="flex flex-col items-start gap-12 xl:pt-8">
          <div className="text-start xl:text-start order-none xl:order-none">
            <h3 className="h3 mb-6 underline">
              What&apos;s New
            </h3>
          </div>
          {sortedFeeds.map((feed) => (
            <div
              key={feed.id}
              className="w-full rounded-lg border border-border bg-card p-6 shadow-sm"
            >
              <div className="mb-4 text-sm text-accent">
                {format(new Date(feed.created_at), "MMMM d, yyyy")}
              </div>
              <p className="mb-4 text-lg text-foreground">{feed.content}</p>
              {feed.image_url && (
                <Image
                  src={feed.image_url || "/placeholder.svg"}
                  alt="Feed image"
                  height={200}
                  width={200}
                  className="mb-4 rounded-lg object-cover"
                />
              )}
              {feed.video_url && (
                <video
                  src={feed.video_url}
                  controls
                  className="mb-4 w-full rounded-lg"
                />
              )}
              <hr className="mt-6 border-t border-border/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

