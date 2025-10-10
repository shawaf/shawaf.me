This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.jsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Private blog publishing

The in-site blog is editable through a hidden dashboard located at `/blog/admin`. The dashboard is protected with credentials so that only you can publish new articles.

Add the following environment variables before starting the app:

```bash
BLOG_ADMIN_USERNAME=your-username
BLOG_ADMIN_PASSWORD=your-strong-password
# Optional: BLOG_DATA_DIR=./data
```

These credentials are checked when you sign in on the dashboard. After authentication you can create programming-focused posts with titles, excerpts, long-form content, and optional tags. Draft content is authored in Markdown so you can add nested headings, bullet lists, code fences, tables, images, and even video embeds (YouTube, Vimeo, or direct MP4 links).

By default articles are read from `data/posts.json`. When deploying to a serverless platform you should point `BLOG_DATA_DIR` at a writable location (for example, a mounted volume or `/tmp` plus a background sync) so edits can be persisted.
