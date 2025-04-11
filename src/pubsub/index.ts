import { db } from "$core/index";
import { publishers, subscribers, topics } from "$core/models";
import { createResponse } from "utils";
import type { Publisher, Subscriber, Topic } from "./models";
import { eq } from "drizzle-orm";

export async function createPubSub() {
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