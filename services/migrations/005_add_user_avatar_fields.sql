-- 添加用户头像相关字段
-- 迁移文件：005_add_user_avatar_fields.sql
-- 创建时间：2026-03-10

-- 添加头像更新时间字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatarUpdateTime VARCHAR(50);

-- 添加性别字段（1=男，2=女，0=未知）
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender INT;

-- 添加城市字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(50);

-- 添加注释
COMMENT ON COLUMN users.avatarUpdateTime IS '头像最后更新时间';
COMMENT ON COLUMN users.gender IS '性别：1=男，2=女，0=未知';
COMMENT ON COLUMN users.city IS '城市';

-- 更新现有用户的头像更新时间为当前时间
UPDATE users SET avatarUpdateTime = NOW()::TEXT WHERE avatarUpdateTime IS NULL;
