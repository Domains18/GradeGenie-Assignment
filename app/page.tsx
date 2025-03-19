"use client";

import { SetStateAction, useState } from "react";
import { Download, Share2, FileText, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {toast} from 'sonner'


// Mock data based on the provided schema
const mockSubmissions = [
  {
    id: 1,
    studentName: "Emma Johnson",
    fileName: "The_Role_of_Ambition_in_Macbeth_03082025_0338.pdf",
    score: 80,
    comments:
      "Strengths:\n Your essay demonstrates a thorough engagement with Shakespeare's text, and your discussion of ambition in Macbeth is both insightful and well-supported by textual evidence.\nImprovement Areas:\n While your use of literary devices is effective, the analysis can be further deepened for a more profound impact. Additionally, enhancing your academic writing style can improve clarity and sophistication.\nAction Items:\n\n• Delve deeper into the analysis of literary devices by discussing their impact or effectiveness in Shakespeare's portrayal of themes.\n• Enhance your academic writing by varying sentence structure and employing more complex syntax.\n• Review your work to correct minor grammatical issues, such as subject-verb agreement and punctuation.Sub-Scores and Justification:\n\n• Analytical Argument (4/5): Your argument is clearly structured and insightful but could offer a more original angle.\n• Engagement with Text (5/5): You exhibit profound engagement with textual evidence effectively supporting your interpretations.\n• Use of Literary Devices (4/5): You effectively incorporate literary devices, but further exploration can elevate your analysis.\n• Academic Writing (3/5): While generally clear, your writing can benefit from further stylistic refinement and proofreading.",
    status: "Graded",
    submissionTime: "2025-03-08 03:38:45",
  },
  {
    id: 2,
    studentName: "Noah Williams",
    fileName: "Analysis_of_Symbolism_in_The_Great_Gatsby_03072025_1542.pdf",
    score: 92,
    comments:
      "Excellent analysis of symbolism with strong textual evidence. Consider exploring the historical context more deeply in future essays.",
    status: "Graded",
    submissionTime: "2025-03-07 15:42:12",
  },
  {
    id: 3,
    studentName: "Olivia Martinez",
    fileName: "Character_Development_in_Pride_and_Prejudice_03062025_0912.pdf",
    score: 85,
    comments:
      "Strong character analysis with good understanding of Austen's techniques. Work on paragraph transitions and conclusion strength.",
    status: "Graded",
    submissionTime: "2025-03-06 09:12:33",
  },
];

export default function AssignmentPage() {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [downloadFormat, setDownloadFormat] = useState("pdf");
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);

  const handleShare = (submission: any) => {
    setSelectedSubmission(submission);
    setShareDialogOpen(true);
  };

  const handleSendEmail = () => {
    // In a real implementation, this would send the email with the PDF
    toast.success(`Assessment report for ${selectedSubmission.studentName} has been sent to ${email}`);
    setShareDialogOpen(false);
    setEmail("");
  };

  const handleDownloadAll = (format: string) => {
    // In a real implementation, this would trigger the download of all reports
    toast.success(`All assessment reports are being downloaded in ${format.toUpperCase()} format`);
    setDownloadDialogOpen(false);
  };
    // setDownloadDialogOpen(false);

  

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
                <a
                  href="#"
                  className="flex items-center p-2 rounded hover:bg-gray-700"
                >
                  <span className="mr-2">🏠</span>
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center p-2 rounded hover:bg-gray-700"
                >
                  <span className="mr-2">📚</span>
                  My Classes
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center p-2 rounded hover:bg-gray-700"
                >
                  <span className="mr-2">📝</span>
                  Rubric Generator
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center p-2 rounded hover:bg-gray-700"
                >
                  <span className="mr-2">📋</span>
                  My Rubrics
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center p-2 rounded hover:bg-gray-700"
                >
                  <span className="mr-2">➕</span>
                  Create Assignment
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center p-2 rounded hover:bg-gray-700"
                >
                  <span className="mr-2">⚡</span>
                  Instant Grader
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center p-2 rounded hover:bg-gray-700"
                >
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
            <a
              href="#"
              className="text-green-600 hover:underline flex items-center"
            >
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
                {mockSubmissions.length}/{mockSubmissions.length}
              </p>
            </Card>
            <Card className="p-4 text-center">
              <h3 className="text-gray-500 mb-2">Average</h3>
              <p className="text-xl font-bold">
                {Math.round(
                  mockSubmissions.reduce((acc, sub) => acc + sub.score, 0) /
                    mockSubmissions.length
                )}
              </p>
            </Card>
            <Card className="p-4 text-center">
              <h3 className="text-gray-500 mb-2">Median</h3>
              <p className="text-xl font-bold">
                {
                  mockSubmissions.map((s) => s.score).sort((a, b) => a - b)[
                    Math.floor(mockSubmissions.length / 2)
                  ]
                }
              </p>
            </Card>
          </div>

          <h2 className="text-xl font-semibold mb-4">Submissions</h2>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              UPLOAD FILES
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              EXPORT ALL
            </Button>
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
                {mockSubmissions.map((submission) => (
                  <tr key={submission.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {submission.studentName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {submission.fileName
                          .split("_")
                          .join(" ")
                          .replace(".pdf", "")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {submission.score}/100
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {submission.comments.split("\n")[0]}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShare(submission)}
                          className="flex items-center"
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Assessment Report</DialogTitle>
            <DialogDescription>
              Send the assessment report to the student via email.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="student-name" className="text-right">
                Student
              </Label>
              <div className="col-span-3">
                <Input
                  id="student-name"
                  value={selectedSubmission?.studentName || ""}
                  disabled
                />
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
                  onChange={(e: { target: { value: SetStateAction<string>; }; }) => setEmail(e.target.value)}
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
                  <input
                    type="checkbox"
                    id="include-submission"
                    defaultChecked
                  />
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
            <DialogDescription>
              Choose the format for downloading all assessment reports.
            </DialogDescription>
          </DialogHeader>
          <Tabs
            defaultValue="pdf"
            className="w-full"
            onValueChange={setDownloadFormat}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pdf">PDF Format</TabsTrigger>
              <TabsTrigger value="docx">Word Format</TabsTrigger>
            </TabsList>
            <TabsContent value="pdf" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="pdf-include-feedback"
                    defaultChecked
                  />
                  <Label htmlFor="pdf-include-feedback">
                    Include Assessment Feedback
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="pdf-include-submission"
                    defaultChecked
                  />
                  <Label htmlFor="pdf-include-submission">
                    Include Student Submission
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="pdf-combine-files" />
                  <Label htmlFor="pdf-combine-files">
                    Combine into a single PDF file
                  </Label>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="docx" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="docx-include-feedback"
                    defaultChecked
                  />
                  <Label htmlFor="docx-include-feedback">
                    Include Assessment Feedback
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="docx-include-submission"
                    defaultChecked
                  />
                  <Label htmlFor="docx-include-submission">
                    Include Student Submission
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="docx-editable" defaultChecked />
                  <Label htmlFor="docx-editable">Make comments editable</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setDownloadDialogOpen(false)}
            >
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