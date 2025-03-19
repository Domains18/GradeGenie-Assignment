import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ShareReportRequest } from "@/types/index.types";
import { generatePdfReport, sendEmailWithAttachment } from "@/lib/util-functions";



export async function POST(request: Request) {
  try {
    const {
      assessmentId,
      email,
      includeFeedback,
      includeSubmission,
    }: ShareReportRequest = await request.json();

    const assessment = await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
      },
      include: {
        student: true,
        submission: true,
        criteriaScores: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const reportContent = {
      studentName: assessment.student.name,
      scores: assessment.criteriaScores,
      feedback: includeFeedback
        ? assessment.criteriaScores.map((cs) => cs.comments).join("\n")
        : "",
      submission: includeSubmission ? assessment.submission.fileUrl : null,
    };

    const reportBuffer = await generatePdfReport(reportContent);

    // Send email with the report attached
    await sendEmailWithAttachment({
      to: email,
      subject: `Your Assessment Report for ${assessment.student.name}`,
      text: `Please find your assessment report attached.`,
      attachments: [
        {
          filename: `report-${assessmentId}.pdf`,
          content: reportBuffer,
        },
      ],
    });

    // Create a record of the shared report
    const sharedReport = await prisma.sharedReport.create({
      data: {
        recipientEmail: email,
        format: "PDF",
        assessmentId: assessmentId,
        includedFeedback: includeFeedback,
        includedSubmission: includeSubmission,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Report shared with ${email}`,
      sharedReportId: sharedReport.id,
    });
  } catch (error) {
    console.error("Error sharing report:", error);
    return NextResponse.json(
      { error: "Failed to share report" },
      { status: 500 }
    );
  }
}