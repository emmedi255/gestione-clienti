import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { userId, data } = await req.json();

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(`
      <h1>Dati Cliente</h1>
      <p>${data.company}</p>
      <p>${data.vat_number}</p>
      <p>${data.address || ""}</p>
    `);

    const pdf = await page.pdf({ format: "A4" });
    await browser.close();

    const path = `${userId}/documento.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(path, pdf, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    return NextResponse.json({ success: true, path });
  } catch (err) {
    console.error("PDF GENERATION ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
