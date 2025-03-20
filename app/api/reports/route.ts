import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DownloadReportsRequest } from '@/types/index.types';
import { ReportContent, generateReport, uploadToStorage, combineReports } from '@/lib/report-utils';




export async function POST(request: Request) {
    try {
        const { assignmentId, format, includeFeedback, includeSubmission, combineFiles }: DownloadReportsRequest =
            await request.json();

        if (!format) {
            return NextResponse.json({ error: 'Missing required format field' }, { status: 400 });
        }

        const where = assignmentId ? { assignmentId } : {};

        const assessments = await prisma.assessment.findMany({
            where,
            include: {
                submission: true,
                student: true,
                criteriaScores: true,
            },
        });

        if (assessments.length === 0) {
            return NextResponse.json({ error: 'No assessments found' }, { status: 404 });
        }

        const reportContents: ReportContent[] = assessments.map((assessment) => ({
            studentName: assessment.student.name,
            scores: assessment.criteriaScores,
            feedback: includeFeedback ? assessment.criteriaScores.map((cs) => cs.comments).join('\n') : undefined,
            submission: includeSubmission ? assessment.submission.fileUrl : null,
        }));

        const reportPromises = reportContents.map((content) => generateReport(content, format));

        const reports = await Promise.all(reportPromises);
        const validReports = reports.filter(Boolean) as Buffer[];

        if (validReports.length === 0) {
            return NextResponse.json({ error: 'Failed to generate any valid reports' }, { status: 500 });
        }

        const fileIdentifier = assignmentId || `all-reports-${Date.now()}`;

        if (combineFiles) {
            return await handleCombinedReports(validReports, format, fileIdentifier, assessments.length);
        } else {
            return await handleIndividualReports(validReports, format, assessments);
        }
    } catch (error) {
        console.error('Error generating reports:', error);
        return NextResponse.json(
            { error: 'Failed to generate reports', details: (error as Error).message },
            { status: 500 },
        );
    }
}
async function handleCombinedReports(
    reports: Buffer[],
    format: string,
    fileIdentifier: string,
    assessmentCount: number,
): Promise<NextResponse> {
    const combinedReport = await combineReports(reports, format as any);
    const downloadUrl = await uploadToStorage(
        combinedReport,
        `combined-reports-${fileIdentifier}.${format.toLowerCase()}`,
    );

    return NextResponse.json({
        success: true,
        message: `Generated and combined ${assessmentCount} reports in ${format} format`,
        downloadUrl,
    });
}


async function handleIndividualReports(reports: Buffer[], format: string, assessments: any[]): Promise<NextResponse> {
    const individualUrls = await Promise.all(
        reports.map((report, index) =>
            uploadToStorage(report, `report-${assessments[index].id}.${format.toLowerCase()}`),
        ),
    );

    return NextResponse.json({
        success: true,
        message: `Generated ${assessments.length} reports in ${format} format`,
        individualReports: assessments.map((assessment, index) => ({
            studentName: assessment.student.name,
            downloadUrl: individualUrls[index],
        })),
    });
}
