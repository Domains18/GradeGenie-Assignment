 'use client';

import { type SetStateAction, useState, useEffect } from 'react';
import { Download, Share2, FileText, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

// Define types based on your Prisma schema
interface Student {
    id: string;
    name: string;
    email: string;
}

interface Submission {
    id: string;
    fileName: string;
    fileUrl: string;
    submittedAt: string;
    student: Student;
    assessment?: Assessment;
}

interface CriteriaScore {
    id: string;
    score: number;
    comments?: string;
    criteriaName: string;
}

interface Assessment {
    id: string;
    score: number;
    comments?: string;
    status: 'PENDING' | 'GRADED' | 'REVIEWED';
    createdAt: string;
    updatedAt: string;
    student: Student;
    criteriaScores: CriteriaScore[];
}

export default function AssignmentPage() {
    const params = useParams();
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [email, setEmail] = useState('');
    const [downloadFormat, setDownloadFormat] = useState('pdf');
    const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/submissions/${params.assignmentId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch submissions');
                }
                const data = await response.json();
                setSubmissions(data);
            } catch (error) {
                console.error('Error fetching submissions:', error);
                toast.error('Failed to load submissions');
            } finally {
                setLoading(false);
            }
        };

        const fetchAssessments = async () => {
            try {
                const response = await fetch(`/api/assessments`);
                if (!response.ok) {
                    throw new Error('Failed to fetch assessments');
                }
                const data = await response.json();
                setAssessments(data);
            } catch (error) {
                console.error('Error fetching assessments:', error);
                toast.error('Failed to load assessments');
            }
        };

        fetchSubmissions();
        fetchAssessments();
    }, [params.assignmentId]);

    const handleShare = (submission: Submission) => {
        setSelectedSubmission(submission);
        setShareDialogOpen(true);
    };

    const handleSendEmail = async () => {
        try {
            setLoading(true);

            const includeFeedbackEl = document.getElementById('include-feedback') as HTMLInputElement;
            const includeSubmissionEl = document.getElementById('include-submission') as HTMLInputElement;
            const customMessageEl = document.getElementById('custom-message') as HTMLTextAreaElement;

            if (!selectedSubmission || !selectedSubmission.assessment) {
                toast.error('No assessment available to share');
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                toast.error('Please enter a valid email address');
                return;
            }

            const emailRequest = {
                assessmentId: selectedSubmission.assessment.id,
                recipientEmail: email,
                format: 'PDF' as const, // Using 'as const' to specify literal type
                includedFeedback: includeFeedbackEl?.checked ?? true,
                includedSubmission: includeSubmissionEl?.checked ?? true,
                customMessage: customMessageEl?.value || undefined,
            };

            console.log('Sending email request:', emailRequest);

            const response = await fetch('/api/mailer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emailRequest),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to send email');
            }

            toast.success(`Assessment report for ${selectedSubmission.student.name} has been sent to ${email}`);
            setShareDialogOpen(false);
            setEmail('');
        } catch (error) {
            console.error('Error sharing report:', error);
            toast.error(`Failed to share report: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadAll = async (format: string) => {
        try {
            setLoading(true);

            // Get checkbox elements
            const includeFeedback = document.getElementById(`${format}-include-feedback`) as HTMLInputElement;
            const includeSubmission = document.getElementById(`${format}-include-submission`) as HTMLInputElement;
            const combineFiles = document.getElementById(`${format}-combine-files`) as HTMLInputElement;

            // Use optional chaining and nullish coalescing for safety
            const requestData = {
                // assignmentId is removed as it is not needed anymore
                format: format.toUpperCase(),
                includeFeedback: includeFeedback?.checked ?? true,
                includeSubmission: includeSubmission?.checked ?? true,
                combineFiles: combineFiles?.checked ?? false,
            };

            console.log('Sending request with data:', requestData);

            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to generate reports');
            }

            if (result.success) {
                if (result.downloadUrl) {
                    window.open(result.downloadUrl, '_blank');
                    toast.success(`Downloaded combined report in ${format.toUpperCase()} format`);
                } else if (result.individualReports && result.individualReports.length > 0) {
                    toast.success(
                        `Generated ${result.individualReports.length} reports in ${format.toUpperCase()} format`,
                    );

                    result.individualReports.forEach((report: any) => {
                        if (report.downloadUrl) {
                            window.open(report.downloadUrl, '_blank');
                        }
                    });
                } else {
                    toast.warning('No reports were generated');
                }
            } else {
                throw new Error(result.message || 'Failed to generate reports');
            }

            setDownloadDialogOpen(false);
        } catch (error) {
            console.error('Error downloading reports:', error);
            toast.error(`Failed to download reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    // Calculate statistics
    const gradedSubmissions = submissions.filter((sub) => sub.assessment);
    const averageScore =
        gradedSubmissions.length > 0
            ? Math.round(
                  gradedSubmissions.reduce((acc, sub) => acc + (sub.assessment?.score || 0), 0) /
                      gradedSubmissions.length,
              )
            : 0;

    const medianScore =
        gradedSubmissions.length > 0
            ? (() => {
                  const scores = gradedSubmissions.map((sub) => sub.assessment?.score || 0).sort((a, b) => a - b);
                  const mid = Math.floor(scores.length / 2);
                  return scores.length % 2 === 0 ? Math.round((scores[mid - 1] + scores[mid]) / 2) : scores[mid];
              })()
            : 0;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <img
                            src="/placeholder.svg?height=40&width=40"
                            alt="GradeGenie Logo"
                            className="h-10 w-10 mr-2"
                        />
                        <h1 className="text-xl font-semibold text-green-600">GradeGenie</h1>
                    </div>
                    <div className="flex items-center">
                        <span className="mr-2">Welcome, Serene |</span>
                        <Button variant="link" className="text-green-600">
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-gray-800 text-white min-h-[calc(100vh-64px)]">
                    <nav className="p-4">
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="flex items-center p-2 rounded hover:bg-gray-700">
                                    <span className="mr-2">🏠</span>
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center p-2 rounded hover:bg-gray-700">
                                    <span className="mr-2">📚</span>
                                    My Classes
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center p-2 rounded hover:bg-gray-700">
                                    <span className="mr-2">📝</span>
                                    Rubric Generator
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center p-2 rounded hover:bg-gray-700">
                                    <span className="mr-2">📋</span>
                                    My Rubrics
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center p-2 rounded hover:bg-gray-700">
                                    <span className="mr-2">➕</span>
                                    Create Assignment
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center p-2 rounded hover:bg-gray-700">
                                    <span className="mr-2">⚡</span>
                                    Instant Grader
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center p-2 rounded hover:bg-gray-700">
                                    <span className="mr-2">❓</span>
                                    Help Guides
                                </a>
                            </li>
                        </ul>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    <div className="mb-6">
                        <a href="#" className="text-green-600 hover:underline flex items-center">
                            ← Back to Class
                        </a>
                    </div>

                    <div className="mb-6">
                        <h1 className="text-2xl font-bold mb-1">Assignment Name</h1>
                        <p className="text-gray-500">Assignment Details</p>
                    </div>

                    <h2 className="text-xl font-semibold mb-4">Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <Card className="p-4 text-center">
                            <h3 className="text-gray-500 mb-2">Submissions graded</h3>
                            <p className="text-xl font-bold">
                                {gradedSubmissions.length}/{submissions.length}
                            </p>
                        </Card>
                        <Card className="p-4 text-center">
                            <h3 className="text-gray-500 mb-2">Average</h3>
                            <p className="text-xl font-bold">{averageScore}</p>
                        </Card>
                        <Card className="p-4 text-center">
                            <h3 className="text-gray-500 mb-2">Median</h3>
                            <p className="text-xl font-bold">{medianScore}</p>
                        </Card>
                    </div>

                    <h2 className="text-xl font-semibold mb-4">Submissions</h2>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <Button className="bg-green-600 hover:bg-green-700 text-white">UPLOAD FILES</Button>
                        <Button className="bg-green-600 hover:bg-green-700 text-white">EXPORT ALL</Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="bg-green-600 hover:bg-green-700 text-white w-full">
                                    <Download className="mr-2 h-4 w-4" />
                                    DOWNLOAD ALL
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setDownloadDialogOpen(true)}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Choose Format
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Sort Options */}
                    <div className="mb-4 flex items-center">
                        <span className="mr-2">Sort by:</span>
                        <select className="border rounded p-1">
                            <option>Grade</option>
                            <option>Name</option>
                            <option>Submission Date</option>
                        </select>
                    </div>

                    {/* Submissions Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                        {loading ? (
                            <div className="p-8 text-center">
                                <p>Loading submissions...</p>
                            </div>
                        ) : submissions.length === 0 ? (
                            <div className="p-8 text-center">
                                <p>No submissions found for this assignment.</p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Score
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Comments
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Review
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {submissions.map((submission) => (
                                        <tr key={submission.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {submission.student.name}
                                                </div>
                                                <div className="text-sm text-gray-500">{submission.fileName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {submission.assessment
                                                        ? `${submission.assessment.score}/100`
                                                        : 'Not graded'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 truncate max-w-xs">
                                                    {submission.assessment?.comments
                                                        ? `${submission.assessment.comments.split('\n')[0]}...`
                                                        : 'No comments yet'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        !submission.assessment
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : submission.assessment.status === 'GRADED'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}
                                                >
                                                    {!submission.assessment
                                                        ? 'Pending'
                                                        : submission.assessment.status === 'GRADED'
                                                        ? 'Graded'
                                                        : 'Reviewed'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <Button variant="outline" size="sm">
                                                        View
                                                    </Button>
                                                    {submission.assessment && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleShare(submission)}
                                                            className="flex items-center"
                                                        >
                                                            <Share2 className="h-4 w-4 mr-1" />
                                                            Share
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </main>
            </div>

            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Share Assessment Report</DialogTitle>
                        <DialogDescription>Send the assessment report to the student via email.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="student-name" className="text-right">
                                Student
                            </Label>
                            <div className="col-span-3">
                                <Input id="student-name" value={selectedSubmission?.student.name || ''} disabled />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <div className="col-span-3">
                                <Input
                                    id="email"
                                    placeholder="student@example.com"
                                    value={email}
                                    onChange={(e: { target: { value: SetStateAction<string> } }) =>
                                        setEmail(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Include</Label>
                            <div className="col-span-3">
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="include-feedback" defaultChecked />
                                    <Label htmlFor="include-feedback">Assessment Feedback</Label>
                                </div>
                                <div className="flex items-center space-x-2 mt-2">
                                    <input type="checkbox" id="include-submission" defaultChecked />
                                    <Label htmlFor="include-submission">Student Submission</Label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSendEmail}
                            disabled={!email}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Download Format Dialog */}
            <Dialog open={downloadDialogOpen} onOpenChange={setDownloadDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Download All Reports</DialogTitle>
                        <DialogDescription>Choose the format for downloading all assessment reports.</DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="pdf" className="w-full" onValueChange={setDownloadFormat}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="pdf">PDF Format</TabsTrigger>
                            <TabsTrigger value="docx">Word Format</TabsTrigger>
                        </TabsList>
                        <TabsContent value="pdf" className="mt-4">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="pdf-include-feedback" defaultChecked />
                                    <Label htmlFor="pdf-include-feedback">Include Assessment Feedback</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="pdf-include-submission" defaultChecked />
                                    <Label htmlFor="pdf-include-submission">Include Student Submission</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="pdf-combine-files" />
                                    <Label htmlFor="pdf-combine-files">Combine into a single PDF file</Label>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="docx" className="mt-4">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="docx-include-feedback" defaultChecked />
                                    <Label htmlFor="docx-include-feedback">Include Assessment Feedback</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="docx-include-submission" defaultChecked />
                                    <Label htmlFor="docx-include-submission">Include Student Submission</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="docx-combine-files" />
                                    <Label htmlFor="docx-combine-files">Combine into a single DOCX file</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="docx-editable" defaultChecked />
                                    <Label htmlFor="docx-editable">Make comments editable</Label>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                    <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={() => setDownloadDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => handleDownloadAll(downloadFormat)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download All
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
