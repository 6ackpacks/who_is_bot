import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { JudgmentService } from './judgment.service';
import { SubmitJudgmentDto } from './dto/submit-judgment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';

@Controller('judgment')
export class JudgmentController {
  constructor(private readonly judgmentService: JudgmentService) {}

  /**
   * 提交判定（需要认证）
   * 从 JWT token 中提取用户 ID，防止用户伪造
   */
  @Post('submit')
  @UseGuards(JwtAuthGuard)
  submitJudgment(
    @Body() dto: SubmitJudgmentDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    // 使用从 token 中提取的真实用户 ID，忽略请求体中的 userId
    const secureDto = {
      ...dto,
      userId: user.userId, // 从认证的 token 中获取，不可伪造
      guestId: undefined, // 已登录用户不使用 guestId
    };
    return this.judgmentService.submitJudgment(secureDto);
  }

  /**
   * 获取用户判定历史（需要认证）
   * 只能查看自己的判定历史
   */
  @Get('history')
  @UseGuards(JwtAuthGuard)
  getUserJudgments(@CurrentUser() user: CurrentUserData) {
    return this.judgmentService.getUserJudgments(user.userId);
  }
}
