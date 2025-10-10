import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { deleteBlogPost, updateBlogPost } from "@/lib/blog";

const isAdminRequest = () => cookies().get("blog_admin")?.value === "true";

export async function PATCH(request, { params }) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const post = await updateBlogPost(params.slug, body);
    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    await deleteBlogPost(params.slug);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
