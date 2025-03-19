import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {DownloadReportsRequest} from "@/types/index.types";
import generatePd

export async function POST(request: Request) {
  try {
    const {
      assignmentId,
      format,
      includeFeedback,
      includeSubmission,
      combineFiles,
    }: DownloadReportsRequest = await request.json();

    const assessments = await prisma.assessment.findMany({
      where: {
        assignmentId: assignmentId,
      },
      include: {
        submission: true,
        student: true,
        criteriaScores: true,
      },
    });

    // Generate reports
    const reportPromises = assessments.map(async (assessment) => {
      const reportContent = {
        studentName: assessment.student.name,
        scores: assessment.criteriaScores,
        feedback: includeFeedback ? assessment.criteriaScores.map((cs) => cs.comments).join("\n") : "",
        submission: includeSubmission ? assessment.submission.fileUrl : null,
      };

      if (format === "PDF") {
        return await generatePdfReport(reportContent);
      } else if (format === "DOCX") {
        return await generateDocxReport(reportContent);
      }
    });

    const reports = await Promise.all(reportPromises);

    // Combine files if requested
    let downloadUrl: string | null = null;
    if (combineFiles) {
      const combinedReport = await combineReports(reports, format);
      downloadUrl = await uploadToStorage(combinedReport, `combined-reports-${assignmentId}.${format.toLowerCase()}`);
    } else {
      // Upload individual reports
      const individualUrls = await Promise.all(
        reports.map((report, index) =>
          uploadToStorage(report, `report-${assessments[index].id}.${format.toLowerCase()}`)
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

    return NextResponse.json({
      success: true,
      message: `Generated ${assessments.length} reports in ${format} format`,
      downloadUrl,
    });
  } catch (error) {
    console.error("Error generating reports:", error);
    return NextResponse.json(
      { error: "Failed to generate reports" },
      { status: 500 }
    );
  }
}