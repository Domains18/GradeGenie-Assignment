import { ReportFormat } from '@prisma/client';
import {
    Document,
    Packer,
    Paragraph
} from 'docx';
import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib';

export interface ReportContent {
    studentName: string;
    scores: Array<{
        criteriaId: string;
        criteriaName: string;
        score: number;
        maxScore: number;
        comments: string;
    }>;
    feedback?: string;
    submission?: string | null;
    assignmentTitle?: string;
    courseName?: string;
    instructorName?: string;
    submissionDate?: Date;
    assessmentDate?: Date;
}

export async function generatePdfReport(content: ReportContent): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();

    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    let page = pdfDoc.addPage([612, 792]); // US Letter size

    const primaryColor = rgb(0.07, 0.4, 0.56); // Dark blue
    const secondaryColor = rgb(0.8, 0.85, 0.9); // Light blue/gray
    const textColor = rgb(0.2, 0.2, 0.2); // Dark gray
    const accentColor = rgb(0.2, 0.6, 0.4); // Green for good scores

    page.drawRectangle({
        x: 0,
        y: 720,
        width: 612,
        height: 72,
        color: primaryColor,
    });

    page.drawText('GRADE GENIE', {
        x: 30,
        y: 755,
        size: 24,
        font: helveticaBold,
        color: rgb(1, 1, 1), // White
    });

    page.drawText('ASSESSMENT REPORT', {
        x: 30,
        y: 730,
        size: 14,
        font: helveticaFont,
        color: rgb(1, 1, 1), // White
    });

    page.drawRectangle({
        x: 30,
        y: 650,
        width: 552,
        height: 60,
        color: secondaryColor,
        borderColor: primaryColor,
        borderWidth: 1,
    });

    drawText(page, 'Student:', 40, 685, 12, helveticaBold, textColor);
    drawText(page, content.studentName, 110, 685, 12, helveticaFont, textColor);

    drawText(page, 'Assignment:', 40, 665, 12, helveticaBold, textColor);
    drawText(page, content.assignmentTitle || 'Assessment', 110, 665, 12, helveticaFont, textColor);

    if (content.courseName) {
        drawText(page, 'Course:', 300, 685, 12, helveticaBold, textColor);
        drawText(page, content.courseName, 350, 685, 12, helveticaFont, textColor);
    }

    if (content.submissionDate) {
        drawText(page, 'Date:', 300, 665, 12, helveticaBold, textColor);
        drawText(page, formatDate(content.submissionDate), 350, 665, 12, helveticaFont, textColor);
    }

    // Section title - Scores
    drawSectionTitle(page, 'Assessment Scores', 30, 620, helveticaBold, primaryColor);

    // Draw score table
    const scoreStartY = 590;
    const rowHeight = 50;
    let currentY = scoreStartY;

    // Draw table header
    page.drawRectangle({
        x: 30,
        y: currentY,
        width: 552,
        height: 25,
        color: primaryColor,
    });

    drawText(page, 'Criteria', 40, currentY + 8, 12, helveticaBold, rgb(1, 1, 1));
    drawText(page, 'Score', 400, currentY + 8, 12, helveticaBold, rgb(1, 1, 1));
    drawText(page, 'Comments', 480, currentY + 8, 12, helveticaBold, rgb(1, 1, 1));

    currentY -= 25;

    // Draw scores
    let oddRow = true;
    for (const item of content.scores) {
        // Calculate percentage for visual representation
        const percentage = (item.score / item.maxScore) * 100;
        const scoreColor = getScoreColor(percentage);

        // Background for alternating rows
        page.drawRectangle({
            x: 30,
            y: currentY - rowHeight,
            width: 552,
            height: rowHeight,
            color: oddRow ? rgb(0.97, 0.97, 0.97) : rgb(1, 1, 1),
        });

        // Draw criteria name
        drawText(page, item.criteriaName, 40, currentY - 15, 11, helveticaBold, textColor);

        // Draw score
        drawText(
            page,
            `${item.score}/${item.maxScore} (${percentage.toFixed(1)}%)`,
            400,
            currentY - 15,
            11,
            helveticaBold,
            scoreColor,
        );

        // Draw comments (truncated if too long)
        const comments = item.comments || 'No comments provided';
        const truncatedComments = truncateText(comments, 40);
        drawText(page, truncatedComments, 480, currentY - 15, 10, helveticaOblique, textColor);

        // If comments are longer, add more lines
        if (comments.length > 40) {
            const secondLine = comments.substring(40, 80);
            if (secondLine) {
                drawText(page, truncateText(secondLine, 40), 480, currentY - 30, 10, helveticaOblique, textColor);
            }
        }

        // Move to next row
        currentY -= rowHeight;
        oddRow = !oddRow;

        // Add a new page if we're running out of space
        if (currentY < 100) {
            page = pdfDoc.addPage([612, 792]);
            currentY = 720;

            // Add continuation header
            page.drawRectangle({
                x: 0,
                y: 720,
                width: 612,
                height: 30,
                color: primaryColor,
            });

            drawText(page, 'Assessment Report (Continued)', 30, 730, 14, helveticaBold, rgb(1, 1, 1));
        }
    }

    const totalScore = content.scores.reduce((sum, item) => sum + item.score, 0);
    const totalMaxScore = content.scores.reduce((sum, item) => sum + item.maxScore, 0);
    const totalPercentage = (totalScore / totalMaxScore) * 100;

    currentY -= 20;
    page.drawRectangle({
        x: 30,
        y: currentY - 30,
        width: 552,
        height: 30,
        color: primaryColor,
    });

    drawText(page, 'TOTAL SCORE:', 40, currentY - 10, 14, helveticaBold, rgb(1, 1, 1));
    drawText(
        page,
        `${totalScore}/${totalMaxScore} (${totalPercentage.toFixed(1)}%)`,
        400,
        currentY - 10,
        14,
        helveticaBold,
        rgb(1, 1, 1),
    );

    if (content.feedback) {
        currentY -= 60;

        if (currentY < 150) {
            page = pdfDoc.addPage([612, 792]);
            currentY = 720;
        }

        drawSectionTitle(page, 'Overall Feedback', 30, currentY, helveticaBold, primaryColor);

        // Feedback box
        page.drawRectangle({
            x: 30,
            y: currentY - 100,
            width: 552,
            height: 80,
            borderColor: primaryColor,
            borderWidth: 1,
            color: rgb(0.98, 0.98, 0.98),
        });

        drawWrappedText(
            page,
            content.feedback,
            40,
            currentY - 20,
            10,
            helveticaFont,
            textColor,
            532, 
            80, 
        );
    }

    const footerY = 30;
    page.drawLine({
        start: { x: 30, y: footerY + 15 },
        end: { x: 582, y: footerY + 15 },
        thickness: 1,
        color: primaryColor,
    });

    drawText(page, 'Generated by Grade Genie Assessment System', 30, footerY, 8, helveticaFont, textColor);

    drawText(page, `Report generated on ${formatDate(new Date())}`, 400, footerY, 8, helveticaFont, textColor);

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}

function drawText(page: PDFPage, text: string, x: number, y: number, size: number, font: PDFFont, color: any) {
    page.drawText(text, { x, y, size, font, color });
}


function drawSectionTitle(page: PDFPage, title: string, x: number, y: number, font: PDFFont, color: any) {
    drawText(page, title, x, y, 14, font, color);

    page.drawLine({
        start: { x, y: y - 5 },
        end: { x: x + 552, y: y - 5 },
        thickness: 1,
        color,
    });
}


function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}


function getScoreColor(percentage: number) {
    if (percentage >= 90) return rgb(0.2, 0.7, 0.3); // Green for excellent
    if (percentage >= 75) return rgb(0.1, 0.5, 0.7); // Blue for good
    if (percentage >= 60) return rgb(0.9, 0.6, 0.1); // Orange for satisfactory
    return rgb(0.8, 0.2, 0.2); // Red for needs improvement
}

function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function drawWrappedText(
    page: PDFPage,
    text: string,
    x: number,
    y: number,
    size: number,
    font: PDFFont,
    color: any,
    maxWidth: number,
    maxHeight: number,
) {
    const lines = text.split('\n'); 
    let currentY = y;
    const lineHeight = size * 1.2;
    let availableHeight = maxHeight;

    for (const line of lines) {
        const words = line.split(' ');
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const textWidth = font.widthOfTextAtSize(testLine, size);

            if (textWidth > maxWidth && currentLine.length > 0) {
                // Draw the current line and move to the next line
                drawText(page, currentLine, x, currentY, size, font, color);
                currentLine = word;
                currentY -= lineHeight;
                availableHeight -= lineHeight;

                if (availableHeight < 0) {
                    // Stop if we run out of space
                    drawText(page, '...', x, currentY + lineHeight, size, font, color);
                    return;
                }
            } else {
                currentLine = testLine;
            }
        }

        // Draw the remaining text in the current line
        if (currentLine.length > 0 && availableHeight >= 0) {
            drawText(page, currentLine, x, currentY, size, font, color);
            currentY -= lineHeight;
            availableHeight -= lineHeight;

            if (availableHeight < 0) {
                drawText(page, '...', x, currentY + lineHeight, size, font, color);
                return;
            }
        }
    }
}


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
