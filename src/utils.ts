import {jwtVerify} from "jose";
import {ORIGIN_URL, PUBLIC_KEY} from "./constants";
import {db} from "$core/index.ts";
import {and, eq, isNull, sql} from "drizzle-orm";
import {users, topics} from "$core/models.ts";

export const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": ORIGIN_URL ?? "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
}

export function response(status: number, message?: string, data?: any) {
    return new Response(
        JSON.stringify({
            status,
            ...(message ? { message } : null),
            ...(data ? { data } : null),
        }),
        {
            headers: headers,
            status,
        }
    );
}

export async function hashPassword(password: string): Promise<string> {
    return await Bun.password.hash(password, {
        algorithm: "bcrypt",
        cost: 4,
    });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await Bun.password.verify(password, hash);
}

export async function verifyToken(token: string | null) {
    if (!token) {
        return response(401, "Unauthorized");
    }

    if (token.startsWith("Bearer ")) {
        token = token.slice(7);
        if (!token) {
            return response(401, "Unauthorized");
        }
    } else if (token.startsWith("vine_")) {
        const result = await db
            .select()
            .from(users)
            .where(
                and(
                    eq(users.apiKey, token),
                    isNull(users.deletedAt)
                )
            );
        if (result.length === 0) {
            return response(401, "Invalid API key");
        }
        // If the token is an API key, we don't need to verify it with JWT
        return;
    } else {
        return response(401, "Invalid token format");
    }

    try {
        await jwtVerify(token, PUBLIC_KEY, {
            algorithms: ["RS256"]
        });
        return
    } catch {
        return response(401, "Invalid token");
    }
}

export function generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}

export async function appendMessage(topicId: string, msg: string | object) {
    const topic = await db.select().from(topics).where(eq(topics.id, topicId)).limit(1);
    if (!topic || topic.length === 0) return;
    const current = (topic[0].content as any) || {};
    const messages = Array.isArray(current.messages) ? current.messages : [];
    messages.push(msg);
    current.messages = messages;
    await db.update(topics).set({ content: current }).where(eq(topics.id, topicId));
}