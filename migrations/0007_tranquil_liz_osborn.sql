DROP INDEX `wallet_addresses_wallet_address_unique`;--> statement-breakpoint
DROP INDEX "polymarket_debates_market_id_unique";--> statement-breakpoint
DROP INDEX "portfolios_user_id_unique";--> statement-breakpoint
DROP INDEX "sessions_token_unique";--> statement-breakpoint
DROP INDEX "user_settings_user_id_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
DROP INDEX "users_api_key_unique";--> statement-breakpoint
ALTER TABLE `wallet_addresses` ALTER COLUMN "chain_id" TO "chain_id" integer NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `polymarket_debates_market_id_unique` ON `polymarket_debates` (`market_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `portfolios_user_id_unique` ON `portfolios` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_settings_user_id_unique` ON `user_settings` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_api_key_unique` ON `users` (`api_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `wallet_addresses_address_unique` ON `wallet_addresses` (`address`);--> statement-breakpoint
ALTER TABLE `wallet_addresses` ADD `address` text NOT NULL;--> statement-breakpoint
ALTER TABLE `wallet_addresses` DROP COLUMN `wallet_address`;--> statement-breakpoint
ALTER TABLE `wallet_addresses` DROP COLUMN `updated_at`;