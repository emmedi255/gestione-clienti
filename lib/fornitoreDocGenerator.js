import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY,
);

const filePath = "./public/logo.png"; // percorso del tuo logo
const imageBuffer = fs.readFileSync(filePath);
const base64Image = `data:image/png;base64,${imageBuffer.toString("base64")}`;

const oggi = new Date();
const dataOggi = oggi.toISOString().split("T")[0]; // "2026-02-20"
export async function generateFornitorePdf({
  user,
  fornitore,
  condominio_id,
  formData,
}) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Estrai dati rilevanti dal form
    const intestazione = formData.intestazione || {};
    const sezione05 = formData.sezione05 || {};
    const sezione07 = formData.sezione07 || {};
    const amministratore =
      sezione05.amministratore || "Amministratore pro tempore";
    const studio = sezione05.specifica;
    const dataOggi = new Date().toLocaleDateString("it-IT");

    await page.setContent(
      `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Informativa sul trattamento dei dati personali</title>

  <style>
    /* ===== Impostazioni pagina PDF ===== */
    @page {
      margin: 120px 45px 60px 45px;
    }

    body {
      font-family: "Times New Roman", serif;
      font-size: 12px;
      line-height: 1.7;
      color: #000;
    }

    /* ===== HEADER ===== */
    .page-header {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 80px;
      border-bottom: 1px solid #bbb;
    }

    .page-header img {
      height: 50px;
      position: absolute;
      top: 15px;
      left: 15px;
    }

    .page-header .header-text {
      margin-left: 80px;
      padding-top: 15px;
      text-align: left;
    }

    .page-header .header-title {
      font-size: 16px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .page-header .header-subtitle {
      font-size: 12px;
      font-style: italic;
      margin-top: 5px;
    }

    /* ===== TITOLI ===== */
    h1 {
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 35px;
      text-transform: uppercase;
      page-break-after: avoid;
    }

    h2 {
      font-size: 14px;
      font-weight: bold;
      margin-top: 30px;
      margin-bottom: 12px;
      border-bottom: 1px solid #bbb;
      padding-bottom: 4px;
      page-break-after: avoid;
      page-break-inside: avoid;
    }

    /* ===== PARAGRAFI ===== */
    p, p2 {
      margin-bottom: 12px;
      text-align: justify;
      page-break-inside: avoid;
    }

    ul {
      margin: 10px 0 15px 25px;
      page-break-inside: avoid;
    }

    ul li {
      margin-bottom: 6px;
    }

    blockquote {
      margin: 20px 0;
      padding: 14px 18px;
      background-color: #F3F4F7;
      border-left: 4px solid #4472C4;
      font-style: italic;
      page-break-inside: avoid;
    }

    .page-break {
      page-break-before: always;
      break-before: page;
    }

    /* ===== FOOTER ===== */
    footer {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      text-align: center;
      font-size: 10px;
      color: #555;
      border-top: 1px solid #ccc;
      padding-top: 5px;
    }
  </style>
</head>

<body>

<div style="position: absolute; top: 1.5cm; right: 1.5cm; width: 6cm; text-align: left; font-family: 'Times New Roman', serif; line-height: 1.1;">
  <p style="margin: 0;">Spettabile</p>
  <p style="margin: 0 0 0.2cm 0;">${fornitore.nome} ${fornitore.cognome}</p>
  <p style="margin: 0;">${fornitore.indirizzo} ${fornitore.cap} ${fornitore.citta} ${fornitore.provincia}</p>
  <p style="margin: 0;">P.IVA ${fornitore.cf}</p>
</div>

<div style="margin-top: 5cm; text-align: center; font-family: 'Times New Roman', serif;">
  <p style="margin: 0;">
    Conferimento incarico di
    Responsabile Esterno del trattamento dei dati,
    effettuato ai sensi dell’ART. 28 Reg. UE 679/2016
  </p>
</div>




  <p>Il Condominio ${intestazione.condominio_indirizzo}, ${intestazione.cap} ${intestazione.citta}(${intestazione.provincia}) C.F. ${intestazione.cfCondominio} previa verifica della
sussistenza di esperienza, capacità e affidabilità in conformità delle misure tecniche e organizzative
adottate alle disposizioni del Reg. EU 679/2016, così come richiesto dal relativo Art.28, con la presente</p>

<div style="
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin: 30px auto 20px auto;
  width: 100%;
  page-break-inside: avoid;
">
  <p style="
    margin: 0;
    font-weight: bold;
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    border-bottom: 2px solid #4472C4;
    display: inline-block;
  ">
    NOMINA
  </p>
      
     
</div>

<div style="
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 100%;
  page-break-inside: avoid;
  line-height: 1.5;
  font-size: 11pt;
  font-family: Arial, sans-serif;
">
  <p style="margin: 0; padding: 0;">${fornitore.ragione_sociale || ""}</p>
  <p style="margin: 2px 0; padding: 0;">${fornitore.nome || ""} ${fornitore.cognome || ""}</p>
  <p style="margin: 2px 0; padding: 0;">${fornitore.indirizzo || ""} ${fornitore.cap || ""} ${fornitore.citta || ""} ${fornitore.provincia || ""}</p>
  <p style="margin: 0; padding: 0;">P.IVA ${fornitore.cf || ""}</p>
</div>


<p>Responsabile Esterno del Trattamento dei dati personali dei propri condomini e/o inquilini, fornitori e
dipendenti, se presenti, trattati nell’ambito del proprio incarico di ${fornitore.specifica} e di tutte le attività accessorie al suddetto incarico con l’obbligo di
rispettare le istruzioni impartite dal Titolare del Trattamento, le disposizioni di legge ed il Regolamento in
materia di tutela dei dati personali.</p>  

<p>Il presente incarico è conferito fino alla sussistenza del contratto in essere tra le parti.</p>
<p>In particolare, oltre a collaborare per la corretta attuazione delle prescrizioni del Garante è fatto obbligo di:</p>

<ol style="margin: 20px 0 20px 30px; padding-left: 20px;">
  <li>
    Mantenere un sistema di sicurezza idoneo a rispettare le misure tecniche organizzative adeguate di
cui all’Art. 32 Reg. EU 679/2016 e ad ogni altra disposizione in materia, oltre ad adeguare il sistema
alle future norme regolamentari in materia di sicurezza;
  </li>
  <li>
    Individuare le persone autorizzate se presenti ed indicare loro le istruzioni necessarie per un
corretto, lecito, sicuro trattamento. Nel caso in cui il Responsabile intenda ricorrere ad un altro
Responsabile per il per l’esecuzione di specifiche attività di trattamento, non potrà farlo senza previa
autorizzazione scritta, specifica o generale, del Titolare del Trattamento di cui art. 28 par. 2 e par. 4
Regolamento UE 2016/679;
  </li>
  <li>
    Garantire che le persone autorizzate al trattamento dei dati personali si siano impegnate alla
riservatezza o abbiano un adeguato obbligo legale di riservatezza;
  </li>
  <li>
Assistere il titolare del trattamento con misure tecniche e organizzative adeguate, tenendo conto
della natura del trattamento e nella misura in cui ciò sia possibile, al fine di soddisfare l&#39;obbligo del
titolare del trattamento di dare seguito alle richieste per l&#39;esercizio dei diritti dell’interessato previsti
agli Art. 7, 15 - 22 del Reg. EU 679/2016;  </li>
  <li>
In particolare, qualora il responsabile tratti dati oggetto di richiesta di portabilità, si obbliga ad
assistere il titolare del trattamento con misure tecniche e organizzative adeguate al fine di rispondere a detta richiesta;  </li>
  <li>
Assistere il titolare del trattamento nel garantire il rispetto dell’obbligo di notifica di una violazione dei
dati personali all’autorità di controllo di cui all’art. 33 e 34 Regolamento UE 679/2016. In caso di
violazione dei dati personali il responsabile del trattamento informa il titolare senza ingiustificato
ritardo e comunque entro il termine di 72 ore dal momento in cui è venuto a conoscenza della
violazione;  </li>
  <li>
Assistere il titolare del trattamento nelle attività relative alla valutazione di impatto sulla protezione
dei dati e consultazione preventiva di cui all’Art. 35, 36 Regolamento UE 2016/679, tenendo conto
della natura del trattamento e delle informazioni a disposizione del responsabile del trattamento;  </li>
  <li>
Su richiesta del Titolare cancellare e/o restituire tutti i dati personali dopo che è terminata la
prestazione dei servizi relativi al trattamento e cancelli le copie esistenti, salvo che il diritto
dell’Unione o degli Stati membri preveda la conservazione dei dati;  </li>
  <li>
In particolare, si impegna a osservare le disposizioni che vengono impartite dal Titolare, ad attuare
gli obblighi di informativa e di acquisizione del consenso nei confronti degli interessati, nonché di
assistere tempestivamente gli interessati che presentino richieste inerenti all’esercizio dei loro diritti
informando tempestivamente il Titolare del trattamento di tali richieste;  </li>
  <li>
di responsabile del trattamento, per i suddetti trattamenti, si impegna a tenere e aggiornare il registro
del trattamento di cui all’art. 30 Regolamento UE n. 679/2016 nella forma e con i contenuti indicati
dalla disposizione citata, tale disposizione non si applica alle imprese  </li>
</ol>



<p>Il Titolare del Trattamento vigilerà, anche tramite verifiche periodiche, sull’osservanza da parte del
Responsabile delle vigenti disposizioni dettate in materia di trattamento (ivi compreso il profilo relativo alla
sicurezza) sul rispetto delle proprie istruzioni e degli obblighi innanzi indicati.</p>

<p>Data:${user.citta_legale}, ${dataOggi}</p>

<div style="
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 60px;
  padding-top: 30px;
  font-family: 'Times New Roman', serif;
  font-size: 12px;
  page-break-inside: avoid;
">
  
  <!-- Firma sinistra: Titolare -->
  <div style="flex: 1; text-align: left;">
    <p style="margin: 0 0 8px 0; font-weight: bold;">
      Il Titolare del Trattamento
    </p>
    <p style="margin: 0; padding-top: 2px; width: 80%; min-height: 20px;">
      _________________________
    </p>
  </div>
  
  <!-- Firma destra: Responsabile -->
  <div style="flex: 1; text-align: right;">
    <p style="margin: 0 0 8px 0; font-weight: bold;">
    ${fornitore.nome} ${fornitore.cognome}
    </p>
    <p style="margin: 0; padding-top: 2px; width: 80%; min-height: 20px;">
      _________________________
    </p>
  </div>
  
</div>

</body>
</html>
`,
      { waitUntil: "networkidle0" },
    );

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      margin: {
        top: "120px",
        bottom: "60px",
        left: "45px",
        right: "45px",
      },
      headerTemplate: `
  <div style="
    display: flex;
    align-items: center;
    font-family: 'Times New Roman', serif;
    width: 100%;
    height: 80px;
    border-bottom: 1px solid #bbb;
    padding: 0 15px;
    box-sizing: border-box;
  ">
    <!-- Logo a sinistra -->
    <img src="${base64Image}" style="
      height: 50px;
      margin-right: 15px;
      margin-left: 45px
    " />

    <!-- Testo a destra del logo -->
     <div>
      <div style="
        font-size: 16px;
        font-weight: bold;
        text-transform: uppercase;
        line-height: 1.2;
      ">
        CONFERIMENTO INCARICO DI RESPONSABILE ESTERNO DEL TRATTAMENTO DEI DATI
      </div>
      <div style="
        font-size: 12px;
        font-style: italic;
        margin-top: 3px;
        line-height: 1.2;
      ">
        (effettuato ai sensi dell’ART. 28 Reg. EU 679/2016)
      </div>
    </div>
  </div>
`,

      footerTemplate: `
    <div style="font-size:10px; text-align:center; width:100%;">
      Documento generato il ${dataOggi} | Reg. UE 2016/679
    </div>
  `,
    });

    await browser.close();

    const path = `pdfs/${condominio_id}-${fornitore.fornitore_id}_nomina-responsabile-esterno-${fornitore.nome}-${fornitore.cognome}.pdf`;

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
