import { db } from "$core/index";
import { publishers, subscribers, topics } from "$core/models";
import { createResponse, generateRandomString, verifyToken } from "utils";
import type { Topic } from "./models";
import { and, eq, isNull, inArray, sql } from "drizzle-orm";

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

export async function appendMessage(topicId: string, msg: string | object) {
    await db.execute(sql`
        UPDATE topics
        SET content = jsonb_set(
            coalesce(content, '{}'::jsonb),
            '{messages}',
            coalesce(content->'messages', '[]'::jsonb)
                 || ${JSON.stringify(msg)}::jsonb
        )
        WHERE id = ${topicId};
    `);
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

export async function deleteTopics(req: Request) {
    const tokenResponse = await verifyToken(req.headers.get("Authorization"));
    if (tokenResponse instanceof Response) {
        return tokenResponse;
    }

    const body = await req.json();
    const ids = body.ids;

    if (!ids || !Array.isArray(ids)) return createResponse(400, "Invalid ids");
    if (ids.length === 0) return createResponse(400, "No ids provided");

    await db
        .update(topics)
        .set({ deletedAt: new Date() })
        .where(
            and(
                isNull(topics.deletedAt),
                inArray(topics.id, ids)
            )
        )
        .returning();

    return createResponse(200, "Topics deleted", null);
}

export async function shareTopic(req: Request) {
    const tokenResponse = await verifyToken(req.headers.get("Authorization"));
    if (tokenResponse instanceof Response) {
        return tokenResponse;
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const id = pathParts[pathParts.length - 2];

    if (!id) return createResponse(400, "Missing id");

    const sharedId = generateRandomString(16);

    await db
        .update(topics)
        .set({ sharedId })
        .where(
            and(
                eq(topics.id, id),
                isNull(topics.deletedAt),
            )
        )
        .returning();

    return createResponse(200, "Topic shared", { sharedId });
}

export async function getSharedTopic(req: Request) {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const sharedId = pathParts[pathParts.length - 1];

    if (!sharedId) return createResponse(400, "Missing sharedId");

    const result = await db
        .select()
        .from(topics)
        .where(
            and(
                eq(topics.sharedId, sharedId),
                isNull(topics.deletedAt),
            )
        );

    return createResponse(200, "Topic retrieved", result[0]);
}