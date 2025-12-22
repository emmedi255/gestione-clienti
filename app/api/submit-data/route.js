import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generatePDFBuffer, generateExcelBuffer } from "../../../lib/docGenerator";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY
);

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { userId, company, vat_number, address } = await req.json();
    if (!userId) return NextResponse.json({ error: "Utente non loggato" }, { status: 400 });

    // 1️⃣ Inserimento dati nella tabella customer_data
    const { data: customerData, error: insertError } = await supabase
      .from("customer_data")
      .insert([{ user_id: userId, company, vat_number, address }])
      .select()
      .single();
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

    // 2️⃣ Generazione PDF/Excel in memoria
    const pdfBuffer = await generatePDFBuffer({ company, vat_number, address });
    const excelBuffer = await generateExcelBuffer({ company, vat_number, address });
    const timestamp = Date.now();

    // 3️⃣ Upload PDF
    const pdfUpload = await supabase.storage
      .from("documents")
      .upload(`pdfs/${company}_${timestamp}.pdf`, pdfBuffer, {
        upsert: true,
        contentType: "application/pdf",
      });
    if (pdfUpload.error) throw new Error(pdfUpload.error.message);

    // 4️⃣ Upload Excel
    const excelUpload = await supabase.storage
      .from("documents")
      .upload(`excels/${company}_${timestamp}.xlsx`, excelBuffer, {
        upsert: true,
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    if (excelUpload.error) throw new Error(excelUpload.error.message);

    // 5️⃣ Inserimento link nella tabella documents
    await supabase.from("documents").insert([
      { user_id: userId, type: "PDF", file_url: pdfUpload.data.path },
      { user_id: userId, type: "EXCEL", file_url: excelUpload.data.path },
    ]);

    // 6️⃣ Chiamata alla edge function per inviare email con entrambi i file
    const edgeRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-documents-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NEXT_SUPABASE_ROLE_KEY}`
      },
      body: JSON.stringify({
        user_id: userId,
        files: [
          { file_path: pdfUpload.data.path, type: "PDF" },
          { file_path: excelUpload.data.path, type: "EXCEL" },
        ],
      }),
    });

    if (!edgeRes.ok) {
      const errorText = await edgeRes.text();
      console.error("Errore edge function:", errorText);
    }

    return NextResponse.json({
      message: "Dati salvati, documenti generati e email inviata!",
      data: customerData,
      pdfPath: pdfUpload.data.path,
      excelPath: excelUpload.data.path,
    });

  } catch (err) {
    console.error("Errore POST /api/submit-data:", err);
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
  }
}
