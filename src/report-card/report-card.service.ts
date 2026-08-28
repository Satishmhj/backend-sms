import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ReportCard, ReportCardDocument } from './schemas/report-card.schema';
import { UserService } from '../user/user.service';
import { UserRole } from '../user/schemas/user.schema';

function calculateGrade(marks: number): string {
  if (marks >= 90) return 'A+';
  if (marks >= 80) return 'A';
  if (marks >= 70) return 'B';
  if (marks >= 60) return 'C';
  if (marks >= 50) return 'D';
  return 'F';
}

@Injectable()
export class ReportCardService {
  constructor(
    @InjectModel(ReportCard.name)
    private readonly reportCardModel: Model<ReportCardDocument>,
    private readonly userService: UserService,
  ) {}

  private computeTotals(subjects: { name: string; marks: number }[]) {
    const graded = subjects.map((s) => ({
      ...s,
      grade: calculateGrade(s.marks),
    }));
    const totalMarks = graded.reduce((sum, s) => sum + s.marks, 0);
    const average =
      graded.length > 0
        ? Math.round((totalMarks / (graded.length * 100)) * 1000) / 10
        : 0;
    return { graded, totalMarks, average };
  }

  async create(
    data: {
      studentId: string;
      className: string;
      term: string;
      academicYear: string;
      subjects: { name: string; marks: number }[];
      remarks?: string;
    },
    createdBy: { userId: string; role: string },
  ) {
    const student = await this.userService.findById(data.studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    if (student.role !== UserRole.STUDENT) {
      throw new BadRequestException('Selected user is not a student');
    }
    if (!data.subjects || data.subjects.length === 0) {
      throw new BadRequestException('At least one subject is required');
    }

    const { graded, totalMarks, average } = this.computeTotals(data.subjects);

    const reportCard = await this.reportCardModel.create({
      student: new Types.ObjectId(data.studentId),
      className: data.className,
      term: data.term,
      academicYear: data.academicYear,
      subjects: graded,
      totalMarks,
      average,
      remarks: data.remarks,
      createdBy: new Types.ObjectId(createdBy.userId),
    });

    return this.reportCardModel
      .findById(reportCard.id)
      .populate('student', 'name email class rollNumber role')
      .populate('createdBy', 'name email role');
  }

  async findAll(currentUser: { userId: string; role: string }) {
    let query: Record<string, unknown> = {};
    if ((currentUser.role as UserRole) === UserRole.STUDENT) {
      query = { student: new Types.ObjectId(currentUser.userId) };
    }
    return this.reportCardModel
      .find(query)
      .populate('student', 'name email class rollNumber role')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });
  }

  async findById(
    id: string,
    currentUser: {
      userId: string;
      role: string;
    },
  ) {
    const reportCard = await this.reportCardModel
      .findById(id)
      .populate('student', 'name email class rollNumber role')
      .populate('createdBy', 'name email role');
    if (!reportCard) {
      throw new NotFoundException('Report card not found');
    }

    const studentId = (reportCard.student as unknown as { _id: string })?._id;
    if (
      (currentUser.role as UserRole) === UserRole.STUDENT &&
      String(studentId) !== currentUser.userId
    ) {
      throw new ForbiddenException('You can only view your own report card');
    }
    return reportCard;
  }

  async print(
    id: string,
    currentUser: {
      userId: string;
      role: string;
    },
  ) {
    const reportCard = await this.findById(id, currentUser);
    const student = reportCard.student as unknown as {
      name: string;
      email: string;
      className?: string;
      rollNumber?: string;
    };
    const subjects = reportCard.subjects ?? [];
    const totalObtained = subjects.reduce((s, sub) => s + sub.marks, 0);
    const maxTotal = subjects.length * 100;
    const percentage =
      maxTotal > 0 ? ((totalObtained / maxTotal) * 100).toFixed(2) : '0.00';

    let overallGrade = 'F';
    const avg = Number(percentage);
    if (avg >= 90) overallGrade = 'A+';
    else if (avg >= 80) overallGrade = 'A';
    else if (avg >= 70) overallGrade = 'B';
    else if (avg >= 60) overallGrade = 'C';
    else if (avg >= 50) overallGrade = 'D';

    const lines: string[] = [];
    lines.push('=========================================');
    lines.push('          SCHOOL REPORT CARD');
    lines.push('=========================================');
    lines.push(`Student Name : ${student.name}`);
    lines.push(`Class        : ${reportCard.className}`);
    if (student.rollNumber) {
      lines.push(`Roll No      : ${student.rollNumber}`);
    }
    lines.push(`Term         : ${reportCard.term}`);
    lines.push(`Academic Year: ${reportCard.academicYear}`);
    lines.push('-----------------------------------------');
    lines.push(
      `${'Subject'.padEnd(20)}${'Marks'.padStart(8)}${'Grade'.padStart(8)}`,
    );
    lines.push('-----------------------------------------');
    for (const sub of subjects) {
      lines.push(
        `${String(sub.name).padEnd(20)}${String(sub.marks).padStart(8)}${String(
          sub.grade ?? '-',
        ).padStart(8)}`,
      );
    }
    lines.push('-----------------------------------------');
    lines.push(`Total       : ${totalObtained} / ${maxTotal}`);
    lines.push(`Percentage  : ${percentage}%`);
    lines.push(`Overall Grade : ${overallGrade}`);
    if (reportCard.remarks) {
      lines.push(`Remarks     : ${reportCard.remarks}`);
    }
    lines.push('=========================================');

    return { reportCard, text: lines.join('\n') };
  }
}
