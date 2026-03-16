-- Add bio and tags columns to users table
ALTER TABLE `users`
  ADD COLUMN `bio` TEXT NULL AFTER `city`,
  ADD COLUMN `tags` VARCHAR(500) NULL AFTER `bio`;
