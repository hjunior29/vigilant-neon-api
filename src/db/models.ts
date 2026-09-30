
import { sql } from "drizzle-orm";
import * as p from "drizzle-orm/sqlite-core";

const defaultModel = {
    id: p.text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    createdAt: p
        .integer({ mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
    updatedAt: p
        .integer({ mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`)
        .$onUpdate(() => new Date()),
    deletedAt: p.integer({ mode: "timestamp" }),
};

export const users = p.sqliteTable("users", {
    ...defaultModel,
    username: p.text(),
    hashedPassword: p.text(),
    apiKey: p.text(),
});

export const publishers = p.sqliteTable("publishers", {
    ...defaultModel,
    name: p.text(),
});

export const subscribers = p.sqliteTable("subscribers", {
    ...defaultModel,
    name: p.text(),
});

export const topics = p.sqliteTable("topics", {
    ...defaultModel,
    publisherId: p.text(),
    subscriberId: p.text(),
    content: p.text({ mode: "json" }),
    sharedId: p.text(),
});

