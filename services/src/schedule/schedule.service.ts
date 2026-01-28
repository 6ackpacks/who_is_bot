import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * 每周一凌晨0点重置周统计
   * Cron 表达式: 秒 分 时 日 月 周
   * '0 0 0 * * 1' = 每周一 00:00:00
   */
  @Cron('0 0 0 * * 1', {
    name: 'resetWeeklyStats',
    timeZone: 'Asia/Shanghai',
  })
  async resetWeeklyStats() {
    this.logger.log('开始重置周统计数据...');

    try {
      const result = await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({
          weeklyJudged: 0,
          weeklyCorrect: 0,
          weeklyAccuracy: 0,
          lastWeekReset: new Date(),
        })
        .execute();

      this.logger.log(`周统计重置完成，影响 ${result.affected} 个用户`);
    } catch (error) {
      this.logger.error('周统计重置失败:', error);
    }
  }

  /**
   * 每天凌晨3点清理过期的游客判定记录（可选）
   * 保留最近30天的数据
   */
  @Cron('0 0 3 * * *', {
    name: 'cleanupGuestJudgments',
    timeZone: 'Asia/Shanghai',
  })
  async cleanupOldGuestJudgments() {
    this.logger.log('开始清理过期游客判定记录...');

    try {
      // 这里可以添加清理逻辑
      // 例如：删除30天前的游客判定记录
      this.logger.log('游客判定记录清理完成');
    } catch (error) {
      this.logger.error('清理游客判定记录失败:', error);
    }
  }

  /**
   * 手动触发周统计重置（用于测试）
   */
  async manualResetWeeklyStats() {
    this.logger.log('手动触发周统计重置...');
    await this.resetWeeklyStats();
  }
}
