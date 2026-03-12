import { Controller, Post, Body, Get, UseGuards, Query, Param, Put, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { JudgmentService } from './judgment.service';
import { SubmitJudgmentDto } from './dto/submit-judgment.dto';
import { QueryJudgmentDto } from './dto/query-judgment.dto';
import { UpdateJudgmentDto } from './dto/update-judgment.dto';
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
   * 获取判定列表（支持分页、筛选）
   * 需要认证
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: QueryJudgmentDto) {
    return this.judgmentService.findAll(query);
  }

  /**
   * 获取用户判定历史（需要认证）
   * 只能查看自己的判定历史
   * 必须在 @Get(':id') 之前注册，否则 'history' 会被 :id 路由捕获
   */
  @Get('history')
  @UseGuards(JwtAuthGuard)
  getUserJudgmentsAlias(@CurrentUser() user: CurrentUserData) {
    return this.judgmentService.getUserJudgments(user.userId);
  }

  @Get('user/history')
  @UseGuards(JwtAuthGuard)
  getUserJudgments(@CurrentUser() user: CurrentUserData) {
    return this.judgmentService.getUserJudgments(user.userId);
  }

  /**
   * 获取单个判定详情
   * 需要认证
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.judgmentService.findOne(id);
  }

  /**
   * 更新判定状态
   * 需要认证
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateJudgmentDto,
  ) {
    return this.judgmentService.update(id, updateDto);
  }

  /**
   * 删除判定
   * 需要认证
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.judgmentService.remove(id);
  }
}
