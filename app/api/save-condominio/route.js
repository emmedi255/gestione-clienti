import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY
);

export const runtime = "nodejs";

// Funzione helper per normalizzare booleani
const normalizeBoolean = (v) => !!v;

// Funzione helper per numeri interi
const normalizeNumber = (v) => {
  const n = parseInt(v);
  return isNaN(n) ? 0 : n;
};



export async function POST(req) {
  try {
    const { userId, form, condominioId } = await req.json();

    const condominioRow = 
    {
            user_id: userId,
            data: form.intestazione.data,
            condominio: form.intestazione.condominio,
            citta: form.intestazione.citta,
            cap: form.intestazione.cap,
            provincia: form.intestazione.provincia,
            cf_condominio: form.intestazione.cfCondominio,

            // SEZIONE 01
            nessun_dipendente: normalizeBoolean(form.sezione01.nessunDipendente),
            portiere_checked: normalizeBoolean(form.sezione01.portiere.checked),
            portiere_numero: normalizeNumber(form.sezione01.portiere.numero),
            pulizie_checked: normalizeBoolean(form.sezione01.pulizie.checked),
            pulizie_numero: normalizeNumber(form.sezione01.pulizie.numero),
            giardiniere_checked: normalizeBoolean(form.sezione01.giardiniere.checked),
            giardiniere_numero: normalizeNumber(form.sezione01.giardiniere.numero),
            manutentore_checked: normalizeBoolean(form.sezione01.manutentore.checked),
            manutentore_numero: normalizeNumber(form.sezione01.manutentore.numero),
            altro_dipendente: form.sezione01.altro || null,

            // SEZIONE 02
            portierato: normalizeBoolean(form.sezione02.portierato),
            consulente_lavoro: normalizeBoolean(form.sezione02.consulenteLavoro),
            videosorveglianza: normalizeBoolean(form.sezione02.videosorveglianza),
            lettura_contatori: normalizeBoolean(form.sezione02.letturaContatori),
            rspp: normalizeBoolean(form.sezione02.rspp),
            altro_contratto: form.sezione02.altro || null,

            // SEZIONE 03
            elettronica_enabled: normalizeBoolean(form.sezione03.elettronica.enabled),
            elettronica_server_locale: normalizeBoolean(form.sezione03.elettronica.serverLocale.checked),
            elettronica_server_locale_autenticazione: normalizeBoolean(form.sezione03.elettronica.serverLocale.autenticazione),
            elettronica_cloud: normalizeBoolean(form.sezione03.elettronica.cloud.checked),
            elettronica_cloud_autenticazione: normalizeBoolean(form.sezione03.elettronica.cloud.autenticazione),
            cartacea_enabled: normalizeBoolean(form.sezione03.cartacea.enabled),
            cartacea_archivio: normalizeBoolean(form.sezione03.cartacea.archivio),
            cartacea_altro: form.sezione03.cartacea.altro || null,
            sicurezza_armadio: normalizeBoolean(form.sezione03.sicurezza.armadio),
            sicurezza_backup: normalizeBoolean(form.sezione03.sicurezza.backup),
            sicurezza_password: normalizeBoolean(form.sezione03.sicurezza.password),
            sicurezza_cambio_password: normalizeBoolean(form.sezione03.sicurezza.cambioPassword),
            sicurezza_antivirus: normalizeBoolean(form.sezione03.sicurezza.antivirus),
            sicurezza_firewall: normalizeBoolean(form.sezione03.sicurezza.firewall),
            sicurezza_screensaver: normalizeBoolean(form.sezione03.sicurezza.screensaver),

            // SEZIONE 04
            piattaforme_web: normalizeBoolean(form.sezione04),

            // SEZIONE 05
            amministratore: form.sezione05.amministratore || null,
            specifica_responsabile: form.sezione05.specifica || null,

            // SEZIONE 06
            dipendenti_autorizzati: normalizeBoolean(form.sezione06.dipendenti),
            smart_working: normalizeBoolean(form.sezione06.smartWorking),
            autorizzato_nomina: normalizeBoolean(form.sezione06.autorizzato),
            fornitori_nomina: normalizeBoolean(form.sezione06.fornitori),

            // SEZIONE 07
            indirizzo_studio: form.sezione07.indirizzoStudio || null,
            sede_legale: form.sezione07.sedeLegale || null,
            sede_operativa: form.sezione07.sedeOperativa || null,
            codice_univoco: form.sezione07.codiceUnivoco || null,

            // SEZIONE 07.1
            videosorveglianza_studio: normalizeBoolean(form.sezione071),

            // SEZIONE 07.1.1
            autorizzazione_ispettorato: normalizeBoolean(form.sezione0711.valore),
            note_ispettorato: form.sezione0711.note || null,
          }

      if (condominioId) condominioRow.condominio_id = condominioId;


    

    if (!userId) {
      return NextResponse.json({ error: "Utente non loggato" }, { status: 400 });
    }

    // Upsert del condominio
    const { data: condominio, error: condominioError } = await supabase
      .from("condomini")
      .upsert(
        [condominioRow
          ,
        ],
        { onConflict: "condominio_id" }
      )
      .select()
      .single();

      const condominio_Id = condominio.condominio_id || condominio.id

    if (condominioError || !condominio) {
      console.error("Errore upsert condominio:", condominioError);
      return NextResponse.json(
        { error: condominioError?.message || "Errore upsert condominio" },
        { status: 500 }
      );
    }

    
    // Upsert fornitori
    const fornitori = form?.sezione8?.addedFornitori || [];
    if (fornitori.length > 0) {
      const rows = fornitori.map((f) => ({
        condominio_id: condominio_Id,
        fornitore_id: f.fornitore_id,
      }));

      const { error: joinError } = await supabase
        .from("condomini_fornitori")
        .upsert(rows, { onConflict: ["condominio_id", "fornitore_id"] });

      if (joinError) {
        console.error("Errore join fornitori:", joinError);
        return NextResponse.json({ error: joinError.message }, { status: 500 });
      }
    }

    const fornitoriForm = form?.sezione8?.addedFornitori || [];
const fornitoriIds = fornitoriForm.map(f => f.fornitore_id);

await supabase
  .from("condomini_fornitori")
  .delete()
  .eq("condominio_id", condominio_Id)
  .not("fornitore_id", "in", `(${fornitoriIds.join(",")})`);

  

    return NextResponse.json({ success: true, data: condominio });
  } catch (err) {
    console.error("Errore POST /api/save-condominio:", err);
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
  }
}
