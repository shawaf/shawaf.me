import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { addBlogPost, getBlogPosts } from "@/lib/blog";

export async function GET() {
  const posts = await getBlogPosts();
  return NextResponse.json({ posts });
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
