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