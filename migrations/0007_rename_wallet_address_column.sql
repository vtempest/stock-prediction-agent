-- Fix wallet_addresses schema to match better-auth SIWE plugin expectations
-- SQLite 3.25.0+ supports RENAME COLUMN which automatically updates indexes

-- 1. First, update any NULL chain_id values to default (1 for Ethereum mainnet)
UPDATE `wallet_addresses` SET `chain_id` = 1 WHERE `chain_id` IS NULL;--> statement-breakpoint

-- 2. Rename wallet_address column to address (this will automatically update the unique index)
ALTER TABLE `wallet_addresses` RENAME COLUMN `wallet_address` TO `address`;--> statement-breakpoint

-- 3. Drop the updated_at column (not used by better-auth)
ALTER TABLE `wallet_addresses` DROP COLUMN `updated_at`;
