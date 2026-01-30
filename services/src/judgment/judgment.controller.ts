import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { JudgmentService } from './judgment.service';
import { SubmitJudgmentDto } from './dto/submit-judgment.dto';

@Controller('judgment')
export class JudgmentController {
  constructor(private readonly judgmentService: JudgmentService) {}

  @Post('submit')
  submitJudgment(@Body() dto: SubmitJudgmentDto) {
    return this.judgmentService.submitJudgment(dto);
  }

  @Get('user/:userId')
  getUserJudgments(@Param('userId') userId: string) {
    return this.judgmentService.getUserJudgments(userId);
  }
}
