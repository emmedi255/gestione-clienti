import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";



export async function GET(req, { params }) {
  // Destruttura l'id dal params
  const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY
);
  const  id  = params; 



  const { data, error } = await supabase
    .from("condomini")
    .select("*")
    .eq("condominio_id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}
