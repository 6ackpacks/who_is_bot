-- Migration: Add stats source toggle columns to content table
-- Date: 2026-03-13
-- Description: Supports admin switching between manual preset percentages and real vote data
--              for the "全网判断" stats bar displayed in the mini-program.

ALTER TABLE `content`
  ADD COLUMN `statsSource` VARCHAR(10) NOT NULL DEFAULT 'real' COMMENT 'Stats display source: manual or real' AFTER `correctVotes`,
  ADD COLUMN `manualAiPercent` FLOAT NULL COMMENT 'Admin-set AI percentage (0-100), used when statsSource=manual' AFTER `statsSource`,
  ADD COLUMN `manualHumanPercent` FLOAT NULL COMMENT 'Admin-set Human percentage (0-100), used when statsSource=manual' AFTER `manualAiPercent`;
