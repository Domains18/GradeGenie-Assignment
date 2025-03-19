import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { generateReport, ReportContent } from '@/lib/report-utils';

export interface EmailRequest {
    assessmentId?: string;
    recipientEmail: string;
    format: 'PDF' | 'DOCX';
    includedFeedback: boolean;
    includedSubmission: boolean;
    customMessage?: string;
}

/**
 * Creates and configures a nodemailer transporter
 */
function createTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

/**
 * Sends an email with the provided options
 */
async function sendEmail(options: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    attachments?: Array<{
        filename: string;
        content: Buffer;
        contentType?: string;
    }>;
}) {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"Grade Genie" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
    };

    return transporter.sendMail(mailOptions);
}

/**
 * Fetches assessment details for an email
 */
async function fetchAssessmentDetails(assessmentId: string) {
    const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
        include: {
            submission: true,
            student: true,
            criteriaScores: true,
            assignment: true,
        },
    });

    if (!assessment) {
        throw new Error(`Assessment not found with ID: ${assessmentId}`);
    }

    return assessment;
}

/**
 * Sends an assessment report via email
 */
export async function sendAssessmentReport(request: EmailRequest) {
    if (!request.assessmentId || !request.recipientEmail) {
        throw new Error('Missing required fields: assessmentId or recipientEmail');
    }

    // Fetch assessment details from database
    const assessment = await fetchAssessmentDetails(request.assessmentId);

    // Prepare report content
    const reportContent: ReportContent = {
        studentName: assessment.student.name,
        scores: assessment.criteriaScores,
        feedback: request.includedFeedback ? assessment.criteriaScores.map((cs) => cs.comments).join('\n') : undefined,
        submission: request.includedSubmission ? assessment.submission.fileUrl : null,
    };

    // Generate report based on format
    const reportBuffer = await generateReport(reportContent, request.format);

    // Prepare email with attachment
    const emailOptions = {
        to: request.recipientEmail,
        subject: `Assessment Report for ${assessment.student.name} - ${assessment.assignment.name}`,
        text: request.customMessage || `Please find attached the assessment report for ${assessment.student.name}.`,
        html: `
      <h2>Assessment Report</h2>
      <p>Student: ${assessment.student.name}</p>
      <p>Assignment: ${assessment.assignment.name}</p>
      <p>${request.customMessage || `Please find attached the assessment report for ${assessment.student.name}.`}</p>
      <p>This report was generated and sent automatically by Grade Genie.</p>
    `,
        attachments: [
            {
                filename: `${assessment.student.name.replace(/\s+/g, '_')}_Report.${request.format.toLowerCase()}`,
                content: reportBuffer,
                contentType:
                    request.format === 'PDF'
                        ? 'application/pdf'
                        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            },
        ],
    };

    // Send email
    await sendEmail(emailOptions);
    console.log(`Email sent to ${request.recipientEmail} with assessment report for ${assessment.student.name}`);

    return {
        success: true,
        message: `Assessment report for ${assessment.student.name} has been sent to ${request.recipientEmail}`,
    };
}
