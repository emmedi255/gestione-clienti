import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Login con Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: "Credenziali non valide" },
        { status: 401 },
      );
    }

    // Controlla se email confermata
    if (!data.user.email_confirmed_at) {
      return NextResponse.json(
        { error: "Devi confermare la tua email" },
        { status: 401 },
      );
    }

    const userProfile = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();
    console.log("USER", userProfile);

    if (userProfile.data.password_expiration) {
      const now = new Date();
      const expiration = new Date(userProfile.data.password_expiration);
      if (now.getTime() > expiration.getTime()) {
        return NextResponse.json(
          { error: "La tua password è scaduta, contatta l'amministratore" },
          { status: 403 },
        );
      }
    }

    const res = NextResponse.json({ user: userProfile.data });

    // 🍪 COOKIE SESSIONE
    res.cookies.set("session_user", JSON.stringify(userProfile.data), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return res;
  } catch (err) {
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}
