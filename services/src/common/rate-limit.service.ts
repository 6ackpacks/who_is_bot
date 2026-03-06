import { Injectable } from '@nestjs/common';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

/**
 * 频率限制服务
 *
 * 注意：当前使用单实例内存存储
 *
 * 并发问题说明：
 * - checkLimit() 方法中的 record.count++ 存在轻微竞态条件
 * - 由于Node.js单线程特性，在单实例部署时影响较小
 * - 多实例部署时，每个实例维护独立的限制计数器
 *
 * 生产环境多实例部署建议：
 * 1. 使用Redis实现分布式频率限制
 * 2. 使用Redis的INCR命令（原子操作）
 * 3. 使用EXPIRE设置键的过期时间
 *
 * Redis实现示例：
 * - 键格式：rate_limit:{identifier}
 * - 操作：INCR rate_limit:{identifier}
 * - 过期：EXPIRE rate_limit:{identifier} 60
 * - 检查：GET rate_limit:{identifier} 并与限制值比较
 */
@Injectable()
export class RateLimitService {
  private readonly limits = new Map<string, RateLimitRecord>();
  private readonly maxRequestsPerMinute = 10; // 每分钟最多10次判定
  private readonly windowMs = 60 * 1000; // 1分钟窗口

  /**
   * 检查是否超过频率限制
   * @param identifier 用户标识（userId 或 guestId）
   * @returns true 表示允许请求，false 表示超过限制
   */
  checkLimit(identifier: string): boolean {
    const now = Date.now();
    const record = this.limits.get(identifier);

    if (!record || now > record.resetTime) {
      // 创建新记录或重置过期记录
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (record.count >= this.maxRequestsPerMinute) {
      // 超过限制
      return false;
    }

    // 增加计数
    record.count++;
    return true;
  }

  /**
   * 获取剩余请求次数
   */
  getRemainingRequests(identifier: string): number {
    const record = this.limits.get(identifier);
    if (!record || Date.now() > record.resetTime) {
      return this.maxRequestsPerMinute;
    }
    return Math.max(0, this.maxRequestsPerMinute - record.count);
  }

  /**
   * 获取重置时间（秒）
   */
  getResetTime(identifier: string): number {
    const record = this.limits.get(identifier);
    if (!record || Date.now() > record.resetTime) {
      return 0;
    }
    return Math.ceil((record.resetTime - Date.now()) / 1000);
  }

  /**
   * 清理过期记录（定期调用）
   */
  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.limits.entries()) {
      if (now > record.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}
