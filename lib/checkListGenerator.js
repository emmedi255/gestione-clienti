import puppeteer from "puppeteer";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY,
);

// Logo base64
const logoPath = path.join(process.cwd(), "public", "logo.png");
const imageBuffer = fs.readFileSync(logoPath);
const base64Image = `data:image/png;base64,${imageBuffer.toString("base64")}`;

export async function generateFormCompletoPdf({
  user,
  condominio_id,
  formData,
}) {
  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    const dataOggi = new Date().toLocaleDateString("it-IT");

    // Estrai dati dalle sezioni
    const intestazione = formData.intestazione || {};
    const sezione01 = formData.sezione01 || {};
    const sezione02 = formData.sezione02 || {};
    const sezione03 = formData.sezione03 || {};
    const sezione05 = formData.sezione05 || {};
    const sezione06 = formData.sezione06 || {};
    const sezione07 = formData.sezione07 || {};
    const sezione0711 = formData.sezione0711 || {};
    const sezione8 = formData.sezione8 || {};

    // --------- HELPERS ---------

    const formatDipendenti = () => {
      if (sezione01.nessunDipendente) return "Nessun dipendente";

      const roles = ["portiere", "pulizie", "giardiniere", "manutentore"];
      const list = [];

      roles.forEach((role) => {
        if (sezione01[role]?.checked) {
          const num = sezione01[role].numero || "1";
          list.push(`${role.charAt(0).toUpperCase() + role.slice(1)} (${num})`);
        }
      });

      if (sezione01.altro) {
        list.push(`Altro: ${sezione01.altro}`);
      }

      return list.length > 0
        ? list.join(", ")
        : "Nessun dipendente specificato";
    };

    const formatContratti = () => {
      const items = [];
      if (sezione02.portierato) items.push("Portierato");
      if (sezione02.consulenteLavoro) items.push("Consulente del Lavoro");
      if (sezione02.videosorveglianza) items.push("Videosorveglianza");
      if (sezione02.letturaContatori) items.push("Lettura Contatori");
      if (sezione02.rspp) items.push("RSPP");
      if (sezione02.altro) items.push(`Altro: ${sezione02.altro}`);
      return items.length > 0
        ? items.join(", ")
        : "Nessun contratto specificato";
    };

    const formatModalitaTrattamento = () => {
      const parts = [];

      // Elettronica
      if (sezione03.elettronica?.enabled) {
        const elettronicaParts = [];

        if (sezione03.elettronica.serverLocale?.checked) {
          let authText = "";
          if (sezione03.elettronica.serverLocale.autenticazione)
            authText = " (con autenticazione)";
          else if (sezione03.elettronica.serverLocale.noAutenticazione)
            authText = " (senza autenticazione)";

          const misure = [];
          if (sezione03.elettronica.serverLocale.password)
            misure.push("password");
          if (sezione03.elettronica.serverLocale.altro)
            misure.push(sezione03.elettronica.serverLocale.altro);

          elettronicaParts.push(
            `Server locale${authText}${misure.length > 0 ? " [" + misure.join(", ") + "]" : ""}`,
          );
        }

        if (sezione03.elettronica.cloud?.checked) {
          let authText = "";
          if (sezione03.elettronica.cloud.autenticazione)
            authText = " (con autenticazione)";
          else if (sezione03.elettronica.cloud.noAutenticazione)
            authText = " (senza autenticazione)";

          const misure = [];
          if (sezione03.elettronica.cloud.password) misure.push("password");
          if (sezione03.elettronica.cloud.altro)
            misure.push(sezione03.elettronica.cloud.altro);

          elettronicaParts.push(
            `Cloud${authText}${misure.length > 0 ? " [" + misure.join(", ") + "]" : ""}`,
          );
        }

        if (elettronicaParts.length > 0) {
          parts.push(
            `<strong>Elettronica:</strong> ${elettronicaParts.join("; ")}`,
          );
        }
      }

      // Cartacea
      if (sezione03.cartacea?.enabled) {
        const cartaceaParts = [];
        if (sezione03.cartacea.archivio)
          cartaceaParts.push("sede amministratore");
        if (sezione03.cartacea.altro)
          cartaceaParts.push(sezione03.cartacea.altro);
        parts.push(`<strong>Cartacea:</strong> ${cartaceaParts.join(", ")}`);
      }

      return parts.length > 0
        ? parts.join("<br>")
        : "Nessuna modalità specificata";
    };

    const formatMisureSicurezza = () => {
      const sicurezza = sezione03.sicurezza || {};
      const items = [];

      if (sicurezza.armadio) items.push("Armadio ignifugo");
      if (sicurezza.backup) items.push("Backup periodici");
      if (sicurezza.password) items.push("Strong password");
      if (sicurezza.cambioPassword) items.push("Cambio credenziali");
      if (sicurezza.antivirus) items.push("Antivirus");
      if (sicurezza.firewall) items.push("Firewall");
      if (sicurezza.screensaver) items.push("Screensaver");
      if (sicurezza.altro) items.push(`Altro: ${sicurezza.altro}`);

      return items.length > 0 ? items.join(", ") : "Nessuna misura specificata";
    };
    const renderCheckbox = (checked) =>
      `<span style="
    display:inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid #111827;
    margin-right: 6px;
    vertical-align: middle;
    position: relative;
    background: #ffffff;
    font-size: 10px;
    line-height: 10px;
    text-align: center;
    font-weight: bold;
    color: #dc2626;
    ${checked ? "content: '✕';" : ""}
  ">${checked ? "✕" : ""}</span>`;

    const formatAutorizzati = () => {
      const items = [];
      if (sezione06.dipendenti) items.push("Dipendenti");
      if (sezione06.fornitori) items.push("Fornitori");
      if (sezione06.altro) items.push(`Altro: ${sezione06.altro}`);
      return items.length > 0
        ? items.join(", ")
        : "Nessun autorizzato specificato";
    };

    const formatFornitori = () => {
      const fornitori = sezione8.addedFornitori || [];
      if (fornitori.length === 0)
        return "<tr><td colspan='5' style='text-align: center; color: #666;'>Nessun fornitore aggiunto</td></tr>";

      return fornitori
        .map(
          (f, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${f.ragione_sociale || "-"}</td>
          <td>${f.nome || "-"} ${f.cognome}</td>
          <td>${f.indirizzo || "-"}</td>
          <td>${f.cf || "-"}</td>
          <td>${f.attivita || "-"}</td>
        </tr>
      `,
        )
        .join("");
    };

    // --------- HTML PDF ---------

    await page.setContent(
      `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <title>Check-list Privacy - ${intestazione.condominio || "Condominio"}</title>
  <style>
    @page {
      margin: 100px 40px 80px 40px;
      size: A4;
    }

    body {
      font-family: "Arial", sans-serif;
      font-size: 11px;
      line-height: 1.6;
      color: #333;
    }

    .container {
      max-width: 100%;
    }

    h1 {
      font-size: 22px;
      text-align: center;
      color: #1e40af;
      margin: 0 0 20px 0;
      text-transform: uppercase;
      border-bottom: 3px solid #1e40af;
      padding-bottom: 10px;
    }

    h2 {
      font-size: 14px;
      color: #1e40af;
      margin: 30px 0 15px 0;
      padding: 8px 12px;
      background: #eff6ff;
      border-left: 4px solid #1e40af;
      text-transform: uppercase;
      font-weight: 700;
    }

    .info-block {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    }

    .info-row {
      display: flex;
      margin-bottom: 8px;
      align-items: flex-start;
    }

    .info-label {
      font-weight: 700;
      color: #374151;
      min-width: 180px;
      flex-shrink: 0;
    }

    .info-value {
      color: #1f2937;
      flex: 1;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }

    th {
      background: #1e40af;
      color: white;
      padding: 10px;
      text-align: left;
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
    }

    td {
      border: 1px solid #e5e7eb;
      padding: 8px;
      font-size: 10px;
    }

    tr:nth-child(even) {
      background: #f9fafb;
    }

    .checkbox-yes {
      color: #10b981;
      font-weight: 700;
    }

    .checkbox-no {
      color: #ef4444;
      font-weight: 700;
    }

    .page-break {
      page-break-before: always;
    }

    .footer-note {
      margin-top: 40px;
      padding-top: 15px;
      border-top: 2px solid #e5e7eb;
      font-size: 10px;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    
    <h1>Check-list Privacy</h1>

    <!-- INTESTAZIONE -->
    <h2>Intestazione</h2>
    <div class="info-block">
      <div class="info-row">
        <div class="info-label">Data:</div>
        <div class="info-value">${intestazione.data || "-"}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Condominio:</div>
        <div class="info-value">${intestazione.condominio || "-"}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Indirizzo:</div>
        <div class="info-value">${intestazione.condominio_indirizzo || "-"}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Città:</div>
        <div class="info-value">${intestazione.citta || "-"}, ${intestazione.provincia || "-"} - ${intestazione.cap || "-"}</div>
      </div>
      <div class="info-row">
        <div class="info-label">C.F. Condominio:</div>
        <div class="info-value">${intestazione.cfCondominio || "-"}</div>
      </div>
    </div>

  <!-- SEZ. 01 - DIPENDENTI -->
<h2>Sez. 01 – Dipendenti Condominiali</h2>
<div class="info-block">
  <div class="info-row">
    <div class="info-label">Nessun dipendente:</div>
    <div class="info-value">
      ${renderCheckbox(sezione01.nessunDipendente)} Nessun dipendente
    </div>
  </div>

  <div class="info-row">
    <div class="info-label">Portiere:</div>
    <div class="info-value">
      ${renderCheckbox(sezione01.portiere?.checked)} N° dipendenti: ${sezione01.portiere?.numero || ""}
    </div>
  </div>

  <div class="info-row">
    <div class="info-label">Pulizie:</div>
    <div class="info-value">
      ${renderCheckbox(sezione01.pulizie?.checked)} N° dipendenti: ${sezione01.pulizie?.numero || ""}
    </div>
  </div>

  <div class="info-row">
    <div class="info-label">Giardiniere:</div>
    <div class="info-value">
      ${renderCheckbox(sezione01.giardiniere?.checked)} N° dipendenti: ${sezione01.giardiniere?.numero || ""}
    </div>
  </div>

  <div class="info-row">
    <div class="info-label">Manutentore:</div>
    <div class="info-value">
      ${renderCheckbox(sezione01.manutentore?.checked)} N° dipendenti: ${sezione01.manutentore?.numero || ""}
    </div>
  </div>

  ${
    sezione01.altro
      ? `
  <div class="info-row">
    <div class="info-label">Altro:</div>
    <div class="info-value">
      ${renderCheckbox(true)} ${sezione01.altro}
    </div>
  </div>`
      : `
  <div class="info-row">
    <div class="info-label">Altro:</div>
    <div class="info-value">
      ${renderCheckbox(false)} Nessuno
    </div>
  </div>`
  }
</div>


    <!-- SEZ. 02 - CONTRATTI/FORNITORI -->
<h2>Sez. 02 – Contratti / Fornitori</h2>
<div class="info-block">
  <div class="info-row">
    <div class="info-label">Portierato:</div>
    <div class="info-value">
      ${renderCheckbox(sezione02.portierato)} Portierato
    </div>
  </div>

  <div class="info-row">
    <div class="info-label">Consulente del Lavoro:</div>
    <div class="info-value">
      ${renderCheckbox(sezione02.consulenteLavoro)} Consulente del Lavoro
    </div>
  </div>

  <div class="info-row">
    <div class="info-label">Videosorveglianza:</div>
    <div class="info-value">
      ${renderCheckbox(sezione02.videosorveglianza)} Videosorveglianza
    </div>
  </div>

  <div class="info-row">
    <div class="info-label">Lettura Contatori:</div>
    <div class="info-value">
      ${renderCheckbox(sezione02.letturaContatori)} Lettura Contatori
    </div>
  </div>

  <div class="info-row">
    <div class="info-label">RSPP:</div>
    <div class="info-value">
      ${renderCheckbox(sezione02.rspp)} RSPP
    </div>
  </div>

  ${
    sezione02.altro
      ? `
  <div class="info-row">
    <div class="info-label">Altro:</div>
    <div class="info-value">
      ${renderCheckbox(true)} ${sezione02.altro}
    </div>
  </div>`
      : `
  <div class="info-row">
    <div class="info-label">Altro:</div>
    <div class="info-value">
      ${renderCheckbox(false)} Nessuno
    </div>
  </div>`
  }
</div>
<div class="page-break"></div>

    <!-- SEZ. 03 - MODALITÀ TRATTAMENTO -->
    <h2>Sez. 03 – Modalità di Trattamento dei Dati Personali</h2>
    <div class="info-block">
      <!-- ELETTRONICA -->
      <div class="info-row">
        <div class="info-label">Elettronica:</div>
       
      </div>

      <!-- SERVER LOCALE -->
      <div class="info-row">
        <div class="info-label">Server locale:</div>
        <div class="info-value">
          ${renderCheckbox(sezione03.elettronica?.serverLocale?.autenticazione)} Con autenticazione<br/>
          ${renderCheckbox(sezione03.elettronica?.serverLocale?.noAutenticazione)} Senza autenticazione<br/>
          ${renderCheckbox(sezione03.elettronica?.serverLocale?.password)} Password<br/>
          ${
            sezione03.elettronica?.serverLocale?.altro
              ? `${renderCheckbox(true)} Altro: ${sezione03.elettronica.serverLocale.altro}`
              : `${renderCheckbox(false)} Altro`
          }
        </div>
      </div>

      <!-- CLOUD -->
      <div class="info-row">
        <div class="info-label">Cloud:</div>
        <div class="info-value">
          ${renderCheckbox(sezione03.elettronica?.cloud?.autenticazione)} Con autenticazione<br/>
          ${renderCheckbox(sezione03.elettronica?.cloud?.noAutenticazione)} Senza autenticazione<br/>
          ${renderCheckbox(sezione03.elettronica?.cloud?.password)} Password<br/>
          ${
            sezione03.elettronica?.cloud?.altro
              ? `${renderCheckbox(true)} Altro: ${sezione03.elettronica.cloud.altro}`
              : `${renderCheckbox(false)} Altro`
          }
        </div>
      </div>

      <!-- CARTACEA -->
      <div class="info-row">
        <div class="info-label">Cartacea:</div>
        <div class="info-value">
          ${renderCheckbox(sezione03.cartacea?.archivio)} Archivio presso sede amministratore<br/>
          ${
            sezione03.cartacea?.altro
              ? `${renderCheckbox(true)} Altro: ${sezione03.cartacea.altro}`
              : `${renderCheckbox(false)} Altro`
          }
        </div>
      </div>

      <!-- MISURE DI SICUREZZA GENERALI -->
      <div class="info-row" style="margin-top:10px;">
        <div class="info-label">Misure di sicurezza:</div>
        <div class="info-value">
          ${renderCheckbox(sezione03.sicurezza?.armadio)} Armadio ignifugo<br/>
          ${renderCheckbox(sezione03.sicurezza?.backup)} Backup periodici<br/>
          ${renderCheckbox(sezione03.sicurezza?.password)} Strong password<br/>
          ${renderCheckbox(sezione03.sicurezza?.cambioPassword)} Cambio credenziali<br/>
          ${renderCheckbox(sezione03.sicurezza?.antivirus)} Antivirus<br/>
          ${renderCheckbox(sezione03.sicurezza?.firewall)} Firewall<br/>
          ${renderCheckbox(sezione03.sicurezza?.screensaver)} Screensaver<br/>
          ${
            sezione03.sicurezza?.altro
              ? `${renderCheckbox(true)} Altro: ${sezione03.sicurezza.altro}`
              : `${renderCheckbox(false)} Altro`
          }
        </div>
      </div>
    </div>

    <!-- SEZ. 04 - PIATTAFORME WEB -->
    <h2>Sez. 04 – Piattaforme Web</h2>
    <div class="info-block">
      <div class="info-row">
        <div class="info-label">Piattaforme per assemblee online:</div>
        <div class="info-value ${formData.sezione04 ? "checkbox-yes" : "checkbox-no"}">
          ${formData.sezione04 ? "SÌ" : "NO"}
        </div>
      </div>
    </div>

    <!-- SEZ. 05 - NOMINA RESPONSABILE -->
    <h2>Sez. 05 – Nomina Responsabile</h2>
    <div class="info-block">
      <div class="info-row">
        <div class="info-label">Responsabile:</div>
        <div class="info-value">${sezione05.amministratore || "-"}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Ragione sociale:</div>
        <div class="info-value">${sezione05.specifica || "-"}</div>
      </div>
    </div>
<div class="page-break"></div>

   <!-- SEZ. 06 - AUTORIZZATI -->
<h2>Sez. 06 – Autorizzati al Trattamento</h2>
<div class="info-block">
  <div class="info-row">
    <div class="info-label">Dipendenti:</div>
    <div class="info-value">
      ${renderCheckbox(sezione06.dipendenti)} Dipendenti
    </div>
  </div>

  <div class="info-row">
    <div class="info-label">Fornitori:</div>
    <div class="info-value">
      ${renderCheckbox(sezione06.fornitori)} Fornitori
    </div>
  </div>

  ${
    sezione06.altro
      ? `
  <div class="info-row">
    <div class="info-label">Altro:</div>
    <div class="info-value">
      ${renderCheckbox(true)} ${sezione06.altro}
    </div>
  </div>`
      : `
  <div class="info-row">
    <div class="info-label">Altro:</div>
    <div class="info-value">
      ${renderCheckbox(false)} Nessuno
    </div>
  </div>`
  }
</div>


    <!-- SEZ. 07 - STUDIO AMMINISTRATORE -->
    <h2>Sez. 07 – Studio Amministratore</h2>
    <div class="info-block">
      <div class="info-row">
        <div class="info-label">Indirizzo studio:</div>
        <div class="info-value">${sezione07.indirizzoStudio || "-"}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Sede legale:</div>
        <div class="info-value">${sezione07.sedeLegale || "-"}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Sede operativa:</div>
        <div class="info-value">${sezione07.sedeOperativa || "-"}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Codice univoco:</div>
        <div class="info-value">${sezione07.codiceUnivoco || "-"}</div>
      </div>
    </div>

    <!-- SEZ. 07.1 - VIDEOSORVEGLIANZA -->
    <h2>Sez. 07.1 – Videosorveglianza</h2>
    <div class="info-block">
      <div class="info-row">
        <div class="info-label">Presenza videosorveglianza:</div>
        <div class="info-value ${formData.sezione071 ? "checkbox-yes" : "checkbox-no"}">
          ${formData.sezione071 ? "SÌ" : "NO"}
        </div>
      </div>
    </div>

    <!-- SEZ. 07.1.1 - ISPETTORATO -->
    <h2>Sez. 07.1.1 – Ispettorato del Lavoro</h2>
    <div class="info-block">
      <div class="info-row">
        <div class="info-label">Autorizzazione richiesta:</div>
        <div class="info-value ${sezione0711.valore ? "checkbox-yes" : "checkbox-no"}">
          ${sezione0711.valore ? "SÌ" : "NO"}
        </div>
      </div>
    </div>

<h2>Note</h2>
    <div class="info-block">
      ${
        sezione0711.note
          ? `<div class="info-row">
        <div class="info-value">${sezione0711.note}</div>
      </div>`
          : ""
      }
    </div>

    <!-- SEZ. 08 - FORNITORI -->
    <div class="page-break"></div>
    <h2>Sez. 08 – Fornitori</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 5%;">#</th>
          <th style="width: 25%;">Ragione sociale</th>
          <th style="width: 25%;">Nome e Cognome</th>
          <th style="width: 25%;">indirizzo</th>
          <th style="width: 20%;">p.iva</th>
          <th style="width: 25%;">attività</th>
        </tr>
      </thead>
      <tbody>
        ${formatFornitori()}
      </tbody>
    </table>

    <div class="footer-note">
      Documento generato il ${dataOggi} | Reg. UE 2016/679 (GDPR)
    </div>

  </div>
</body>
</html>`,
      { waitUntil: "networkidle0" },
    );

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      margin: {
        top: "100px",
        bottom: "80px",
        left: "40px",
        right: "40px",
      },
      headerTemplate: `
        <div style="
          display: flex;
          align-items: center;
          font-family: Arial, sans-serif;
          width: 100%;
          height: 70px;
          border-bottom: 2px solid #1e40af;
          padding: 0 40px;
          box-sizing: border-box;
        ">
          <img src="${base64Image}" style="height: 45px; margin-right: 15px;" />
          <div>
            <div style="font-size: 14px; font-weight: bold; color: #1e40af; text-transform: uppercase;">
              Check-list Privacy
            </div>
            <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">
              ${intestazione.condominio || "Condominio"}
            </div>
          </div>
        </div>
      `,
      footerTemplate: `
        <div style="
          font-size: 9px;
          text-align: center;
          width: 100%;
          color: #6b7280;
          padding: 10px 0;
        ">
          Pagina <span class="pageNumber"></span> di <span class="totalPages"></span> | 
          Documento generato il ${dataOggi}
        </div>
      `,
    });

    await browser.close();

    const pathSupabase = `pdfs/${condominio_id}_check-list-privacy.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(pathSupabase, pdf, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    return { success: true, path: pathSupabase };
  } catch (err) {
    console.error("PDF GENERATION ERROR:", err);
    throw new Error(err.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
