import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, IUserLean, UserRole } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) { }

  private formatUser(user: UserDocument): IUserLean {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      class: user.class,
      rollNumber: user.rollNumber,
      subjects: user.subjects,
      department: user.department,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async create(payload: {
    name: string;
    email: string;
    // username: string;
    password: string;
    role: UserRole;
    class?: string;
    rollNumber?: string;
    subjects?: string[];
    department?: string;
  }) {
    const existing = await this.userModel.findOne({ email: payload.email });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const username = await this.generateUniqueUsername(payload.name);
    const hash = await bcrypt.hash(payload.password, 10);
    const user = await this.userModel.create({
      ...payload,
      username,
      password: hash,
    });
    return this.formatUser(user);
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).select('+password');
  }

  async findAll() {
    const users = await this.userModel.find().sort({ createdAt: -1 });
    return users.map((u) => this.formatUser(u));
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.formatUser(user);
  }

  async update(id: string, updateDto: Record<string, unknown>) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateDto.email) {
      const existing = await this.userModel.findOne({ email: updateDto.email });
      if (existing && existing.id !== id) {
        throw new ConflictException('Email already registered');
      }
    }

    if (updateDto.password) {
      updateDto.password = await bcrypt.hash(updateDto.password as string, 10);
    }

    const updated = await this.userModel.findByIdAndUpdate(id, updateDto, {
      new: true,
    });
    return this.formatUser(updated!);
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { deleted: true };
  }

  async validateCredentials(username: string, password: string) {
    // const user = await this.findByEmail(username);
    const user = await this.userModel
      .findOne({
        username: username.toLowerCase(),
      })
      .select('+password');
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return this.formatUser(user);
  }
  private async generateUniqueUsername(name: string): Promise<string> {
    const parts = name
      .trim()
      .toLowerCase()
      .split(/\s+/);

    const firstName = parts[0];
    const lastName = parts.length > 1 ? parts[parts.length - 1] : '';

    let baseUsername = lastName
      ? `${firstName}.${lastName}`
      : firstName;

    baseUsername = baseUsername.replace(/[^a-z0-9.]/g, '');

    let username = baseUsername;
    let counter = 2;

    while (await this.userModel.exists({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    return username;
  }

}
