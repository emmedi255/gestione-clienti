import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies(); // <- ATTENZIONE: await!
  const cookie = cookieStore.get("session_user");

  if (!cookie) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = JSON.parse(cookie.value);
  return NextResponse.json({ user });
}
