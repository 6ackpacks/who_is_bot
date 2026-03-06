-- 添加微信登录相关字段到 users 表
-- 执行此脚本来更新数据库结构

USE who_is_bot;

-- 添加 openid 字段（微信用户唯一标识）
ALTER TABLE users
ADD COLUMN openid VARCHAR(100) UNIQUE NULL COMMENT '微信 OpenID',
ADD INDEX idx_openid (openid);

-- 添加 unionid 字段（跨应用用户标识）
ALTER TABLE users
ADD COLUMN unionid VARCHAR(100) UNIQUE NULL COMMENT '微信 UnionID',
ADD INDEX idx_unionid (unionid);

-- 添加 sessionKey 字段（加密的会话密钥）
ALTER TABLE users
ADD COLUMN sessionKey VARCHAR(255) NULL COMMENT '加密的微信 Session Key';

-- 查看表结构确认
DESCRIBE users;
