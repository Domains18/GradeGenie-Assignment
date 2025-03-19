import { PrismaClient, Role, Status, ReportFormat } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export interface Assessment {
  id: string;
  assignmentId: string;
  submission: {
    id: string;
    fileName: string;
    fileUrl: string;
  };
  student: {
    id: string;
    name: string;
    email: string;
  };
  criteriaScores: {
    id: string;
    score: number;
    comments: string | null;
    criteriaName: string;
  }[];
}

export interface DownloadReportsRequest {
  assignmentId: string;
  format: ReportFormat;
  includeFeedback: boolean;
  includeSubmission: boolean;
  combineFiles: boolean;
}

export interface ShareReportRequest {
  assessmentId: string;
  email: string;
  includeFeedback: boolean;
  includeSubmission: boolean;
}
