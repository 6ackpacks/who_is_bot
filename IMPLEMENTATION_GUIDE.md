# 判定系统和排行榜实现完成指南

## ✅ 已完成的工作

### 1. 数据库结构修改

#### 新增表：judgments
- 记录每次用户判定
- 支持登录用户和游客模式
- 关联 user 和 content 表

#### 修改表：content
- 添加 `total_votes` - 总投票数
- 添加 `ai_votes` - 认为是AI的投票数
- 添加 `human_votes` - 认为是人类的投票数

#### 修改表：users
- 添加 `correct_count` - 总正确数

### 2. 后端接口实现

#### POST /judgment/submit
提交判定结果，自动更新统计数据

**请求格式：**
```json
{
  "contentId": "content-id",
  "userChoice": "ai",  // 或 "human"
  "isCorrect": true,
  "userId": "user-id",  // 可选，游客模式可不传
  "guestId": "guest-id"  // 可选，游客模式使用
}
```

**响应格式：**
```json
{
  "success": true,
  "message": "判定已记录"
}
```

**功能：**
- 记录判定到 judgments 表
- 更新 content 的投票统计
- 更新 user 的统计数据（如果是登录用户）
  - totalJudged +1
  - correctCount（如果正确）
  - accuracy 重新计算
  - streak 更新
  - maxStreak 更新
  - weeklyAccuracy 更新

#### GET /leaderboard?limit=50&type=weekly
获取排行榜数据

**响应格式：**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-id",
      "username": "用户名",
      "avatar": "头像URL",
      "level": "硅谷天才",
      "bustedCount": 1240,
      "maxStreak": 45,
      "weeklyAccuracy": 98.5
    }
  ]
}
```

**排序规则：**
1. 按 totalJudged（总判定数）降序
2. 按 accuracy（准确率）降序

### 3. 创建的文件

```
services/
├── src/
│   ├── judgment/
│   │   ├── dto/
│   │   │   └── submit-judgment.dto.ts
│   │   ├── judgment.entity.ts
│   │   ├── judgment.service.ts
│   │   ├── judgment.controller.ts
│   │   └── judgment.module.ts
│   ├── user/
│   │   └── leaderboard.controller.ts
│   └── app.module.ts (已修改)
└── database-migration.sql
```

## 🚀 部署步骤

### 步骤1：运行数据库迁移

```bash
# 连接到你的数据库
mysql -h your-host -u your-user -p your-database

# 运行迁移脚本
source services/database-migration.sql

# 或者直接执行
mysql -h your-host -u your-user -p your-database < services/database-migration.sql
```

### 步骤2：重启后端服务

```bash
cd services
npm install  # 如果有新依赖
npm run build
npm run start:prod
```

### 步骤3：验证接口

#### 测试判定提交接口

```bash
curl -X POST http://your-api-url/judgment/submit \
  -H "Content-Type: application/json" \
  -d '{
    "contentId": "your-content-id",
    "userChoice": "ai",
    "isCorrect": true,
    "userId": "your-user-id"
  }'
```

#### 测试排行榜接口

```bash
curl http://your-api-url/leaderboard?limit=10
```

## 📊 数据流程

### 用户判定流程

```
1. 用户点击判定按钮
   ↓
2. 前端调用 api.submitJudgment()
   ↓
3. 后端 POST /judgment/submit
   ↓
4. 保存到 judgments 表
   ↓
5. 更新 content 表投票统计
   ↓
6. 更新 user 表统计数据
   ↓
7. 返回成功响应
```

### 排行榜显示流程

```
1. 用户打开排行榜页面
   ↓
2. 前端调用 api.getLeaderboard()
   ↓
3. 后端 GET /leaderboard
   ↓
4. 查询 users 表，按 totalJudged 排序
   ↓
5. 格式化数据（添加 levelClass 等）
   ↓
6. 返回排行榜数据
```

## 🧪 测试清单

### 前端测试

- [ ] 打开小程序，进行一次判定
- [ ] 检查控制台，确认 `api.submitJudgment()` 调用成功
- [ ] 打开排行榜页面，确认能看到数据
- [ ] 检查排行榜数据格式是否正确

### 后端测试

- [ ] 检查数据库 judgments 表是否有新记录
- [ ] 检查 content 表的 total_votes, ai_votes, human_votes 是否更新
- [ ] 检查 users 表的统计数据是否更新
- [ ] 测试游客模式判定（不传 userId）

### 数据库验证

```sql
-- 检查 judgments 表
SELECT * FROM judgments ORDER BY created_at DESC LIMIT 10;

-- 检查 content 投票统计
SELECT id, title, total_votes, ai_votes, human_votes
FROM content
WHERE total_votes > 0;

-- 检查 users 统计
SELECT id, nickname, total_judged, correct_count, accuracy, max_streak
FROM users
WHERE total_judged > 0
ORDER BY total_judged DESC
LIMIT 10;

-- 验证准确率计算
SELECT
  id,
  nickname,
  total_judged,
  correct_count,
  accuracy,
  (correct_count / total_judged * 100) as calculated_accuracy
FROM users
WHERE total_judged > 0;
```

## ⚠️ 注意事项

### 1. 游客模式
- 游客的判定会被记录到 judgments 表
- 但不会更新 users 表的统计数据
- 游客不会出现在排行榜中

### 2. 数据一致性
- 如果已有用户数据，需要运行迁移脚本中的 UPDATE 语句来初始化 correct_count
- 建议在低峰期运行数据库迁移

### 3. 性能优化
- judgments 表已添加索引
- 排行榜查询限制了返回数量（默认50条）
- 考虑添加缓存机制（Redis）

## 🐛 常见问题

### Q1: 排行榜返回404
**原因：** 后端服务未重启或路由未注册
**解决：** 重启后端服务，检查 app.module.ts 是否包含 UserModule

### Q2: 判定提交失败
**原因：** 数据库表未创建或字段缺失
**解决：** 运行数据库迁移脚本

### Q3: 统计数据不更新
**原因：** userId 未传递或用户不存在
**解决：** 检查前端是否正确传递 userId，检查数据库中是否存在该用户

### Q4: aiPercentage 显示不正确
**原因：** Content 表的投票统计未更新
**解决：** 检查 content 表的 total_votes, ai_votes 字段

## 📈 下一步优化建议

1. **添加缓存**
   - 使用 Redis 缓存排行榜数据
   - 每次判定后更新缓存

2. **添加防刷机制**
   - 限制同一用户对同一内容的重复判定
   - 添加判定频率限制

3. **周统计重置**
   - 添加定时任务，每周重置 weeklyAccuracy 等字段
   - 使用 @nestjs/schedule

4. **等级系统**
   - 根据 totalJudged 和 accuracy 自动升级
   - 添加等级升级通知

5. **成就系统**
   - 实现成就解锁逻辑
   - 添加成就 API 接口

## 📝 API 文档

### 完整的 API 列表

```
POST   /judgment/submit          提交判定
GET    /judgment/user/:userId    获取用户判定历史
GET    /judgment/content/:id     获取内容判定历史
GET    /leaderboard              获取排行榜
GET    /content/feed             获取内容列表
GET    /user/:id                 获取用户信息
GET    /user/:id/stats           获取用户统计
```

## ✅ 完成标志

当以下所有项都完成时，系统即可正常运行：

- [x] 数据库迁移脚本已运行
- [x] 后端服务已重启
- [ ] 判定提交接口测试通过
- [ ] 排行榜接口测试通过
- [ ] 前端能正常显示排行榜
- [ ] 用户统计数据正确更新

---

**创建时间：** 2026-01-28
**版本：** 1.0.0
