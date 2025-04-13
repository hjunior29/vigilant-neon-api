import { jwtVerify } from "jose";
import { ORIGIN_URL, PUBLIC_KEY } from "./constants";

export function createResponse(status: number, message?: string, data?: any) {
    return new Response(
        JSON.stringify({
            status,
            ...(message ? { message } : null),
            ...(data ? { data } : null),
        }),
        {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": ORIGIN_URL ?? "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            status,
        }
    );
}

export async function hashPassword(password: string): Promise<string> {
    const hash = await Bun.password.hash(password, {
        algorithm: "bcrypt",
        cost: 4,
    });
    return hash;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    const isMatch = await Bun.password.verify(password, hash);
    return isMatch;
}

export async function verifyToken(token: string | null) {
    if (!token) {
        return createResponse(401, "Unauthorized");
    }

    if (token.startsWith("Bearer ")) {
        token = token.slice(7);
        if (!token) {
            return createResponse(401, "Unauthorized");
        }
    }

    try {
        await jwtVerify(token, PUBLIC_KEY, {
            algorithms: ["RS256"]
        });
        return
    } catch {
        return createResponse(401, "Invalid token");
    }
}