import PDFDocument from "pdfkit/js/pdfkit.standalone.js"; 
import ExcelJS from "exceljs";

export async function generateCondominioPDFBuffer({ condominio, form }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      doc.font("Helvetica");

      // Intestazione
      doc.fontSize(18).text(condominio.condominio || "Condominio", { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Città: ${condominio.citta || ""} (${condominio.cap || ""} ${condominio.provincia || ""})`);
      doc.text(`CF: ${condominio.cf_condominio || ""}`);
      doc.text(`Amministratore: ${form.sezione05?.amministratore || ""}`);
      doc.moveDown();

      // Puoi aggiungere qui altre sezioni del form come tabelle o testo
      doc.text("Dettagli dipendenti:");
      if (form.sezione01) {
        doc.text(`Portiere: ${form.sezione01.portiere.numero || 0}`);
        doc.text(`Pulizie: ${form.sezione01.pulizie.numero || 0}`);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function generateCondominioExcelBuffer({ condominio, form }) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Condominio");

  sheet.addRow(["Campo", "Valore"]);
  sheet.addRow(["Condominio", condominio.condominio || ""]);
  sheet.addRow(["Città", condominio.citta || ""]);
  sheet.addRow(["CAP", condominio.cap || ""]);
  sheet.addRow(["Provincia", condominio.provincia || ""]);
  sheet.addRow(["CF Condominio", condominio.cf_condominio || ""]);
  sheet.addRow(["Amministratore", form.sezione05?.amministratore || ""]);

  // Dettagli dipendenti
  if (form.sezione01) {
    sheet.addRow(["Portiere", form.sezione01.portiere.numero || 0]);
    sheet.addRow(["Pulizie", form.sezione01.pulizie.numero || 0]);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
