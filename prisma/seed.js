import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting seed...')

    // Clean up existing data
    await prisma.sharedReport.deleteMany({})
    await prisma.criteriaScore.deleteMany({})
    await prisma.assessment.deleteMany({})
    await prisma.submission.deleteMany({})
    await prisma.rubricCriteria.deleteMany({})
    await prisma.assignment.deleteMany({})
    await prisma.rubric.deleteMany({})
    await prisma.student.deleteMany({})
    await prisma.class.deleteMany({})
    await prisma.user.deleteMany({})

    // Create educator user
    const educator = await prisma.user.create({
        data: {
            name: 'Serene Williams',
            email: 'serene@gradegenie.com',
            password: 'hashed_password_here', // In a real app, this would be properly hashed
            role: 'EDUCATOR',
        },
    })
    console.log('Created educator:', educator.name)

    // Create a class
    const englishClass = await prisma.class.create({
        data: {
            name: 'English Literature 101',
            description: 'Introduction to English Literature',
            code: 'ENG101',
            userId: educator.id,
        },
    })
    console.log('Created class:', englishClass.name)

    // Create students
    const students = await Promise.all([
        prisma.student.create({
            data: {
                name: 'Emma Johnson',
                email: 'emma.johnson@student.edu',
                classId: englishClass.id,
            },
        }),
        prisma.student.create({
            data: {
                name: 'Noah Williams',
                email: 'noah.williams@student.edu',
                classId: englishClass.id,
            },
        }),
        prisma.student.create({
            data: {
                name: 'Olivia Martinez',
                email: 'olivia.martinez@student.edu',
                classId: englishClass.id,
            },
        }),
    ])
    console.log(`Created ${students.length} students`)

    // Create a rubric
    const literatureRubric = await prisma.rubric.create({
        data: {
            name: 'Literature Essay Rubric',
            description: 'Rubric for evaluating literature essays',
            subject: 'English',
            gradeLevel: 'College',
            userId: educator.id,
            criteria: {
                create: [
                    {
                        name: 'Analytical Argument',
                        description: 'Clarity and strength of the analytical argument',
                        maxScore: 5,
                        weight: 1.0,
                    },
                    {
                        name: 'Engagement with Text',
                        description: 'Depth of engagement with the literary text',
                        maxScore: 5,
                        weight: 1.0,
                    },
                    {
                        name: 'Use of Literary Devices',
                        description: 'Effective use and analysis of literary devices',
                        maxScore: 5,
                        weight: 1.0,
                    },
                    {
                        name: 'Academic Writing',
                        description: 'Quality of academic writing style and mechanics',
                        maxScore: 5,
                        weight: 1.0,
                    },
                ],
            },
        },
    })
    console.log('Created rubric:', literatureRubric.name)

    // Create an assignment
    const macbethAssignment = await prisma.assignment.create({
        data: {
            name: 'The Role of Ambition in Macbeth',
            description: 'Write a 1500-word essay analyzing the role of ambition in Shakespeare\'s Macbeth',
            dueDate: new Date('2025-03-07T23:59:59Z'),
            userId: educator.id,
            classId: englishClass.id,
            rubricId: literatureRubric.id,
        },
    })
    console.log('Created assignment:', macbethAssignment.name)

    // Create submissions and assessments
    const submissionsData = [
        {
            student: students[0],
            fileName: 'The_Role_of_Ambition_in_Macbeth_03082025_0338.pdf',
            fileUrl: 'https://app.getgradegenie.com/uploads/assignments/The_Role_of_Ambition_in_Macbeth_03082025_0338.pdf',
            submittedAt: new Date('2025-03-08T03:38:45Z'),
            score: 80,
            comments: `Strengths:
Your essay demonstrates a thorough engagement with Shakespeare's text, and your discussion of ambition in Macbeth is both insightful and well-supported by textual evidence.
Improvement Areas:
While your use of literary devices is effective, the analysis can be further deepened for a more profound impact. Additionally, enhancing your academic writing style can improve clarity and sophistication.
Action Items:
• Delve deeper into the analysis of literary devices by discussing their impact or effectiveness in Shakespeare's portrayal of themes.
• Enhance your academic writing by varying sentence structure and employing more complex syntax.
• Review your work to correct minor grammatical issues, such as subject-verb agreement and punctuation.
Sub-Scores and Justification:
• Analytical Argument (4/5): Your argument is clearly structured and insightful but could offer a more original angle.
• Engagement with Text (5/5): You exhibit profound engagement with textual evidence effectively supporting your interpretations.
• Use of Literary Devices (4/5): You effectively incorporate literary devices, but further exploration can elevate your analysis.
• Academic Writing (3/5): While generally clear, your writing can benefit from further stylistic refinement and proofreading.`,
            criteriaScores: [
                { criteriaName: 'Analytical Argument', score: 4, comments: 'Clearly structured and insightful but could offer a more original angle.' },
                { criteriaName: 'Engagement with Text', score: 5, comments: 'Profound engagement with textual evidence effectively supporting interpretations.' },
                { criteriaName: 'Use of Literary Devices', score: 4, comments: 'Effectively incorporates literary devices, but further exploration needed.' },
                { criteriaName: 'Academic Writing', score: 3, comments: 'Generally clear, but needs stylistic refinement and proofreading.' },
            ]
        },
        {
            student: students[1],
            fileName: 'Analysis_of_Symbolism_in_The_Great_Gatsby_03072025_1542.pdf',
            fileUrl: 'https://app.getgradegenie.com/uploads/assignments/Analysis_of_Symbolism_in_The_Great_Gatsby_03072025_1542.pdf',
            submittedAt: new Date('2025-03-07T15:42:12Z'),
            score: 92,
            comments: 'Excellent analysis of symbolism with strong textual evidence. Consider exploring the historical context more deeply in future essays.',
            criteriaScores: [
                { criteriaName: 'Analytical Argument', score: 5, comments: 'Exceptional analytical framework with original insights.' },
                { criteriaName: 'Engagement with Text', score: 5, comments: 'Deep engagement with the text and its symbolic elements.' },
                { criteriaName: 'Use of Literary Devices', score: 4, comments: 'Strong analysis of symbolism, but could connect to historical context.' },
                { criteriaName: 'Academic Writing', score: 5, comments: 'Excellent academic writing style with minimal errors.' },
            ]
        },
        {
            student: students[2],
            fileName: 'Character_Development_in_Pride_and_Prejudice_03062025_0912.pdf',
            fileUrl: 'https://app.getgradegenie.com/uploads/assignments/Character_Development_in_Pride_and_Prejudice_03062025_0912.pdf',
            submittedAt: new Date('2025-03-06T09:12:33Z'),
            score: 85,
            comments: 'Strong character analysis with good understanding of Austen\'s techniques. Work on paragraph transitions and conclusion strength.',
            criteriaScores: [
                { criteriaName: 'Analytical Argument', score: 4, comments: 'Well-structured analysis with good insights into character development.' },
                { criteriaName: 'Engagement with Text', score: 5, comments: 'Excellent engagement with Austen\'s text and character portrayals.' },
                { criteriaName: 'Use of Literary Devices', score: 4, comments: 'Good analysis of literary techniques, particularly irony and dialogue.' },
                { criteriaName: 'Academic Writing', score: 3, comments: 'Clear writing but needs work on transitions and conclusion.' },
            ]
        },
    ]

    for (const data of submissionsData) {
        const submission = await prisma.submission.create({
            data: {
                fileName: data.fileName,
                fileUrl: data.fileUrl,
                submittedAt: data.submittedAt,
                assignmentId: macbethAssignment.id,
                studentId: data.student.id,
            },
        })

        const assessment = await prisma.assessment.create({
            data: {
                score: data.score,
                comments: data.comments,
                status: 'GRADED',
                submissionId: submission.id,
                assignmentId: macbethAssignment.id,
                studentId: data.student.id,
                userId: educator.id,
            },
        })

        // Create criteria scores
        for (const criteriaScore of data.criteriaScores) {
            await prisma.criteriaScore.create({
                data: {
                    score: criteriaScore.score,
                    comments: criteriaScore.comments,
                    criteriaName: criteriaScore.criteriaName,
                    assessmentId: assessment.id,
                },
            })
        }
    }

    console.log('Created submissions and assessments')

    // Create a shared report example
    await prisma.sharedReport.create({
        data: {
            recipientEmail: 'emma.johnson@student.edu',
            format: 'PDF',
            assessmentId: (await prisma.assessment.findFirst({
                where: {
                    student: {
                        name: 'Emma Johnson'
                    }
                }
            })).id,
            includedFeedback: true,
            includedSubmission: true,
        }
    })

    console.log('Created shared report example')
    console.log('Seeding completed successfully!')
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })