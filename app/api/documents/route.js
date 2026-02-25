import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY
);

export async function POST(req) {
  const { user_id } = await req.json();

  const { data: documents, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", user_id)
    .eq("condominio_id")
    .eq("type","PDF")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // 🔐 Genera signed URLs
  const docsWithUrls = await Promise.all(
    documents.map(async (doc) => {
      const { data } = await supabase.storage
        .from("documents")
        .createSignedUrl(doc.file_url, 60 * 60); // 1 ora

      return {
        ...doc,
        signedUrl: data?.signedUrl || null,
      };
    })
  );

  return NextResponse.json({ documents: docsWithUrls });
}
