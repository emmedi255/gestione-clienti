import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY
);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const condominioId = searchParams.get("condominioId");

  if (!condominioId) return new Response(JSON.stringify({ fornitori: [] }));

  const { data, error } = await supabase
  .from('condomini_fornitori')
  .select(`
    fornitore_id,
    fornitori(*) 
  `)
  .eq('condominio_id', condominioId);

if (error) console.error(error);

const fornitori = data
  .map(d => d.fornitori)   // prendi solo i dati dei fornitori
  .filter(f => f != null); // elimina eventuali null




  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ fornitori: fornitori }));
}
