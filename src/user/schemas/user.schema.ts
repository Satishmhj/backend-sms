import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({
    required: true,
    enum: Object.values(UserRole),
    type: String,
  })
  role: UserRole;

  @Prop({ trim: true })
  class: string;

  @Prop({ trim: true })
  rollNumber: string;

  @Prop({ type: [String], default: [] })
  subjects: string[];

  @Prop({ trim: true })
  department: string;
}

export type UserDocument = User &
  Document & {
    createdAt?: Date;
    updatedAt?: Date;
  };

export const UserSchema = SchemaFactory.createForClass(User);

export interface IUserLean {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  role: UserRole;
  class?: string;
  rollNumber?: string;
  subjects?: string[];
  department?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
