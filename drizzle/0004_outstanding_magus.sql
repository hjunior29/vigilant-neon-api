ALTER TABLE "publishers" RENAME COLUMN "uuid4" TO "id";--> statement-breakpoint
ALTER TABLE "subscribers" RENAME COLUMN "uuid4" TO "id";--> statement-breakpoint
ALTER TABLE "topics" RENAME COLUMN "uuid4" TO "id";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "uuid4" TO "id";