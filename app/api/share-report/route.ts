import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePdfReport, uploadToStorage } from '@/lib/util-functions';

export async function POST(request: Request) {
    try {
        const { assessmentId, recipientEmail, format, includedFeedback, includedSubmission } = await request.json();

        // Fetch the assessment with related data
        const assessment = await prisma.assessment.findUnique({
            where: {
                id: assessmentId,
            },
            include: {
                submission: true,
                student: true,
                criteriaScores: true,
            },
        });

        if (!assessment) {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        }

        // Generate the report content
        const reportContent = {
            studentName: assessment.student.name,
            scores: assessment.criteriaScores,
            feedback: includedFeedback ? assessment.comments : '',
            submission: includedSubmission ? assessment.submission.fileUrl : null,
        };

        // Generate the PDF report
        const reportBuffer = await generatePdfReport(reportContent);

        // Upload the report to storage
        const reportUrl = await uploadToStorage(reportBuffer, `report-${assessmentId}-${Date.now()}.pdf`);

        // Create a record of the shared report
        const sharedReport = await prisma.sharedReport.create({
            data: {
                recipientEmail,
                format: format || 'PDF',
                assessmentId,
                includedFeedback,
                includedSubmission,
            },
        });

        // Here you would typically send an email with the report URL
        // This would require an email service integration

        return NextResponse.json({
            success: true,
            message: `Report shared with ${recipientEmail}`,
            reportUrl,
            sharedReportId: sharedReport.id,
        });
    } catch (error) {
        console.error('Error sharing report:', error);
        return NextResponse.json({ error: 'Failed to share report' }, { status: 500 });
    }
}
