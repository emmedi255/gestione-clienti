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

export async function generateTrattamentiPdf({
  user,
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

    const sezione03 = formData.sezione03;

    // 🔧 Costruisce frase completa dalla sezione 03
    const buildSezione03Frase = (sezione03) => {
      const parts = [];

      // 📁 FORMATI (elettronico/cartaceo)
      const formati = [];
      if (sezione03.elettronica?.enabled) formati.push("elettronico");
      if (sezione03.cartacea?.enabled) formati.push("cartaceo");

      if (formati.length > 0) {
        parts.push(`Dati conservati in formato ${formati.join(", ")}`);
      }

      // ☁️ Cloud/Server + Autenticazione
      if (sezione03.elettronica?.enabled) {
        const eleCloud = [];
        if (sezione03.elettronica?.serverLocale?.checked) {
          const auth = sezione03.elettronica.serverLocale.autenticazione
            ? "con autenticazione"
            : sezione03.elettronica.serverLocale.noAutenticazione
              ? "senza autenticazione"
              : "";
          eleCloud.push(`server locale ${auth}`);
        }
        if (sezione03.elettronica?.cloud?.checked) {
          const auth = sezione03.elettronica.cloud.autenticazione
            ? "con autenticazione"
            : sezione03.elettronica.cloud.noAutenticazione
              ? "senza autenticazione"
              : "";
          eleCloud.push(`cloud ${auth}`);
        }
        if (eleCloud.length > 0) {
          parts.push(`trattati su ${eleCloud.join(" e ")}`);
        }
      }

      // 🗄️ Archivio cartaceo
      if (sezione03.cartacea?.enabled) {
        let cartacea = "";
        if (sezione03.cartacea.archivio) {
          const cartaceaArchivio = "sede amministratore";
          cartacea += cartaceaArchivio;
        }
        if (sezione03.cartacea?.altro) {
          const cartaceaAltro = "," + sezione03.cartacea.altro;
          cartacea += cartaceaAltro;
        }
        parts.push("archivio cartaceso tenuto presso:" + cartacea);
      }

      // 🔒 Misure sicurezza (password + altro)
      const sicurezzaParts = [];
      if (sezione03.elettronica?.serverLocale?.password)
        sicurezzaParts.push("password server locale");

      if (sezione03.elettronica?.cloud?.password)
        sicurezzaParts.push("password cloud");
      // Lista sicurezza generale
      const genSicurezza = [];
      if (sezione03.sicurezza?.armadio) genSicurezza.push("armadio ignifugo");
      if (sezione03.sicurezza?.backup) genSicurezza.push("backup periodici");
      if (sezione03.sicurezza?.password) genSicurezza.push("strong-password");
      if (sezione03.sicurezza?.cambioPassword)
        genSicurezza.push("cambio credenziali");
      if (sezione03.sicurezza?.antivirus) genSicurezza.push("antivirus");
      if (sezione03.sicurezza?.firewall) genSicurezza.push("firewall");
      if (sezione03.sicurezza?.screensaver) genSicurezza.push("screensaver");

      if (genSicurezza.length > 0) {
        sicurezzaParts.push(genSicurezza.join("; "));
      }

      // Altro sicurezza
      if (sezione03.sicurezza?.altro) {
        sicurezzaParts.push(`${sezione03.sicurezza.altro.trim()}`);
      }

      if (sicurezzaParts.length > 0) {
        parts.push(`con misure sicurezza: ${sicurezzaParts.join("; ")}`);
      }

      // 🔔 Altro elettronica (server/cloud)
      const altroElettronica = [];
      if (sezione03.elettronica.serverLocale?.altro) {
        altroElettronica.push(
          `"${sezione03.elettronica.serverLocale.altro.trim()}" (server locale)`,
        );
      }
      if (sezione03.elettronica.cloud?.altro) {
        altroElettronica.push(
          `"${sezione03.elettronica.cloud.altro.trim()}" (cloud)`,
        );
      }
      if (altroElettronica.length > 0) {
        parts.push(`altre misure: ${altroElettronica.join("; ")}`);
      }

      return parts.length > 0
        ? parts.join("; ") + "."
        : "Nessuna informazione specificata.";
    };

    // Costruisci frase completa sezione 03
    const fraseSezione03 = buildSezione03Frase(sezione03);

    // Sostituisci tutte le celle dell'ultima colonna
    const fraseMisureSicurezza = fraseSezione03;

    await page.setContent(
      `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <title>Registro dei trattamenti</title>
  <style>
    @page {
      margin: 120px 45px 60px 45px;
    }

    body {
      font-family: "Times New Roman", serif;
      font-size: 11px;
      line-height: 1.5;
      color: #000;
    }

    /* HEADER CON LOGO E TITOLO */
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 80px;
      border-bottom: 1px solid #bbb;
      display: flex;
      align-items: center;
      padding: 0 20px;
      box-sizing: border-box;
    }

    .header-logo {
      height: 45px;
      margin-right: 15px;
    }

    .header-text {
      font-size: 16px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .sub-header {
      font-size: 11px;
      margin-top: 3px;
      font-style: italic;
    }

    h2 {
      font-size: 13px;
      text-align: center;
      margin: 20px 0 5px;
      text-transform: uppercase;
    }

    .riga-intestazione {
      font-size: 10px;
      text-align: center;
      margin-bottom: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      margin-bottom: 25px;
    }

    th, td {
      border: 1px solid #000;
      padding: 6px 4px;
      vertical-align: top;
      word-break: break-word;      /* va a capo se la parola è lunga */
      overflow-wrap: break-word;   /* compatibilità */
    
}
  

    th {
      background-color: #4472C4;
      font-size: 10px;
      text-transform: uppercase;
      text-align: center;
      color: #F3F4F7
    }

    td {
      font-size: 10px;
    }

    .col-small {
      width: 10%;
    }

    .col-medium {
      width: 15%;
    }

    .col-large {
      width: 20%;
    }

    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>

  <!-- CONTENUTO: sposta verso il basso rispetto all'header -->
  <div>

    <!-- BLOCCO 1: REGISTRO DEL TITOLARE -->
    <h2>Registro dei trattamenti del titolare</h2>
    <div class="riga-intestazione">
      TITOLARE: ${intestazione._indirizzo || ""} - C.F.: ${intestazione.cfCondominio || ""} - Rev. 01.00 del ${dataOggi}
    </div>

    <table>
      <thead>
        <tr>
          <th class="col-medium">Tipologia di trattamento</th>
          <th class="col-large">Finalità e basi legali del trattamento</th>
          <th class="col-medium">Categorie di interessati</th>
          <th class="col-large">Categorie di dati personali</th>
          <th class="col-large">Categorie di destinatari</th>
          <th class="col-small">Trasferimento dati verso paesi terzi</th>
          <th class="col-small">Termini ultimi di cancellazione previsti</th>
          <th class="col-large">Misure di sicurezza tecniche e organizzative</th>
        </tr>
      </thead>
       <tbody>
        <!-- Riga 1: Raccolta dati condomini -->
        <tr>
          <td>Raccolta dati dei condomini, locatari, conduttori, usufruttuari, nudo proprietari</td>
          <td>Attività di gestione condominiale</td>
          <td>Persone presenti all'interno della compagine condominiale</td>
          <td>Dati personali (nome e cognome, codice fiscale, numero di telefono, indirizzo) coordinate bancarie, dati catastali, indirizzi mail, dati di contatto, dati particolari</td>
          <td></td>
          <td>NO</td>
          <td>5 anni - Termine di prescrizione ordinaria art. 2946 c.c.</td>
          <td>${fraseMisureSicurezza}</td>
        </tr>

        <!-- Riga 2: Raccolta dati fornitori -->
        <tr>
          <td>Raccolta dati fornitori</td>
          <td>Fatturazione e gestione contratti dei fornitori</td>
          <td>Fornitori e collaboratori</td>
          <td>Dati personali (dati anagrafici, numero di telefono, indirizzo, email, P.IVA, codice fiscale), coordinate bancarie, dati di fatturazione</td>
          <td>Agenzia delle Entrate, Società di servizi di fatturazione elettronica, società di consulenza contabile e fiscale, consulenti e liberi professionisti anche in forma associata</td>
          <td>NO</td>
          <td>10 anni - Periodo di conservazione dei dati contabili e fiscali previsto dalla normativa vigente.</td>
          <td>${fraseMisureSicurezza}</td>
        </tr>
      </tbody>
    </table>

    <!-- BLOCCO 2: REGISTRO DEL RESPONSABILE (NUOVA PAGINA) -->
    <div class="page-break"></div>

    <h2>Registro dei trattamenti del responsabile</h2>
    <div class="riga-intestazione">
      RESPONSABILE DEL TRATTAMENTO: ${sezione05.amministratore || "Amministratore pro tempore"} - Rev. 01.00 del ${dataOggi}
    </div>

    <table>
      <thead>
        <tr>
          <th class="col-medium">Tipologia di trattamento</th>
          <th class="col-large">Finalità e basi legali del trattamento</th>
          <th class="col-medium">Categorie di interessati</th>
          <th class="col-large">Categorie di dati personali</th>
          <th class="col-large">Categorie di destinatari</th>
          <th class="col-small">Trasferimento dati verso paesi terzi</th>
          <th class="col-small">Termini ultimi di cancellazione previsti</th>
          <th class="col-large">Misure di sicurezza tecniche e organizzative</th>
        </tr>
      </thead>
       <tbody>
        <!-- Riga 1: Raccolta dati condomini -->
        <tr>
          <td>Raccolta dati dei condomini, locatari, conduttori, usufruttuari, nudo proprietari</td>
          <td>Attività di gestione condominiale</td>
          <td>Persone presenti all'interno della compagine condominiale</td>
          <td>Dati personali (nome e cognome, codice fiscale, numero di telefono, indirizzo) coordinate bancarie, dati catastali, indirizzi mail, dati di contatto, dati particolari</td>
          <td></td>
          <td>NO</td>
          <td>5 anni - Termine di prescrizione ordinaria art. 2946 c.c.</td>
          <td>${fraseMisureSicurezza}</td>
        </tr>

        <!-- Riga 2: Raccolta dati fornitori -->
        <tr>
          <td>Raccolta dati fornitori</td>
          <td>Fatturazione e gestione contratti dei fornitori</td>
          <td>Fornitori e collaboratori</td>
          <td>Dati personali (dati anagrafici, numero di telefono, indirizzo, email, P.IVA, codice fiscale), coordinate bancarie, dati di fatturazione</td>
          <td>Agenzia delle Entrate, Società di servizi di fatturazione elettronica, società di consulenza contabile e fiscale, consulenti e liberi professionisti anche in forma associata</td>
          <td>NO</td>
          <td>10 anni - Periodo di conservazione dei dati contabili e fiscali previsto dalla normativa vigente.</td>
          <td>${fraseMisureSicurezza}</td>
        </tr>
      </tbody>
    </table>

  </div>
</body>
</html>
`,
      { waitUntil: "networkidle0" },
    );

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      landscape: true,
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
        REGISTRO DEI TRATTAMENTI
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

    const path = `pdfs/${condominio_id}_registro-trattamenti-condominio.pdf`;

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
