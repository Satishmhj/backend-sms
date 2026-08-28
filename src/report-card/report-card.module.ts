import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportCardService } from './report-card.service';
import { ReportCardController } from './report-card.controller';
import { ReportCard, ReportCardSchema } from './schemas/report-card.schema';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReportCard.name, schema: ReportCardSchema },
    ]),
    UserModule,
  ],
  providers: [ReportCardService],
  controllers: [ReportCardController],
})
export class ReportCardModule {}
