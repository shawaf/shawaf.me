import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const isAdmin = cookies().get("blog_admin")?.value === "true";

  if (!isAdmin) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}
