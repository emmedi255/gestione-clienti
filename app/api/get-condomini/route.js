// app/api/get-condomini/route.js
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY
);

export const GET = async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json({ error: "user_id mancante" }, { status: 400 });
    }

    // 🔹 Fetch condomini con documenti
    const { data, error } = await supabase
      .from("condomini")
      .select(`
        *,
        documents (
          id,
          type,
          file_url,
          document_key
        )
      `)
      .eq("user_id", user_id)
      .order("data", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 🔹 Genera signed URLs per i documenti
    const condominiWithUrls = await Promise.all(
      data.map(async (cond) => {
        if (!cond.documents || cond.documents.length === 0) return cond;

        const documentsWithUrls = await Promise.all(
          cond.documents.map(async (doc) => {
            const filePath = doc.file_url.replace(/^documents\//, ""); 

            const { data: signedData, error: signedError } =
              await supabase.storage
                .from("documents")
                .createSignedUrl(filePath, 3600); // link valido 1 ora

            if (signedError) {
              console.error("Errore signedUrl:", signedError.message);
            }



            return {
              ...doc,
              signedUrl: signedData?.signedUrl || null,
            };
          })
        );

        return {
          ...cond,
          documents: documentsWithUrls,
        };
      })
    );

    return NextResponse.json({ condomini: condominiWithUrls });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
};
