import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AdminAuthService } from '../admin/admin-auth.service';
import * as readline from 'readline';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminAuthService = app.get(AdminAuthService);

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
    console.log('=== 创建管理员账户 ===\n');

    const username = await question('请输入用户名: ');
    const password = await question('请输入密码: ');
    const roleInput = await question('请输入角色 (super/normal, 默认: super): ');
    const role = (roleInput.trim() || 'super') as 'super' | 'normal';

    if (!username || !password) {
      console.error('用户名和密码不能为空');
      process.exit(1);
    }

    const admin = await adminAuthService.createAdmin(username, password, role);
    console.log('\n✓ 管理员账户创建成功!');
    console.log(`  用户名: ${admin.username}`);
    console.log(`  角色: ${admin.role}`);
    console.log(`  ID: ${admin.id}`);
  } catch (error) {
    console.error('\n✗ 创建失败:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await app.close();
  }
}

bootstrap();
