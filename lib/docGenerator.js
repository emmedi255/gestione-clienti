// lib/docGenerator.js
import PDFDocument from "pdfkit/js/pdfkit.standalone.js"; // usa versione standalone
import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";

export async function generatePDFBuffer(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      doc.font("Helvetica"); // usa font built-in

      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      doc.fontSize(20).text("Dati Cliente", { underline: true });
      doc.moveDown();
      doc.fontSize(14).text(`Nome Cliente: ${data.name || ""}`);
      doc.text(`Azienda: ${data.company || ""}`);
      doc.text(`Partita IVA: ${data.vat_number || ""}`);
      doc.text(`Indirizzo: ${data.address || ""}`);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function generateExcelBuffer(data) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Dati Cliente");

  sheet.addRow(["Campo", "Valore"]);
  sheet.addRow(["Azienda", data.company || ""]);
  sheet.addRow(["Partita IVA", data.vat_number || ""]);
  sheet.addRow(["Indirizzo", data.address || ""]);

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
