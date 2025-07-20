import {db} from "$core/index";
import {users} from "$core/models";
import {and, eq, isNull} from "drizzle-orm";
import {hashPassword, response, verifyPassword, verifyToken} from "utils";
import {SignJWT} from "jose";
import {PRIVATE_KEY} from "$constants/index";

export async function login(req: Request) {
    const { username, password } = await req.json();

    const result = await db
        .select()
        .from(users)
        .where(
            and(
                eq(users.username, username),
                isNull(users.deletedAt)
            )
        );

    const user = result ? result[0] : null;

    if (!user?.username || !user?.hashedPassword) {
        return response(401, "Invalid username or password");
    }

    const isValid = await verifyPassword(password, user.hashedPassword);
    if (!isValid) {
        return response(401, "Invalid username or password");
    }

    const token = await new SignJWT({
        id: user.id,
        username: user.username
    })
        .setProtectedHeader({ alg: "RS256" })
        .setIssuedAt()
        .setExpirationTime("1d")
        .sign(PRIVATE_KEY);

    return response(200, "Login successful", { token });

}

export async function createApiKey(req: Request) {
    const tokenResponse = await verifyToken(req.headers.get("Authorization"));
    if (tokenResponse instanceof Response) {
        return tokenResponse;
    }

    const {username} = await req.json();

    if (!username) {
        return response(400, "Service name is required");
    }

    const existingUser = await db
        .select()
        .from(users)
        .where(
            and(
                eq(users.username, username),
                isNull(users.deletedAt)
            )
        );

    if (existingUser.length > 0) {
        return response(400, "Api Key already exists with this name");
    }

    const apiKey = `vine_${crypto.randomUUID()}`;

    await db
        .insert(users)
        .values({
            username: username,
            apiKey: apiKey,
        })
        .returning();

    return response(201, "Api Key created successfully", {apiKey});
}

export async function getApiKeys(req: Request) {
    const tokenResponse = await verifyToken(req.headers.get("Authorization"));
    if (tokenResponse instanceof Response) {
        return tokenResponse;
    }

    const result = await db
        .select()
        .from(users)
        .where(
            and(
                isNull(users.deletedAt),
                isNull(users.hashedPassword)
            )
        );

    return response(200, "Api Keys retrieved successfully", result);
}

export async function deleteApiKey(req: Request) {
    const tokenResponse = await verifyToken(req.headers.get("Authorization"));
    if (tokenResponse instanceof Response) {
        return tokenResponse;
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const id = pathParts[pathParts.length - 1];

    if (!id) {
        return response(400, "Service Id is required");
    }

    const result = await db
        .update(users)
        .set({deletedAt: new Date()})
        .where(
            and(
                eq(users.id, id),
                isNull(users.deletedAt)
            )
        )
        .returning();

    if (result.length === 0) {
        return response(404, "Api Key not found");
    }

    return response(200, "Api Key deleted successfully");
}