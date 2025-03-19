import { ReportFormat } from '@prisma/client';
import { PDFDocument } from 'pdf-lib';
import { Document, Packer, Paragraph } from 'docx';
import { put } from '@vercel/blob';

export interface ReportContent {
    studentName: string;
    scores: any[];
    feedback?: string;
    submission?: string | null;
}

export interface EmailAttachment {
    filename: string;
    content: Buffer;
}

export interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    attachments: EmailAttachment[];
}

/**
 * Generates a PDF report from the provided content
 */
export async function generatePdfReport(content: ReportContent): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);

    // Format content as a string
    const formattedContent = JSON.stringify(content, null, 2);
    page.drawText(formattedContent, { x: 50, y: 750 });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}

/**
 * Generates a DOCX report from the provided content
 */
export async function generateDocxReport(content: ReportContent): Promise<Buffer> {
    const doc = new Document({
        sections: [
            {
                children: [new Paragraph(JSON.stringify(content, null, 2))],
            },
        ],
    });
    return Packer.toBuffer(doc);
}

/**
 * Generates a report in the specified format
 */
export async function generateReport(content: ReportContent, format: ReportFormat): Promise<Buffer> {
    switch (format) {
        case 'PDF':
            return generatePdfReport(content);
        case 'DOCX':
            return generateDocxReport(content);
        default:
            throw new Error(`Unsupported format: ${format}`);
    }
}

/**
 * Combines multiple reports into a single file
 */
export async function combineReports(reports: Buffer[], format: ReportFormat): Promise<Buffer> {
    if (reports.length === 0) {
        throw new Error('No reports to combine');
    }

    switch (format) {
        case 'PDF':
            return combinePdfReports(reports);
        case 'DOCX':
            return combineDocxReports(reports);
        default:
            throw new Error(`Unsupported format for combining: ${format}`);
    }
}

/**
 * Combines multiple PDF reports into a single PDF
 */
async function combinePdfReports(reports: Buffer[]): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();

    for (const report of reports) {
        const tempPdf = await PDFDocument.load(report);
        const copiedPages = await pdfDoc.copyPages(tempPdf, tempPdf.getPageIndices());
        copiedPages.forEach((page) => pdfDoc.addPage(page));
    }

    return Buffer.from(await pdfDoc.save());
}

/**
 * Combines multiple DOCX reports into a single DOCX
 */
async function combineDocxReports(reports: Buffer[]): Promise<Buffer> {
    const doc = new Document({
        sections: reports.map((buffer) => ({
            children: [new Paragraph(buffer.toString())],
        })),
    });

    return Packer.toBuffer(doc);
}

/**
 * Uploads a file to Vercel Blob storage
 */
export async function uploadToStorage(file: Buffer, fileName: string): Promise<string> {
    const { url } = await put(fileName, file, { access: 'public' });
    return url;
}

/**
 * Sends an email with attachments
 */
export async function sendEmailWithAttachment(options: EmailOptions): Promise<void> {
    return new Promise((resolve) => {
        // Simulate sending email
        console.log(`Sending email to ${options.to} with subject "${options.subject}"`);
        options.attachments.forEach((attachment) => {
            console.log(`Attachment: ${attachment.filename}`);
        });
        resolve();
    });
}
