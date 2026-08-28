import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ReportCardService } from './report-card.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { ICurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateReportCardDto } from './dto/create-report-card.dto';

@ApiTags('Report Cards')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('report-cards')
export class ReportCardController {
  constructor(private readonly reportCardService: ReportCardService) {}

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a report card (admin or teacher)' })
  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async create(
    @Body() body: CreateReportCardDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.reportCardService.create(
      {
        studentId: body.studentId,
        className: body.className,
        term: body.term,
        academicYear: body.academicYear,
        subjects: body.subjects,
        remarks: body.remarks,
      },
      user,
    );
  }

  @ApiOperation({
    summary: 'List report cards (students see only their own)',
  })
  @Get()
  async findAll(@CurrentUser() user: ICurrentUser) {
    return this.reportCardService.findAll(user);
  }

  @ApiOperation({ summary: 'Get a report card by ID' })
  @ApiParam({ name: 'id', description: 'Report card ID' })
  @Get(':id')
  async findById(@Param('id') id: string, @CurrentUser() user: ICurrentUser) {
    return this.reportCardService.findById(id, user);
  }

  @ApiOperation({ summary: 'Print a report card (formatted text)' })
  @ApiParam({ name: 'id', description: 'Report card ID' })
  @Get(':id/print')
  async print(@Param('id') id: string, @CurrentUser() user: ICurrentUser) {
    return this.reportCardService.print(id, user);
  }
}
