import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../admin/entities/admin.entity';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminRepository = app.get<Repository<Admin>>('AdminRepository');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(query, resolve);
    });
  };

  try {
    console.log('=== 重置管理员密码 ===\n');

    const username = await question('请输入要重置密码的用户名: ');

    const admin = await adminRepository.findOne({
      where: { username },
    });

    if (!admin) {
      console.error(`\n✗ 用户 "${username}" 不存在`);
      process.exit(1);
    }

    const newPassword = await question('请输入新密码: ');

    if (!newPassword) {
      console.error('密码不能为空');
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await adminRepository.update(admin.id, {
      password: hashedPassword,
    });

    console.log('\n✓ 密码重置成功!');
    console.log(`  用户名: ${admin.username}`);
    console.log(`  角色: ${admin.role}`);
  } catch (error) {
    console.error('\n✗ 重置失败:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await app.close();
  }
}

bootstrap();
