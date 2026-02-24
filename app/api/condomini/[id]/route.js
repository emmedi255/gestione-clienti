import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY, // 🔐 service role
);

export async function DELETE(req, context) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: "ID condominio mancante" },
      { status: 400 },
    );
  }

  try {
    /* 1️⃣ Recupero documenti collegati */
    const { data: documents, error: fetchError } = await supabase
      .from("documents")
      .select("file_url")
      .eq("condominio_id", id);

    if (fetchError) throw fetchError;

    /* 2️⃣ Elimino file dallo storage */
    if (documents?.length) {
      const filePaths = documents.map((d) => d.file_url).filter(Boolean);

      if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("documents") // 🔁 nome bucket
          .remove(filePaths);

        if (storageError) throw storageError;
      }
    }

    /* 3️⃣ Elimino record documenti */
    await supabase.from("documents").delete().eq("condominio_id", id);

    /* 4️⃣ Elimino condominio */
    const { error } = await supabase
      .from("condomini")
      .delete()
      .eq("condominio_id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Condominio e documenti eliminati con successo",
    });
  } catch (error) {
    console.error("Errore DELETE condominio:", error);
    return NextResponse.json(
      { error: error.message || "Errore server" },
      { status: 500 },
    );
  }
}
