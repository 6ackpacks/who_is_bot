import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

/**
 * 微信登录响应接口
 */
interface WeChatLoginResponse {
  openid?: string;
  session_key?: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

/**
 * 微信服务
 * 处理与微信 API 的交互
 */
@Injectable()
export class WeChatService {
  private readonly logger = new Logger(WeChatService.name);
  private readonly appId: string;
  private readonly appSecret: string;
  private readonly loginUrl = 'https://api.weixin.qq.com/sns/jscode2session';

  constructor(private configService: ConfigService) {
    this.appId = this.configService.get<string>('WECHAT_APP_ID');
    this.appSecret = this.configService.get<string>('WECHAT_APP_SECRET');

    if (!this.appId || !this.appSecret) {
      this.logger.warn('WeChat credentials not configured. WeChat login will not work.');
    }
  }

  /**
   * 使用微信登录码获取用户的 openid 和 session_key
   * @param code 微信登录码（通过 wx.login() 获取）
   * @returns 包含 openid、session_key 和 unionid（如果有）的对象
   */
  async code2Session(code: string): Promise<WeChatLoginResponse> {
    if (!this.appId || !this.appSecret) {
      throw new HttpException(
        '微信登录未配置，请联系管理员',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      this.logger.log(`Calling WeChat API with code: ${code.substring(0, 10)}...`);

      const response = await axios.get<WeChatLoginResponse>(this.loginUrl, {
        params: {
          appid: this.appId,
          secret: this.appSecret,
          js_code: code,
          grant_type: 'authorization_code',
        },
        timeout: 10000, // 10 秒超时
      });

      const data = response.data;

      // 检查微信 API 返回的错误
      if (data.errcode) {
        this.logger.error(`WeChat API error: ${data.errcode} - ${data.errmsg}`);

        // 根据错误码返回友好的错误信息
        const errorMessages: { [key: number]: string } = {
          40029: '微信登录码无效',
          45011: '微信登录频率限制，请稍后再试',
          40163: '微信登录码已使用'
        };

        if (data.errcode === -1) {
          throw new HttpException('微信服务繁忙，请稍后再试', HttpStatus.BAD_REQUEST);
        }

        const message = errorMessages[data.errcode] || `微信登录失败: ${data.errmsg}`;
        throw new HttpException(message, HttpStatus.BAD_REQUEST);
      }

      // 验证必需的字段
      if (!data.openid || !data.session_key) {
        this.logger.error('WeChat API response missing required fields', data);
        throw new HttpException(
          '微信登录响应数据不完整',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      this.logger.log(`WeChat login successful for openid: ${data.openid.substring(0, 10)}...`);

      return {
        openid: data.openid,
        session_key: data.session_key,
        unionid: data.unionid,
      };
    } catch (error) {
      // 如果是 HttpException，直接抛出
      if (error instanceof HttpException) {
        throw error;
      }

      // 处理网络错误
      if (axios.isAxiosError(error)) {
        this.logger.error('Network error calling WeChat API', error.message);
        throw new HttpException(
          '无法连接到微信服务器，请检查网络连接',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      // 其他未知错误
      this.logger.error('Unexpected error in code2Session', error);
      throw new HttpException(
        '微信登录失败，请稍后再试',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 加密 session_key（简单的 Base64 编码）
   * 注意：在生产环境中应该使用更强的加密算法
   * @param sessionKey 原始 session_key
   * @returns 加密后的 session_key
   */
  encryptSessionKey(sessionKey: string): string {
    return Buffer.from(sessionKey).toString('base64');
  }

  /**
   * 解密 session_key
   * @param encryptedSessionKey 加密的 session_key
   * @returns 解密后的 session_key
   */
  decryptSessionKey(encryptedSessionKey: string): string {
    return Buffer.from(encryptedSessionKey, 'base64').toString('utf-8');
  }
}
