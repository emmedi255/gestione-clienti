// /app/api/logout/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = cookies();
    cookieStore.delete("session_user"); // cancella il cookie della sessione

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Errore /api/logout:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
