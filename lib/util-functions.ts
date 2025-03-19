import { ReportFormat } from "@prisma/client";
import { PDFDocument } from "pdf-lib";
import { Document, Packer, Paragraph } from "docx";
import { put } from "@vercel/blob";

// Utility to generate PDF reports
export async function generatePdfReport(content: any): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  page.drawText(content, { x: 50, y: 750 });
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

// Utility to generate DOCX reports
export async function generateDocxReport(content: any): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        children: [new Paragraph(content)],
      },
    ],
  });
  return Packer.toBuffer(doc);
}

// Utility to combine reports
export async function combineReports(
  reports: Buffer[],
  format: ReportFormat
): Promise<Buffer> {
  if (format === "PDF") {
    const pdfDoc = await PDFDocument.create();
    for (const report of reports) {
      const tempPdf = await PDFDocument.load(report);
      const copiedPages = await pdfDoc.copyPages(
        tempPdf,
        tempPdf.getPageIndices()
      );
      copiedPages.forEach((page) => pdfDoc.addPage(page));
    }
    return Buffer.from(await pdfDoc.save());
  } else if (format === "DOCX") {
    const doc = new Document({
      sections: reports.map((buffer) => ({
        children: [new Paragraph(buffer.toString())],
      })),
    });
    return Packer.toBuffer(doc);
  }
  throw new Error("Unsupported format");
}

// Utility to upload files to Vercel Blob
export async function uploadToStorage(
  file: Buffer,
  fileName: string
): Promise<string> {
  const { url } = await put(fileName, file, { access: "public" });
  return url;
}

export async function sendEmailWithAttachment({
  to,
  subject,
  text,
  attachments,
}: {
  to: string;
  subject: string;
  text: string;
  attachments: { filename: string; content: Buffer }[];
}): Promise<void> {
  return new Promise((resolve, reject) => {
    // Simulate sending email
    console.log(`Sending email to ${to} with subject "${subject}"`);
    attachments.forEach((attachment) => {
      console.log(`Attachment: ${attachment.filename}`);
    });
    resolve();
  });
}
