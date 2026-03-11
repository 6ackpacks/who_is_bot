import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from './entities/admin.entity';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);

  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: AdminLoginDto) {
    const { username, password } = loginDto;

    // Find admin by username
    const admin = await this.adminRepository.findOne({
      where: { username },
    });

    if (!admin) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // Update last login time
    await this.adminRepository.update(admin.id, {
      lastLoginAt: new Date(),
    });

    // Generate JWT token
    const payload = {
      sub: admin.id,
      username: admin.username,
      role: admin.role,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('ADMIN_JWT_SECRET'),
      expiresIn: this.configService.get('ADMIN_JWT_EXPIRES_IN') || '24h',
    });

    this.logger.log(`Admin ${username} logged in successfully`);

    return {
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        createdAt: admin.createdAt,
        lastLoginAt: new Date(),
      },
    };
  }

  async getAdminInfo(adminId: string) {
    const admin = await this.adminRepository.findOne({
      where: { id: adminId },
      select: ['id', 'username', 'role', 'createdAt', 'lastLoginAt'],
    });

    if (!admin) {
      throw new UnauthorizedException('管理员不存在');
    }

    return admin;
  }

  /**
   * Create initial admin account (for setup)
   * This should be called manually or via migration
   */
  async createAdmin(username: string, password: string, role: 'super' | 'normal' = 'normal') {
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = this.adminRepository.create({
      username,
      password: hashedPassword,
      role,
    });

    return this.adminRepository.save(admin);
  }
}
