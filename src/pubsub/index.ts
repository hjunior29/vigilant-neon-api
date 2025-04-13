import { db } from "$core/index";
import { publishers, subscribers, topics } from "$core/models";
import { createResponse, verifyToken } from "utils";
import type { Topic } from "./models";
import { and, eq, isNull } from "drizzle-orm";

export async function createPubSub(req: Request) {
    const tokenResponse = await verifyToken(req.headers.get("Authorization"));
    if (tokenResponse instanceof Response) {
        return tokenResponse;
    }

    const publisher = await db
        .insert(publishers)
        .values({})
        .returning();

    const subscriber = await db
        .insert(subscribers)
        .values({})
        .returning();

    const topic = await db.insert(topics)
        .values({
            publisherId: publisher[0].id,
            subscriberId: subscriber[0].id
        })
        .returning();

    return createResponse(200, "Pubsub created", topic);
}

export async function saveTopic(topic: Topic) {
    if (!topic.id || !topic.content) return null;

    const result = await db
        .update(topics)
        .set(topic)
        .where(eq(topics.id, topic.id))
        .returning();

    return result ? result[0] : null;
}

export async function getTopics(req: Request) {
    const tokenResponse = await verifyToken(req.headers.get("Authorization"));
    if (tokenResponse instanceof Response) {
        return tokenResponse;
    }

    const result = await db
        .select()
        .from(topics)
        .where(
            and(
                isNull(topics.deletedAt),
            )
        );

    return createResponse(200, "Topics retrieved", result);
}

export async function getTopicById(req: Request) {
    const tokenResponse = await verifyToken(req.headers.get("Authorization"));
    if (tokenResponse instanceof Response) {
        return tokenResponse;
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const id = pathParts[pathParts.length - 1];

    if (!id) return createResponse(400, "Missing id");

    const result = await db
        .select()
        .from(topics)
        .where(
            and(
                eq(topics.id, id),
                isNull(topics.deletedAt),
            )
        );

    return createResponse(200, "Topic retrieved", result);
}