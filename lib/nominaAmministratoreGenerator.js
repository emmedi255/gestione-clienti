import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY,
);
const oggi = new Date();
const dataOggi = oggi.toISOString().split("T")[0]; // "2026-02-20"
const filePath = "./public/logo.png"; // percorso del tuo logo
const imageBuffer = fs.readFileSync(filePath);
const base64Image = `data:image/png;base64,${imageBuffer.toString("base64")}`;

export async function generateNominaPdf({ user, condominioId, formData }) {
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

  <p>In ottemperanza al disposto dell’art. 28 del Regolamento Europeo (UE) 2016/679, in
qualità di “Titolare del Trattamento” (art. 4), il condominio </p>

  <p><strong>${intestazione.condominio_indirizzo || "Condominio"}</strong></p>
  <p><strong> ${intestazione.cap || ""} ${intestazione.citta || ""}  ${intestazione.provincia || ""} </strong></p>
  <P><strong>C.F.</strong> ${intestazione.cfCondominio || ""}</p>
  <p>visto il Regolamento Europeo (UE) 2016/679, in materia di protezione dei dati
personali;
preso atto che l’art. 4, comma 8 del suddetto Regolamento definisce il
“Responsabile” come la persona fisica, la persona giuridica, la pubblica
amministrazione e qualsiasi altro ente, associazione od organismo preposti dal
titolare al trattamento dei dati personali;
atteso che l’art. 28, commi 1, 3 del Regolamento Europeo dispone che: “il titolare
del trattamento ricorre unicamente a responsabili del trattamento che presentino
garanzie sufficienti per mettere in atto misure tecniche e organizzative adeguate in
modo tale che il trattamento soddisfi i requisiti del presente regolamento. (..) Il
Responsabile tratta i dati personali soltanto su istruzione documentata del titolare
del trattamento il quale, anche tramite verifiche periodiche, vigila sulla puntuale
osservanza delle disposizioni di cui al comma 3 e delle proprie istruzioni”;
atteso che il Responsabile deve procedere al trattamento secondo le istruzioni
impartite in modo analitico dal titolare e per iscritto specificate, </p>



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
    padding: 12px 20px;
    border-bottom: 2px solid #4472C4;
    line-height: 1.2;
    display: inline-block;
  ">
    Nomina responsabile del trattamento dei dati
  </p>
      
     
</div>

<div style="
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin: 30px auto 20px auto;
  width: 100%;
  page-break-inside: avoid;
">
  <p style="margin: 0;">${studio || ""}</p>
  <p style="margin: 0;">${amministratore || ""}</p>
  <p style="margin: 0;">${sezione07.sedeLegale || ""} </p>
</div>



  <p>ai sensi e per gli effetti dell’art. 28, del Regolamento Europeo, in relazione ai dati trattati
per l’espletamento delle attività di amministrazione gestione del condominio.
Lo autorizza inoltre a ricorrere ad altri Responsabili Esterni al trattamento, per
l’esecuzione di specifiche attività necessarie alla gestione di amministrazione del
condominio e di tutti gli adempimenti normativi ad esso connessi. </p>


<p>Il Responsabile così individuato e nominato, nello svolgimento di tale incarico, effettuato con strumenti cartacei, elettronici o comunque automatizzati o con strumenti diversi, in relazione ai trattamenti dei dati rientranti nell'ambito operativo e funzionale di propria competenza, si obbliga a:</p>

<ol style="margin: 20px 0 20px 30px; padding-left: 20px; font-size: 11px;">
  <li>
    eseguire esclusivamente operazioni di trattamento funzionali alle mansioni ad esso attribuite. Qualora dovesse sorgere la necessità di effettuare trattamenti sui dati personali diversi ed eccezionali rispetto a quelli normalmente eseguiti, il responsabile richiederà l'esplicito consenso scritto agli interessati;
  </li>
  <li>
    operare nel continuativo rispetto dei principi posti dall'art. 5 del Regolamento in merito all'esigenza di correttezza, liceità, esattezza, pertinenza e completezza del trattamento medesimo;
  </li>
  <li>
    mantenere la più completa riservatezza sui dati trattati e sulle tipologie di trattamento effettuate; tale obbligo è da considerarsi pienamente vigente anche nel caso di cessazione del rapporto di impiego e/o comunque di collaborazione;
  </li>
  <li>
    classificare analiticamente le banche dati di propria competenza ed organizzare un sistema complessivo di trattamento dei dati personali comuni ed eventualmente sensibili che riguardi tutte le operazioni richiamate dall'art. 4 ("operazioni di trattamento") nessuna esclusa, predisponendo e curando ogni relativa fase applicativa nel rispetto della normativa vigente;
  </li>
  <li>
    verificare periodicamente l'adeguatezza delle misure di sicurezza adottate in relazione ai trattamenti di propria competenza, valutando se mutamenti dell'attività di trattamento e/o della tipologia di dati trattati non determinino l'adozione di misure di sicurezza diverse e più adeguate e, in tal caso, provvedere alla relativa adozione, dandone tempestiva comunicazione al Titolare;
  </li>
  <li>
    individuare e nominare per iscritto gli Incaricati del trattamento, come disposto dal Regolamento, impartendo loro apposite istruzioni che tengano conto delle misure di sicurezza, prescrivendo che essi abbiano accesso ai soli dati personali la cui conoscenza sia strettamente necessaria per adempiere ai compiti loro assegnati. Nel caso di trattamento elettronico dei dati, dovrà inoltre verificare che i singoli incaricati applichino tutte le prescrizioni di sicurezza relative alla custodia delle parole chiave;
  </li>
  <li>
    comunicare immediatamente al Titolare del trattamento gli eventuali nuovi trattamenti da intraprendere nel suo settore di competenza, provvedendo alle eventuali e necessarie formalità di legge;
  </li>
  <li>
    interagire con i soggetti incaricati di eventuali verifiche, controlli o ispezioni, evadendo tempestivamente le richieste di informazioni da parte dell'Autorità Garante e dando immediata esecuzione alle eventuali indicazioni che pervengano dalla medesima Autorità;
  </li>
  <li>
    qualora ricorra la circostanza, attuare gli obblighi di informazione e di acquisizione del consenso verificando scrupolosamente le singole fattispecie in modo da garantire la regolare esecuzione delle procedure previste dagli articoli di legge che regolamentano tali obblighi;
  </li>
  <li>
    garantire agli interessati l'effettivo esercizio dei diritti previsti dal Regolamento.
  </li>
</ol>

<div style="
  style="text-align: center;"
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
    letter-spacing: 1.5px;
    padding: 12px 20px;
    border-bottom: 2px solid #4472C4;
    line-height: 1.2;
  ">
    il responsabile del trattamento dei dati personali dichiara
  </p>
</div>

<p>di aver preso conoscenza dei compiti che gli sono affidati;
di essere a conoscenza di quanto stabilito dal Codice in materia di dati personali e
di impegnarsi ad adottare tutte le misure necessarie all' attuazione delle norme in
esso descritte.</p>

<p>Ai sensi del Regolamento il Titolare del Trattamento ha facoltà di vigilare, anche tramite
verifiche periodiche, sulla puntuale osservanza dei compiti e delle istruzioni impartite.</p>

<p>Per tutto quanto non espressamente previsto nel presente atto, si rinvia alle disposizioni
generali vigenti in materia di protezione dei dati personali.</p>

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
      Il Responsabile del Trattamento
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
        NOMINA RESPONSABILE AL TRATTAMENTO DATI
      </div>
      <div style="
        font-size: 12px;
        font-style: italic;
        margin-top: 3px;
        line-height: 1.2;
      ">
        (Regolamento Europeo UE 2016/679 sul trattamento dei dati personali –Art. 28)
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

    const path = `pdfs/${condominioId}_nomina-amministratore.pdf`;

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
