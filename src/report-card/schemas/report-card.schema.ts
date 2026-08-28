import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class SubjectResult {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, min: 0, max: 100 })
  marks: number;

  @Prop({ trim: true })
  grade: string;

  @Prop({ trim: true })
  remarks: string;
}

export const SubjectResultSchema = SchemaFactory.createForClass(SubjectResult);

@Schema({ timestamps: true })
export class ReportCard {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  student: Types.ObjectId;

  @Prop({ required: true, trim: true })
  className: string;

  @Prop({ required: true, trim: true })
  term: string;

  @Prop({ required: true, trim: true })
  academicYear: string;

  @Prop({ type: [SubjectResultSchema], default: [] })
  subjects: SubjectResult[];

  @Prop({ type: Number, default: 0 })
  totalMarks: number;

  @Prop({ type: Number, default: 0 })
  average: number;

  @Prop({ trim: true })
  remarks: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export type ReportCardDocument = ReportCard & Document;

export const ReportCardSchema = SchemaFactory.createForClass(ReportCard);
