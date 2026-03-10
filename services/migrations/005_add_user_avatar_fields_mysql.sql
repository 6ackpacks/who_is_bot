-- MySQL版本的数据库迁移
-- 迁移文件：005_add_user_avatar_fields_mysql.sql
-- 创建时间：2026-03-10

-- 添加头像更新时间字段
ALTER TABLE users ADD COLUMN avatarUpdateTime VARCHAR(50) NULL;

-- 添加性别字段（1=男，2=女，0=未知）
ALTER TABLE users ADD COLUMN gender INT NULL;

-- 添加城市字段
ALTER TABLE users ADD COLUMN city VARCHAR(50) NULL;

-- 更新现有用户的头像更新时间为当前时间
UPDATE users SET avatarUpdateTime = NOW() WHERE avatarUpdateTime IS NULL;
