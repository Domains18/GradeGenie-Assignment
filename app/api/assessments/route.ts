import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { assignmentId: string } }) {
    try {
        const assignmentId = params.assignmentId;

        // Get query parameters for filtering and pagination
        const url = new URL(request.url);
        const status = url.searchParams.get('status');
        const studentId = url.searchParams.get('studentId');
        const limit = url.searchParams.get('limit') ? Number.parseInt(url.searchParams.get('limit')!) : undefined;
        const offset = url.searchParams.get('offset') ? Number.parseInt(url.searchParams.get('offset')!) : undefined;


        const assessments = await prisma.assessment.findMany({
            include: {
                submission: true,
                student: true,
                criteriaScores: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
            take: limit,
            skip: offset,
        });

        // Get total count for pagination
        const totalCount = await prisma.assessment.count();

        return NextResponse.json({
            assessments,
            totalCount,
            limit,
            offset,
        });
    } catch (error) {
        console.error('Error fetching assessments:', error);
        return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
    }
}

// Add a POST endpoint to create or update an assessment
export async function POST(request: Request, { params }: { params: { assignmentId: string } }) {
    try {
        const assignmentId = params.assignmentId;
        const data = await request.json();

        // Validate required fields
        if (!data.submissionId || !data.studentId || !data.userId || data.score === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if assessment already exists
        const existingAssessment = await prisma.assessment.findFirst({
            where: {
                submissionId: data.submissionId,
            },
        });

        let assessment: Awaited<ReturnType<typeof prisma.assessment.findFirst>> | null;

        if (existingAssessment) {
            // Update existing assessment
            assessment = await prisma.assessment.update({
                where: {
                    id: existingAssessment.id,
                },
                data: {
                    score: data.score,
                    comments: data.comments,
                    status: data.status || 'GRADED',
                    updatedAt: new Date(),
                },
                include: {
                    submission: true,
                    student: true,
                },
            });

            // Update or create criteria scores
            if (data.criteriaScores && Array.isArray(data.criteriaScores)) {
                // Delete existing criteria scores
                await prisma.criteriaScore.deleteMany({
                    where: {
                        assessmentId: assessment.id,
                    },
                });

            

                await prisma.criteriaScore.createMany({
                    data: data.criteriaScores.map((cs: any) => ({
                        assessmentId: assessment?.id,
                        criteriaName: cs.criteriaName,
                        score: cs.score,
                        comments: cs.comments,
                    })),
                });
            }
        } else {
            // Create new assessment
            assessment = await prisma.assessment.create({
                data: {
                    assignmentId,
                    submissionId: data.submissionId,
                    studentId: data.studentId,
                    userId: data.userId,
                    score: data.score,
                    comments: data.comments,
                    status: data.status || 'GRADED',
                    criteriaScores:
                        data.criteriaScores && Array.isArray(data.criteriaScores)
                            ? {
                                  create: data.criteriaScores.map((cs: any) => ({
                                      criteriaName: cs.criteriaName,
                                      score: cs.score,
                                      comments: cs.comments,
                                  })),
                              }
                            : undefined,
                },
                include: {
                    submission: true,
                    student: true,
                    criteriaScores: true,
                },
            });
        }

        return NextResponse.json({
            success: true,
            assessment,
        });
    } catch (error) {
        console.error('Error creating/updating assessment:', error);
        return NextResponse.json({ error: 'Failed to create/update assessment' }, { status: 500 });
    }
}
