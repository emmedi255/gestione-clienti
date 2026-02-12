import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY
);

const filePath = "./public/logo.png"; // percorso del tuo logo
const imageBuffer = fs.readFileSync(filePath);
const base64Image = `data:image/png;base64,${imageBuffer.toString("base64")}`;


export async function generatePdf({ user, condominioId, formData }) {    
    
    try {
   
   
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Estrai dati rilevanti dal form
    const intestazione = formData.intestazione || {};
    const sezione05 = formData.sezione05 || {};
    const sezione07 = formData.sezione07 || {};
    const amministratore = sezione05.amministratore || "Amministratore pro tempore";
    const studio = sezione05.specifica;
    const dataOggi = new Date().toLocaleDateString('it-IT');

await page.setContent(`
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

  <p>In ottemperanza a quanto disposto al Capo III - art. 12 del Regolamento (UE) 2016/679 relativo alla protezione dei dati personali (in seguito "Regolamento"), il </p>

  <p><strong>${intestazione.condominio || 'Condominio'}</strong></p>
  <p><strong>${intestazione.citta || ''} (${intestazione.cap || ''} ${intestazione.provincia || ''}) C.F. ${intestazione.cfCondominio || ''}</strong></p>
  <p>in qualità di "Titolare del Trattamento" (cfr. art. 4, c. 7), che detiene e tratta dati personali tutelati dal Regolamento medesimo, informa i soggetti interessati, ovvero i Signori Condomini, gli inquilini e, se del caso, dipendenti e fornitori (vedasi avanti punto 14) di quanto segue. </p>

  <h2>Finalità ed oggetto del trattamento dati</h2>
  <blockquote>
    <strong>Il trattamento dei dati forniti o acquisiti ha come scopo unico l'espletamento dell'attività gestionali ed amministrative del condominio, ovvero alla gestione dei beni e dei servizi comuni, al fine di effettuare tutte le operazioni necessarie per la corretta amministrazione degli stessi; tali operazioni potranno quindi comprendere le seguenti attività:<br>
    a. adempimento degli obblighi contrattuali;<br>
    b. adempimento degli obblighi di legge;<br>
    c. ogni altro adempimento richiesto;</strong>
  </blockquote>

  <p>Secondo il Capo II, art. 5 e segg., il trattamento dati sarà improntato ai principi generali di liceità, correttezza, trasparenza. Il trattamento dei dati sarà attuato nel rispetto di idonee misure di sicurezza, facendo uso di metodi e mezzi che ne prevengano il rischio di perdita o distruzione, anche accidentale, di accesso non autorizzato, o di trattamento non consentito. Il Titolare del Trattamento autorizza inoltre l'amministratore del condominio incaricato a ricorrere ad altri Responsabili Esterni al trattamento per l'esecuzione di specifiche attività necessarie alla gestione del condominio e di tutti gli adempimenti normativi ad esso connessi. </p>

  <h2>Dati trattati: tipologia e caratteristiche</h2>
  <ul>
    <li>Per Trattamento di dati personali si intende (art. 4 c. 2):qualsiasi operazione o insieme di operazioni, compiute con o senza l'ausilio di processi automatizzati e applicate a dati personali o insiemi di dati personali, come la raccolta, la registrazione, l'organizzazione, la strutturazione, la conservazione, l'adattamento o la modifica, l'estrazione, la consultazione, l'uso, la comunicazione mediante trasmissione, diffusione o qualsiasi altra forma di messa a disposizione, il raffronto o l'interconnessione, la limitazione, la cancellazione o la distruzione.</li>
    <li>Identificativi, dati fiscali e relativi al nucleo familiare;</li>
    <li>dati relativi ad utenze di servizi vari;</li>
    <li>dati ed immagini provenienti da sistemi di videosorveglianza;</li>
    <li>indirizzi di posta elettronica, anche certificate;</li>
    <li>numeri di telefono fissi e cellulari;</li>
    <li>dati relativi a coordinate bancarie;</li>
  </ul>

  <p><strong>Ad eccezzione per singolari casi di necessità strettamente correlati e finalizzati ad una corretta amministrazione condominiale, non saranno raccolti, detenuti, comunicati, diffusi, né trattati in alcun modo dati sensibili o giudiziari. </strong></p>

  <h2>Destinatari del trattamento dati</h2>

  <p>I dati sono utilizzati dalle società professionali, dai professionisti e dai loro collaboratori, interni od esterni, cui il Condominio affida, di volta in volta, la gestione amministrativa. I collaboratori interni all'organizzazione dell'amministratore p.t potranno operare solo dopo aver ricevuto formale autorizzazione e idonea formazione. I professionisti ed organizzazioni esterne che intervengano in uno o più processi di trattamento dei dati (ad es. il commercialista per attività contabili e fiscali, il consulente del lavoro per la gestione degli eventuali dipendenti, l'avvocato per questioni legali e di recupero crediti, il tecnico manutentore del sistema informativo, il servizio privato di postalizzazione per il recapito della posta ordinaria e/o straordinaria, ecc.) potranno operare solo dopo aver ricevuto e sottoscritto formale nomina a Responsabile esterno del trattamento dei dati personali.
  Secondo la normative di riferimento, (Capo IV), il Condominio, in qualità di Titolare del Trattamento dei dati personali, affida all'Amministratore pro tempore il compito di operare in totale ottemperanza alle vigenti norme in materia di protezione dei dati personali, in qualità di Responsabile del trattamento. </p>

  <h2>Modalità del trattamento dei dati</h2>

  <p>Il trattamento dei dati è effettuato presso gli uffici dell'Amministratore p.t., sia in forma cartacea che mediante mezzi elettronici ed informatici, o comunque automatizzati, con l'adozione di tutte le misure idonee a garantire la sicurezza e la riservatezza dei dati personali dei Signori Condòmini ed inquilini, come definito nella documentazione operativa. Tuttavia, alcuni trattamenti specifici possono avvenire anche al di fuori degli uffici dell'Amministratore, ad esempio in presenza di servizio di portierato, o di impianto di videosorveglianza e negli altri casi citati nel presente documento.
  Non sono previsti processi decisionali automatizzati o profilazione relative al trattamento dati.</p>

  <h2>Regolarità del trattamento</h2>

  <p2>Il conferimento dei dati connessi alle attività di gestione del condominio e necessari per l'assolvimento degli obblighi di legge, riveste carattere d’obbligo legale pertanto il Condominio ed il suo Amministratore sono esonerati dal richiedere alcun consenso, da parte dei singoli condòmini, al trattamento di quei dati personali strettamente necessari all'amministrazione dello stesso (ad es. nome, cognome, residenza, domicilio, codice fiscale), previsti dal Codice Civile agli artt. 1129 e 1130 e dalla Legge 220/2012. Per contro, è richiesto il consenso esplicito per il trattamento dei dati personali non strettamente necessari alla gestione del condominio, quali ad esempio i numeri di telefono fisso e mobile, gli indirizzi di posta elettronica, ecc., a meno che gli stessi non siano già reperibili in elenchi pubblici quali, a titolo esemplificativo, siti web, pagine bianche, pagine gialle, ecc.. </p2>

  <h2>Conservazione dei dati</h2>

  <p>I dati relativi alla gestione condominiale sono conservati per i periodi minimi di legge (es. 10 anni per scritture contabili e documenti giustificativi), in archivi cartacei ed elettronici. Riguardo questi ultimi, si precisa che esiste la possibilità che copie di sicurezza transitino o risiedano temporaneamente su server fisicamente locati all'estero, anche al di fuori della Comunità Europea. </p>

  <h2>Comunicazione / diffusione dati</h2>

  <p>I dati possono essere trasmessi a:</p>

  <ul>
    <li>Altri soggetti della compagine condominiale, limitatamente alle informazioni necessarie e idonee a decidere sulle parti comuni; </li>
    <li>enti di controllo e vigilanza, sulla scorta delle normative vigenti </li>
    <li>terze parti coinvolte nei vari processi necessari alla realizzazione delle attività derivanti dal mandato di gestione del condominio.</li>
  </ul>

  <p>Rimane esclusa ogni altra comunicazione e/o diffusione priva di consenso esplicito degli interessati. </p>

  <h2>Dati ed immagini provenienti da sistemi di videosorveglianza</h2>

  <p>I sistemi di videosorveglianza del condominio generano dati ed immagini esclusivamente riguardanti le parti comuni. La presenza di tali sistemi è debitamente segnalata da cartelli conformi alle disposizioni normative vigenti. I dati e le immagini prodotti dai suddetti sistemi sono gestiti in conformità a quanto disposto dall'articolo 1122-ter del Codice civile, introdotto dalla riforma del condominio (Legge 220/2012) e ai princìpi del Regolamento (artt. 5 e 6). </p>

  <h2>Portierato</h2>

  <p>Gli addetti alla portineria ed altri dipendenti eventualmente incaricati della distribuzione della posta, sono formalmente nominati e adeguatamente formati ai fini del trattamento dei dati, secondo quanto previsto dalla documentazione operativa. Tale formazione è documentata. </p>

  <h2>Diritti dell'interessato</h2>

  <p>Il Regolamento riconosce all'interessato numerosi diritti; tra questi si richiamano (artt. 12, 15, 17, 18, 20): Il diritto di accesso ai dati, per conoscere:</p>

  <ul>
    <li>Le finalità del trattamento </li>
    <li>Le categorie di dati in questione </li>
    <li>I destinatari cui i dati sono o saranno comunicati </li>
    <li>Il periodo e le modalità di conservazione dei dati </li>
    <li>Il diritto di ottenere la rettifica o l'integrazione dei dati </li>
    <li>Il diritto di ottenere la cancellazione ("diritto all'oblio"), senza ingiustificato ritardo </li>
    <li>Il diritto di limitazione del trattamento nei casi di inesattezza dei dati, di trattamento illecito o non necessario </li>
    <li>Il diritto di proporre reclamo alla Autorità di controllo ("Garante della privacy").</li>
  </ul>

<p>Per l'esercizio dei summenzionati diritti è possibile rivolgersi a:</p>

<dl style="margin-top: 5px; line-height: 1.5;">
  <dt style="font-weight: bold;">Amministratore:</dt>
  <dd style="margin: 0 0 5px 0;">${amministratore}</dd>

  <dt style="font-weight: bold;">Studio:</dt>
  <dd style="margin: 0 0 5px 0;">${studio}</dd>

  <dt style="font-weight: bold;">Indirizzo:</dt>
  <dd style="margin: 0 0 5px 0;">${sezione07.indirizzoStudio}</dd>

  <dt style="font-weight: bold;">Telefono:</dt>
  <dd style="margin: 0 0 5px 0;">${user.telefono}</dd>

  <dt style="font-weight: bold;">Email:</dt>
  <dd style="margin: 0 0 5px 0;">${user.email}</dd>
</dl>
  <h2>Modalità per l'esercizio del diritto di accesso</h2>

  <p>I soggetti interessati possono esercitare in ogni momento i diritti riconosciuti dal Regolamento rivolgendosi all'Amministratore pro tempore, Responsabile del trattamento dei dati. </p>

  <h2>Titolare e responsabile del trattemento dati</h2>

  <p>Il Condominio viene qualificator come <strong>Titolare del trattamento dei dati</strong> e lo stesso nomina, quale <strong>Responsabile del trattamento dei dati</strong>, l'<strong>Amministratore pro-tempore</strong>.</p>

  <h2>Informativa ai fornitori e dipendenti</h2>

  <p>Viene esplicitato che i dati personali dei <strong>dipendenti</strong> e dei <strong>fornitori</strong> sono legittimamente trattati sulla base di quanto previsto all'<strong>art. 6 commi b) e c)</strong> (motivi di legge e/o di esecuzione del contratto), poiché le finalità dei trattamenti sono esclusivamente quelle <strong>strettamente connesse</strong> ai suddetti ambiti.</p>


</body>
</html>
`, { waitUntil: 'networkidle0' });



   const pdf = await page.pdf({
  format: "A4",
  printBackground: true,
  displayHeaderFooter: true,
  margin: {
    top: '120px',
    bottom: '60px',
    left: '45px',
    right: '45px'
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
        INFORMATIVA SUL TRATTAMENTO DEI DATI PERSONALI
      </div>
      <div style="
        font-size: 12px;
        font-style: italic;
        margin-top: 3px;
        line-height: 1.2;
      ">
        Regolamento Europeo UE 2016/679 sul trattamento dei dati personali
      </div>
    </div>
  </div>
`,


  footerTemplate: `
    <div style="font-size:10px; text-align:center; width:100%;">
      Documento generato il ${dataOggi} | Reg. UE 2016/679
    </div>
  `
});



    await browser.close();

    const path = `pdfs/${condominioId}_informativa-privacy.pdf`;

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
