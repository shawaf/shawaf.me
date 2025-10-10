import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { addBlogPost, getBlogPosts } from "@/lib/blog";

const parseBooleanParam = (value) =>
  value === "1" || value === "true" || value === "yes";

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const isAdmin = cookies().get("blog_admin")?.value === "true";
  const includeDrafts =
    isAdmin && parseBooleanParam(searchParams.get("includeDrafts"));
  const includeArchived =
    isAdmin && parseBooleanParam(searchParams.get("includeArchived"));

  try {
    const posts = await getBlogPosts({
      includeDrafts,
      includeArchived,
    });
    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error.message ||
          "Unable to load posts. Configure BLOG_DATA_DIR to point at a writable location.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const isAdmin = cookies().get("blog_admin")?.value === "true";

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const post = await addBlogPost(body);
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
