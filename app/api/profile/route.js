import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY,
);

export async function POST(req) {
  try {
    const formData = await req.json();
    const { id, password, role: clientRole, ...rest } = formData;

    if (!id) {
      return NextResponse.json({ error: "ID mancante" }, { status: 400 });
    }

    // --- 1. Aggiorna Auth ---
    const authUpdate = {};
    if (rest.email) authUpdate.email = rest.email;
    if (password) authUpdate.password = password; // opzionale

    authUpdate.user_metadata = {
      name: rest.name,
      cognome: rest.cognome,
      ragione_sociale: rest.ragione_sociale,
      telefono: rest.telefono,
    };

    const { data: authData, error: authError } =
      await supabase.auth.admin.updateUserById(id, authUpdate);
    if (authError) throw authError;

    // --- 2. Aggiorna profiles ---
    const { data: existing, error: fetchError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;

    const safeRole = existing?.role || "CLIENTE";

    await supabase
      .from("profiles")
      .upsert([{ id, ...rest, role: safeRole }], { onConflict: ["id"] });

    const { data: updatedUser, error: readError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    if (readError) throw readError;

    const res = NextResponse.json({ user: updatedUser });

    // Aggiorna cookie sessione
    res.cookies.set("session_user", JSON.stringify(updatedUser), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("Errore aggiornamento Auth+Profile:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
