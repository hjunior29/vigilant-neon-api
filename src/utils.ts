import { ORIGIN_URL } from "./constants";

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