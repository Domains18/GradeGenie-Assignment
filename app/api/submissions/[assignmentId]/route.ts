import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ assignmentId: string }> }) {
    try {

        const submissions = await prisma.submission.findMany({
            include: {
                assessment: {
                    include: {
                        criteriaScores: true,
                    },
                },
                student: true,
            },
        });

        return NextResponse.json(submissions);
    } catch (error) {
        console.error('Error fetching submissions:', error);
        return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }
}
