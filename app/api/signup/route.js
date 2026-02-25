import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { capitalizeWords } from "@/app/utils/formatters";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY,
);

export async function POST(req) {
  try {
    const formData = await req.json();

    // Destruttura TUTTI i campi del form
    const {
      email,
      password,
      name,
      cognome,
      ragione_sociale,
      telefono,
      partita_iva,
      // SEDE LEGALE
      sede_legale,
      citta_legale,
      pr_legale,
      cap_legale,
      // SEDE OPERATIVA
      sede_operativa,
      citta_operativa,
      pr_operativa,
      cap_operativa,
      // STUDIO
      indirizzo_studio,
      citta_studio,
      cap_studio,
      pr_studio,
      codice_univoco,
      password_expiration,
    } = formData;

    // Crea utente in Supabase Auth
    const { data: userData, error: userError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name: name,
          cognome,
          ragione_sociale,
          telefono,
        },
      });
    if (userError) throw new Error(userError.message);

    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: userData.user.id,
        name: capitalizeWords(name),
        cognome: capitalizeWords(cognome),
        ragione_sociale: capitalizeWords(ragione_sociale),
        telefono,
        email,
        // ❌ NON salvare password in chiaro nel DB!
        // password,
        partita_iva,

        // SEDE LEGALE
        sede_legale: capitalizeWords(sede_legale),
        citta_legale: capitalizeWords(citta_legale),
        pr_legale,
        cap_legale,

        // SEDE OPERATIVA
        sede_operativa: capitalizeWords(sede_operativa),
        citta_operativa: capitalizeWords(citta_operativa),
        pr_operativa,
        cap_operativa,

        // STUDIO
        indirizzo_studio: capitalizeWords(indirizzo_studio),
        citta_studio: capitalizeWords(citta_studio),
        cap_studio,
        pr_studio,
        codice_univoco,

        role: "CLIENTE",

        password_expiration,
      },
    ]);

    if (profileError) throw new Error(profileError.message);

    return NextResponse.json({
      message: "Utente creato con successo!",
      userId: userData.user.id,
    });
  } catch (err) {
    console.error("Errore registrazione:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
