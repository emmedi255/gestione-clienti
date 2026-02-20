import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY,
);

/* ===================== DELETE ===================== */
export async function DELETE(req, context) {
  const params = await context.params; // ✅ UNWRAP Promise
  const id = params.id;

  if (!id) {
    return NextResponse.json(
      { error: "ID condominio mancante" },
      { status: 400 },
    );
  }

  try {
    // 🔴 elimina eventuali documenti collegati
    await supabase.from("documents").delete().eq("condominio_id", id);

    // 🔴 elimina il condominio
    const { error } = await supabase
      .from("condomini")
      .delete()
      .eq("condominio_id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Condominio eliminato con successo",
    });
  } catch (error) {
    console.error("Errore DELETE condominio:", error);
    return NextResponse.json(
      { error: error.message || "Errore server" },
      { status: 500 },
    );
  }
}
