import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const assignmentId = params.assignmentId;

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

    return NextResponse.json(assessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessments" },
      { status: 500 }
    );
  }
}
