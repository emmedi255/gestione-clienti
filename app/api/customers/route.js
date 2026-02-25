// app/api/customers/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY, // SERVICE ROLE (solo server)
);

export async function GET() {
  try {
    // 1️⃣ Clienti
    const { data: clients, error: clientsError } = await supabase
      .from("profiles")
      .select("*");

    if (clientsError) throw clientsError;

    if (!clients || clients.length === 0) {
      return NextResponse.json({ clients: [] });
    }

    const clientIds = clients.map((c) => c.id);

    // 2️⃣ Aziende
    const { data: companies } = await supabase
      .from("customer_data")
      .select("user_id, company")
      .in("user_id", clientIds);

    const companyMap = Object.fromEntries(
      (companies || []).map((c) => [c.user_id, c.company]),
    );

    // 3️⃣ Documenti + signed URLs
    const clientsWithDocs = await Promise.all(
      clients.map(async (client) => {
        const { data: documents } = await supabase
          .from("documents")
          .select("id, type, file_url, created_at")
          .eq("user_id", client.id)
          .order("created_at", { ascending: false });

        const documentsWithSignedUrls = await Promise.all(
          (documents || []).map(async (doc) => {
            const { data: signed } = await supabase.storage
              .from("documents")
              .createSignedUrl(doc.file_url, 60 * 60);

            return {
              ...doc,
              signedUrl: signed?.signedUrl || null,
            };
          }),
        );

        return {
          ...client,
          company: companyMap[client.id] || null,
          documents: documentsWithSignedUrls,
        };
      }),
    );

    return NextResponse.json({ clients: clientsWithDocs });
  } catch (err) {
    console.error("CUSTOMERS API ERROR:", err);
    return NextResponse.json(
      { error: "Impossibile caricare i clienti" },
      { status: 500 },
    );
  }
}
