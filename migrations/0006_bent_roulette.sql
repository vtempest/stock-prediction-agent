CREATE TABLE `brokerage_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`first_name` text NOT NULL,
	`middle_name` text,
	`last_name` text NOT NULL,
	`res_street_1` text NOT NULL,
	`res_street_2` text,
	`res_city` text NOT NULL,
	`res_state` text NOT NULL,
	`res_zip` text NOT NULL,
	`res_country` text DEFAULT 'USA' NOT NULL,
	`mail_street_1` text,
	`mail_street_2` text,
	`mail_city` text,
	`mail_state` text,
	`mail_zip` text,
	`mail_country` text,
	`date_of_birth` text NOT NULL,
	`tax_id_type` text NOT NULL,
	`tax_id` text NOT NULL,
	`citizenship_country` text NOT NULL,
	`visa_type` text,
	`trusted_contact_name` text,
	`trusted_contact_phone` text,
	`trusted_contact_email` text,
	`employment_status` text NOT NULL,
	`employer_name` text,
	`occupation` text,
	`industry_code` text,
	`is_affiliated_broker_dealer` integer DEFAULT false,
	`is_control_person` integer DEFAULT false,
	`control_person_tickers` text,
	`is_politically_exposed` integer DEFAULT false,
	`annual_income` text NOT NULL,
	`income_source` text NOT NULL,
	`total_net_worth` text NOT NULL,
	`liquid_net_worth` text NOT NULL,
	`tax_bracket` text,
	`investment_objective` text NOT NULL,
	`risk_tolerance` text NOT NULL,
	`time_horizon` text NOT NULL,
	`liquidity_needs` text NOT NULL,
	`investment_experience` text NOT NULL,
	`w9_certified` integer DEFAULT false,
	`w9_certified_date` integer,
	`is_non_professional_subscriber` integer DEFAULT true,
	`margin_agreement_accepted` integer DEFAULT false,
	`margin_agreement_date` integer,
	`privacy_policy_accepted` integer DEFAULT false,
	`privacy_policy_date` integer,
	`terms_accepted` integer DEFAULT false,
	`terms_accepted_date` integer,
	`kyc_status` text DEFAULT 'PENDING' NOT NULL,
	`account_type` text DEFAULT 'CASH' NOT NULL,
	`trading_permissions` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`submitted_at` integer,
	`approved_at` integer,
	`approved_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brokerage_profiles_user_id_unique` ON `brokerage_profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`item_type` text NOT NULL,
	`item_id` text NOT NULL,
	`parent_comment_id` text,
	`content` text NOT NULL,
	`edited_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `likes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`item_type` text NOT NULL,
	`item_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`action_url` text,
	`from_user_id` text,
	`related_item_type` text,
	`related_item_id` text,
	`read` integer DEFAULT false,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`from_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `organization_members` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`joined_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`image` text,
	`owner_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `shared_items` (
	`id` text PRIMARY KEY NOT NULL,
	`shared_by_id` text NOT NULL,
	`shared_with_email` text NOT NULL,
	`shared_with_user_id` text,
	`item_type` text NOT NULL,
	`item_id` text NOT NULL,
	`symbol` text,
	`title` text,
	`message` text,
	`metadata` text,
	`viewed_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`shared_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`shared_with_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`joined_at` integer NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_follows` (
	`id` text PRIMARY KEY NOT NULL,
	`follower_id` text NOT NULL,
	`following_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`follower_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`following_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`inviter_id` text NOT NULL,
	`email` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`organization_id` text,
	`team_id` text,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`inviter_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `watchlists` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `users` ADD `survey_response` text;--> statement-breakpoint
ALTER TABLE `watchlist` ADD `watchlist_id` text REFERENCES watchlists(id);