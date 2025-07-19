import { db } from "$core/index";
import { publishers, subscribers, topics } from "$core/models";
import {response, generateRandomString, verifyToken} from "utils";
import { and, eq, isNull, inArray } from "drizzle-orm";
import {realtimeUpdate} from "../server/websocket.ts";

export async function createTopic(req: Request) {
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

    realtimeUpdate("create");

    return response(200, "Pubsub created", topic);
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

    return response(200, "Topics retrieved", result);
}

export async function getTopicById(req: Request) {
    const tokenResponse = await verifyToken(req.headers.get("Authorization"));
    if (tokenResponse instanceof Response) {
        return tokenResponse;
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const id = pathParts[pathParts.length - 1];

    if (!id) return response(400, "Missing id");

    const result = await db
        .select()
        .from(topics)
        .where(
            and(
                eq(topics.id, id),
                isNull(topics.deletedAt),
            )
        );

    return response(200, "Topic retrieved", result);
}

export async function deleteTopics(req: Request) {
    const tokenResponse = await verifyToken(req.headers.get("Authorization"));
    if (tokenResponse instanceof Response) {
        return tokenResponse;
    }

    const body = await req.json();
    const ids = body.ids;

    if (!ids || !Array.isArray(ids)) return response(400, "Invalid ids");
    if (ids.length === 0) return response(400, "No ids provided");

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

    realtimeUpdate("delete");

    return response(200, "Topics deleted");
}

export async function shareTopic(req: Request) {
    const tokenResponse = await verifyToken(req.headers.get("Authorization"));
    if (tokenResponse instanceof Response) {
        return tokenResponse;
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const id = pathParts[pathParts.length - 2];

    if (!id) return response(400, "Missing id");

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

    realtimeUpdate("share");

    return response(200, "Topic shared", { sharedId });
}

export async function getSharedTopic(req: Request) {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const sharedId = pathParts[pathParts.length - 1];

    if (!sharedId) return response(400, "Missing sharedId");

    const result = await db
        .select()
        .from(topics)
        .where(
            and(
                eq(topics.sharedId, sharedId),
                isNull(topics.deletedAt),
            )
        );

    return response(200, "Topic retrieved", result[0]);
}

export async function fetchAllTopics() {
    const result = await db
        .select()
        .from(topics)
        .where(
            and(
                isNull(topics.deletedAt),
            )
        );
    return result;
}