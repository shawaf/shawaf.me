import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_USERNAME = process.env.BLOG_ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.BLOG_ADMIN_PASSWORD;

export async function POST(request) {
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Admin credentials are not configured." },
      { status: 500 }
    );
  }

  const { username, password } = await request.json();

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  cookies().set({
    name: "blog_admin",
    value: "true",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours
  });

  return NextResponse.json({ success: true });
}
