import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY,
);

export async function GET(req, context) {
  try {
    // params è una Promise → await per sbloccarla
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "ID mancante" }, { status: 400 });
    }

    // Leggi profilo dal database Supabase
    const { data: user, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Errore GET profilo:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
