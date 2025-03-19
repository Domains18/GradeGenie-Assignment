import { NextResponse } from 'next/server';
import { sendAssessmentReport, EmailRequest } from '@/lib/email-service';

export async function POST(request: Request) {
    try {
        const emailRequest: EmailRequest = await request.json();

        if (!emailRequest.assessmentId || !emailRequest.recipientEmail) {
            return NextResponse.json(
                { error: 'Missing required fields: assessmentId or recipientEmail' },
                { status: 400 },
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailRequest.recipientEmail)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        const result = await sendAssessmentReport(emailRequest);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error sending assessment report:', error);
        return NextResponse.json(
            { error: 'Failed to send assessment report', details: (error as Error).message },
            { status: 500 },
        );
    }
}
