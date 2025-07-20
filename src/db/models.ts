
import { sql } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core"

const defaultModel = {
    id: p.uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
    createdAt: p.timestamp().defaultNow().notNull(),
    updatedAt: p.timestamp().defaultNow().$onUpdate(() => new Date()).notNull(),
    deletedAt: p.timestamp(),
}

export const users = p.pgTable("users", {
    ...defaultModel,
    username: p.text(),
    hashedPassword: p.text(),
    apiKey: p.text(),
});

export const publishers = p.pgTable("publishers", {
    ...defaultModel,
    name: p.text(),
});

export const subscribers = p.pgTable("subscribers", {
    ...defaultModel,
    name: p.text(),
});

export const topics = p.pgTable("topics", {
    ...defaultModel,
    publisherId: p.text(),
    subscriberId: p.text(),
    content: p.jsonb(),
    sharedId: p.text(),
});
