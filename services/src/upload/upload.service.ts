import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import COS = require('cos-nodejs-sdk-v5');
import * as crypto from 'crypto';
import * as path from 'path';
import { UploadedFile } from './upload.entity';

@Injectable()
export class UploadService {
  private cosClient: any;
  private bucket: string;
  private region: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(UploadedFile)
    private uploadedFileRepository: Repository<UploadedFile>,
  ) {
    // 初始化腾讯云 COS 客户端
    this.bucket = this.configService.get<string>('COS_BUCKET');
    this.region = this.configService.get<string>('COS_REGION');

    this.cosClient = new COS({
      SecretId: this.configService.get<string>('COS_SECRET_ID'),
      SecretKey: this.configService.get<string>('COS_SECRET_KEY'),
    });
  }

  /**
   * 验证文件类型和大小
   */
  validateFile(contentType: string, size: number) {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const videoTypes = ['video/mp4', 'video/quicktime'];
    const maxImageSize = 5 * 1024 * 1024; // 5MB
    const maxVideoSize = 100 * 1024 * 1024; // 100MB

    if (imageTypes.includes(contentType)) {
      if (size > maxImageSize) {
        throw new BadRequestException('图片大小不能超过 5MB');
      }
    } else if (videoTypes.includes(contentType)) {
      if (size > maxVideoSize) {
        throw new BadRequestException('视频大小不能超过 100MB');
      }
    } else {
      throw new BadRequestException('不支持的文件类型');
    }
  }

  /**
   * 生成唯一的文件名
   */
  generateUniqueFilename(originalFilename: string): string {
    const ext = path.extname(originalFilename);
    const timestamp = Date.now();
    const randomStr = crypto.randomBytes(8).toString('hex');
    return `uploads/${timestamp}-${randomStr}${ext}`;
  }

  /**
   * 获取上传签名（用于前端直传）
   */
  async getUploadSignature(filename: string, contentType: string) {
    // 生成唯一的文件 key
    const key = this.generateUniqueFilename(filename);

    // 获取临时密钥和签名（有效期 1 小时）
    const authorization = this.cosClient.getAuthorization({
      Method: 'PUT',
      Key: key,
      Expires: 3600, // 1小时
    });

    // 构建上传 URL
    const url = `https://${this.bucket}.cos.${this.region}.myqcloud.com/${key}`;

    return {
      url,
      key,
      authorization,
      contentType,
      bucket: this.bucket,
      region: this.region,
    };
  }

  /**
   * 直接上传文件到 COS（服务器中转）
   */
  async uploadFile(file: Express.Multer.File) {
    // 验证文件
    this.validateFile(file.mimetype, file.size);

    // 生成唯一的文件 key
    const key = this.generateUniqueFilename(file.originalname);

    try {
      // 上传到腾讯云 COS
      const result = await new Promise<any>((resolve, reject) => {
        this.cosClient.putObject(
          {
            Bucket: this.bucket,
            Region: this.region,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
          },
          (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          },
        );
      });

      // 构建文件访问 URL
      const url = `https://${this.bucket}.cos.${this.region}.myqcloud.com/${key}`;

      // 保存文件记录到数据库
      const uploadedFile = this.uploadedFileRepository.create({
        key,
        url,
        filename: file.originalname,
        contentType: file.mimetype,
        size: file.size,
        referenceCount: 0,
      });

      await this.uploadedFileRepository.save(uploadedFile);

      return {
        url,
        key,
        size: file.size,
        contentType: file.mimetype,
      };
    } catch (error) {
      // 提供更详细的错误信息
      if (error.message && error.message.includes('Access Key Id')) {
        throw new BadRequestException('腾讯云 COS 凭证无效，请联系管理员配置正确的 COS_SECRET_ID 和 COS_SECRET_KEY');
      } else if (error.statusCode === 403) {
        throw new BadRequestException('无权限访问腾讯云 COS，请检查凭证配置');
      } else if (error.code === 'NoSuchBucket') {
        throw new BadRequestException('COS 存储桶不存在，请检查 COS_BUCKET 配置');
      }
      throw new BadRequestException('文件上传失败: ' + error.message);
    }
  }

  /**
   * 获取文件列表
   */
  async getFiles(page: number, limit: number, type?: string) {
    // 验证分页参数
    if (page < 1) {
      throw new BadRequestException('页码必须大于0');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('每页数量必须在1-100之间');
    }

    const skip = (page - 1) * limit;

    const queryBuilder = this.uploadedFileRepository
      .createQueryBuilder('file')
      .orderBy('file.uploadedAt', 'DESC')
      .skip(skip)
      .take(limit);

    // 根据类型筛选
    if (type === 'image') {
      queryBuilder.andWhere(
        'file.contentType IN (:...types)',
        { types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] }
      );
    } else if (type === 'video') {
      queryBuilder.andWhere(
        'file.contentType IN (:...types)',
        { types: ['video/mp4', 'video/quicktime'] }
      );
    }

    const [files, total] = await queryBuilder.getManyAndCount();

    return {
      data: files.map(file => ({
        id: file.id,
        key: file.key,
        url: file.url,
        filename: file.filename,
        contentType: file.contentType,
        size: file.size,
        referenceCount: file.referenceCount,
        uploadedAt: file.uploadedAt,
      })),
      total,
      page,
      limit,
    };
  }

  /**
   * 删除文件
   */
  async deleteFile(key: string) {
    const file = await this.uploadedFileRepository.findOne({
      where: { key },
    });

    if (!file) {
      throw new NotFoundException('文件不存在');
    }

    // 检查文件是否还在被引用
    if (file.referenceCount > 0) {
      throw new BadRequestException(`文件正在被 ${file.referenceCount} 个内容引用，无法删除`);
    }

    try {
      // 从腾讯云 COS 删除
      await new Promise<void>((resolve, reject) => {
        this.cosClient.deleteObject(
          {
            Bucket: this.bucket,
            Region: this.region,
            Key: key,
          },
          (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          },
        );
      });

      // 从数据库删除
      await this.uploadedFileRepository.remove(file);

      return {
        message: '文件已删除',
      };
    } catch (error) {
      throw new BadRequestException('文件删除失败: ' + error.message);
    }
  }

  /**
   * 增加文件引用计数
   */
  async incrementReferenceCount(key: string) {
    await this.uploadedFileRepository.increment(
      { key },
      'referenceCount',
      1
    );
  }

  /**
   * 减少文件引用计数
   */
  async decrementReferenceCount(key: string) {
    await this.uploadedFileRepository.decrement(
      { key },
      'referenceCount',
      1
    );
  }
}
