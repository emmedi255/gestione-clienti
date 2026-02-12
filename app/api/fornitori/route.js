import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY
);

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) return new Response(JSON.stringify({ error: "userId mancante" }), { status: 400 });

    const { data, error } = await supabase
      .from("fornitori")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });

    return new Response(JSON.stringify({ data }), { status: 200 });
  } catch (err) {
    console.error("GET fornitori error:", err);
    return new Response(JSON.stringify({ error: "Errore interno server" }), { status: 500 });
  }
}
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID fornitore mancante" }),
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("fornitori")
      .delete()
      .eq("fornitore_id", id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Errore interno server" }),
      { status: 500 }
    );
  }
}
export async function POST(req) {
  try {
    const { userId, nome, indirizzo, cf, attivita } = await req.json();

    if (!userId || !nome) {
      return new Response(JSON.stringify({ error: "Dati mancanti" }), { status: 400 });
    }

    const { data, error } = await supabase
      .from("fornitori")
      .insert({ user_id: userId, nome, indirizzo, cf, attivita })
      .select()
      .single();

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });

    return new Response(JSON.stringify({ data }), { status: 200 });
  } catch (err) {
    console.error("POST fornitori error:", err);
    return new Response(JSON.stringify({ error: "Errore interno server" }), { status: 500 });
  }
}
