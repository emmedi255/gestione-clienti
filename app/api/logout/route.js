// app/api/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // 🔹 Crea la risposta
    const res = NextResponse.json({ success: true });

    // 🔹 Cancella il cookie session_user
    res.cookies.set({
      name: "session_user",
      value: "",
      path: "/",
      maxAge: 0,
    });

    return res;
  } catch (err) {
    console.error("Errore logout:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 },
    );
  }
}
