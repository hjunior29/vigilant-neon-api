import type { Server } from "bun";

export let server: Server | null = null;

export function setServer(instance: Server) {
    server = instance;
}