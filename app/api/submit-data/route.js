import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { generatePdf } from "@/lib/pdfGenerator";
import { generateNominaPdf } from "@/lib/nominaAmministratoreGenerator";
import { generateFornitorePdf } from "@/lib/fornitoreDocGenerator";
import { generateTrattamentiPdf } from "@/lib/trattamentiCondominioGenerator";
import { generateFormCompletoPdf } from "@/lib/checkListGenerator";

import { capitalizeWords } from "@/app/utils/formatters";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY,
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
    const { user, form, condominioId } = await req.json();
    const GENERAL_FORNITORE_ID = "11111111-1111-1111-1111-111111111111";
    const condominioRow = {
      user_id: user.id,
      data: form.intestazione?.data || null,
      condominio: capitalizeWords(form.intestazione?.condominio) || null,
      condominio_indirizzo:
        capitalizeWords(form.intestazione?.condominio_indirizzo) || null,

      citta: capitalizeWords(form.intestazione?.citta) || null,
      cap: form.intestazione?.cap || null,
      provincia: form.intestazione?.provincia || null,
      cf_condominio: form.intestazione?.cfCondominio || null,

      // SEZIONE 01
      nessun_dipendente: normalizeBoolean(form.sezione01?.nessunDipendente),
      portiere_checked: normalizeBoolean(form.sezione01?.portiere?.checked),
      portiere_numero: normalizeNumber(form.sezione01?.portiere?.numero),
      pulizie_checked: normalizeBoolean(form.sezione01?.pulizie?.checked),
      pulizie_numero: normalizeNumber(form.sezione01?.pulizie?.numero),
      giardiniere_checked: normalizeBoolean(
        form.sezione01?.giardiniere?.checked,
      ),
      giardiniere_numero: normalizeNumber(form.sezione01?.giardiniere?.numero),
      manutentore_checked: normalizeBoolean(
        form.sezione01?.manutentore?.checked,
      ),
      manutentore_numero: normalizeNumber(form.sezione01?.manutentore?.numero),
      altro_dipendente: form.sezione01?.altro || null,

      // SEZIONE 02
      portierato: normalizeBoolean(form.sezione02?.portierato),
      consulente_lavoro: normalizeBoolean(form.sezione02?.consulenteLavoro),
      videosorveglianza: normalizeBoolean(form.sezione02?.videosorveglianza),
      lettura_contatori: normalizeBoolean(form.sezione02?.letturaContatori),
      rspp: normalizeBoolean(form.sezione02?.rspp),
      altro_contratto: form.sezione02?.altro || null,

      // SEZIONE 03
      elettronica_enabled: normalizeBoolean(
        form.sezione03?.elettronica?.enabled,
      ),
      elettronica_server_locale: normalizeBoolean(
        form.sezione03?.elettronica?.serverLocale?.checked,
      ),
      elettronica_server_locale_autenticazione: normalizeBoolean(
        form.sezione03?.elettronica?.serverLocale?.autenticazione,
      ),
      elettronica_server_locale_no_autenticazione: normalizeBoolean(
        form.sezione03?.elettronica?.serverLocale?.noAutenticazione,
      ),
      elettronica_server_locale_password: normalizeBoolean(
        form.sezione03?.elettronica?.serverLocale?.password,
      ),
      elettronica_server_locale_password_altro:
        form.sezione03?.elettronica?.serverLocale?.altro || null,
      elettronica_cloud: normalizeBoolean(
        form.sezione03?.elettronica?.cloud?.checked,
      ),
      elettronica_cloud_autenticazione: normalizeBoolean(
        form.sezione03?.elettronica?.cloud?.autenticazione,
      ),
      elettronica_cloud_no_autenticazione: normalizeBoolean(
        form.sezione03?.elettronica?.cloud?.noAutenticazione,
      ),
      elettronica_cloud_password: normalizeBoolean(
        form.sezione03?.elettronica?.cloud?.password,
      ),
      elettronica_cloud_password_altro:
        form.sezione03?.elettronica?.cloud?.altro || null,
      cartacea_enabled: normalizeBoolean(form.sezione03?.cartacea?.enabled),
      cartacea_archivio: normalizeBoolean(form.sezione03?.cartacea?.archivio),
      cartacea_altro: form.sezione03?.cartacea?.altro || null,
      sicurezza_armadio: normalizeBoolean(form.sezione03?.sicurezza?.armadio),
      sicurezza_backup: normalizeBoolean(form.sezione03?.sicurezza?.backup),
      sicurezza_password: normalizeBoolean(form.sezione03?.sicurezza?.password),
      sicurezza_cambio_password: normalizeBoolean(
        form.sezione03?.sicurezza?.cambioPassword,
      ),
      sicurezza_antivirus: normalizeBoolean(
        form.sezione03?.sicurezza?.antivirus,
      ),
      sicurezza_firewall: normalizeBoolean(form.sezione03?.sicurezza?.firewall),
      sicurezza_screensaver: normalizeBoolean(
        form.sezione03?.sicurezza?.screensaver,
      ),
      sicurezza_altro: form.sezione03?.sicurezza?.altro || null,

      // SEZIONE 04
      piattaforme_web: normalizeBoolean(form.sezione04),

      // SEZIONE 05
      amministratore: form.sezione05?.amministratore || null,
      specifica_responsabile: form.sezione05?.specifica || null,

      // SEZIONE 06
      dipendenti_autorizzati: normalizeBoolean(form.sezione06?.dipendenti),
      smart_working: normalizeBoolean(form.sezione06?.smartWorking),
      autorizzato_nomina: normalizeBoolean(form.sezione06?.autorizzato),
      fornitori_nomina: normalizeBoolean(form.sezione06?.fornitori),
      trattamento_altro: capitalizeWords(form.sezione06?.altro),

      // SEZIONE 07
      indirizzo_studio: form.sezione07?.indirizzoStudio || null,
      sede_legale: form.sezione07?.sedeLegale || null,
      sede_operativa: form.sezione07?.sedeOperativa || null,
      codice_univoco: form.sezione07?.codiceUnivoco || null,

      // SEZIONE 07.1
      videosorveglianza_studio: normalizeBoolean(form.sezione071),

      // SEZIONE 07.1.1
      autorizzazione_ispettorato: normalizeBoolean(form.sezione0711?.valore),
      note_ispettorato: form.sezione0711?.note || null,
    };

    if (condominioId) condominioRow.condominio_id = condominioId;

    if (!user.id) {
      return NextResponse.json(
        { error: "Utente non loggato" },
        { status: 400 },
      );
    }

    const { data: condominio, error: condominioError } = await supabase
      .from("condomini")
      .upsert([condominioRow], { onConflict: "condominio_id" })
      .select()
      .single();

    const condominio_Id = condominio.condominio_id || condominio.id;

    if (condominioError || !condominio) {
      console.error("Errore upsert condominio:", condominioError);
      return NextResponse.json(
        { error: condominioError?.message || "Errore upsert condominio" },
        { status: 500 },
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

      for (const fornitore of fornitori) {
        try {
          const resultFornitore = await generateFornitorePdf({
            user,
            fornitore,
            condominio_id: condominio_Id,
            formData: form,
          });

          const fornitorePath = `pdfs/${condominio_Id}-${fornitore.fornitore_id}_nomina-responsabile-esterno-${fornitore.nome}-${fornitore.cognome}.pdf`;

          const { data: data, error: docError } = await supabase
            .from("documents")
            .upsert(
              [
                {
                  user_id: user.id,
                  condominio_id: condominio_Id,
                  document_key: "nomina-responsabile-esterno",
                  fornitore_id: fornitore.fornitore_id,
                  type: "PDF",
                  file_url: fornitorePath,
                },
              ],
              {
                onConflict: "user_id,condominio_id,document_key,fornitore_id",
              },
            );

          if (docError) {
            console.error(
              `Errore PDF fornitore ${fornitore.fornitore_id}:`,
              docError,
            );
          }
        } catch (err) {
          console.error(
            `errore generazione documento fornitore ${fornitore.fornitore_id} :`,
            err,
          );
        }
      }
    }

    const fornitoriForm = form?.sezione8?.addedFornitori || [];
    const fornitoriIds = fornitoriForm.map((f) => f.fornitore_id);

    await supabase
      .from("condomini_fornitori")
      .delete()
      .eq("condominio_id", condominioId)
      .not("fornitore_id", "in", `(${fornitoriIds.join(",")})`);

    // Cancella i documenti dei fornitori rimossi
    await supabase
      .from("documents")
      .delete()
      .eq("condominio_id", condominioId)
      .not("fornitore_id", "in", `(${fornitoriIds.join(",")})`)
      .eq("document_key", "nomina-responsabile-esterno"); // filtra solo i documenti dei fornitori

    function sanitizeFilename(name = "") {
      return name.replace(/[^a-zA-Z0-9-_]/g, "-");
    }

    const result = await generatePdf({
      user,
      condominioId: condominio_Id,
      formData: form,
    });

    const path = `pdfs/${condominio_Id}_informativa-privacy.pdf`;

    const { data, error } = await supabase.from("documents").upsert(
      [
        {
          user_id: user.id,
          condominio_id: condominio_Id,
          document_key: "informativa_privacy",
          type: "PDF",
          file_url: path,
          fornitore_id: GENERAL_FORNITORE_ID,
        },
      ],
      {
        onConflict: "user_id,condominio_id,document_key,fornitore_id",
      },
    );

    const resultNomina = await generateNominaPdf({
      user,
      condominioId: condominio_Id,
      formData: form,
    });

    const pathNomina = `pdfs/${condominio_Id}_nomina-amministratore.pdf`;

    const { dataNomina, errorNomina } = await supabase.from("documents").upsert(
      [
        {
          user_id: user.id,
          condominio_id: condominio_Id,
          document_key: "nomina_amministratore",
          type: "PDF",
          file_url: pathNomina,
          fornitore_id: GENERAL_FORNITORE_ID,
        },
      ],
      {
        onConflict: "user_id,condominio_id,document_key,fornitore_id",
      },
    );

    if (errorNomina) {
      console.error(
        "Errore upsert documents Nomina Amministratore:",
        errorNomina,
      );
    }

    const resultTrattamenti = await generateTrattamentiPdf({
      user,
      condominio_id: condominio_Id,
      formData: form,
    });

    const pathTrattamenti = `pdfs/${condominio_Id}_registro-trattamenti-condominio.pdf`;

    const { dataTrattamenti, errorTrattamenti } = await supabase
      .from("documents")
      .upsert(
        [
          {
            user_id: user.id,
            condominio_id: condominio_Id,
            document_key: "registro-trattamenti",
            type: "PDF",
            file_url: pathTrattamenti,
            fornitore_id: GENERAL_FORNITORE_ID,
          },
        ],
        {
          onConflict: "user_id,condominio_id,document_key,fornitore_id",
        },
      );

    if (dataTrattamenti) console.log("TRATTAMENTO DATI: ", dataTrattamenti);

    const resultChecklist = await generateFormCompletoPdf({
      user,
      condominio_id: condominio_Id,
      formData: form,
    });

    const pathChecklist = `pdfs/${condominio_Id}_check-list-privacy.pdf`;

    const { data: dataChecklist, error: errorChecklist } = await supabase
      .from("documents")
      .upsert(
        [
          {
            user_id: user.id,
            condominio_id: condominio_Id,
            document_key: "check-list-privacy",
            type: "PDF",
            file_url: pathChecklist,
            fornitore_id: GENERAL_FORNITORE_ID,
          },
        ],
        {
          onConflict: "user_id,condominio_id,document_key,fornitore_id",
        },
      );

    if (errorChecklist) {
      console.error("Errore upsert documents check-list:", errorChecklist);
    }

    if (errorTrattamenti) {
      console.log("Errore upsert documents:", errorTrattamenti);
    }

    return NextResponse.json({ success: true, data: condominio });
  } catch (err) {
    console.error("Errore POST /api/save-condominio:", err);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 },
    );
  }
}
