-- Migration: Add manualTotalVotes column to content table
-- Date: 2026-03-13
-- Description: Allows admin to set a display participant count when statsSource='manual',
--              shown as displayTotalVotes in the mini-program.

ALTER TABLE `content`
  ADD COLUMN `manualTotalVotes` INT NULL COMMENT 'Admin-set display participant count' AFTER `manualHumanPercent`;
