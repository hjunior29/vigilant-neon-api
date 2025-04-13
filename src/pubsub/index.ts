import { db } from "$core/index";
import { publishers, subscribers, topics } from "$core/models";
import { createResponse, verifyToken } from "utils";
import type { Topic } from "./models";
import { eq } from "drizzle-orm";

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