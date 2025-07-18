import { createResponse, verifyToken, appendMessage } from "utils";

export function wsServer() {
    const server = Bun.serve<{ topicId: string }, {}>({
        port: Number(process.env.WS_PORT || 3001),

        async fetch(req, server) {
            const tokenRes = await verifyToken(req.headers.get("Authorization"));
            if (tokenRes instanceof Response) return tokenRes;

            const url = new URL(req.url);
            const topicId = url.searchParams.get("topicId");
            if (req.method !== "GET") return createResponse(405, "Method not allowed");
            if (url.pathname !== "/") return createResponse(404, "Not found");
            if (!topicId) return createResponse(400, "Missing topicId");

            return server.upgrade(req, { data: { topicId } })
                ? createResponse(101, "Switching protocols")
                : undefined;
        },

        websocket: {
            open: ws => ws.subscribe(ws.data.topicId),

            async message(ws, raw) {
                server.publish(ws.data.topicId, raw);

                try {
                    const parsed = JSON.parse(raw.toString());
                    await appendMessage(ws.data.topicId, parsed);
                } catch {
                    await appendMessage(ws.data.topicId, raw.toString());
                }
            },

            close: ws => ws.unsubscribe(ws.data.topicId),
        },
    });

    console.log(`🚀 WS running at ws://${server.hostname}:${server.port}`);
    return server;
}