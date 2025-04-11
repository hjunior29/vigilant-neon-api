import { db } from "$core/index";
import { users } from "$core/models";
import { and, eq, isNull } from "drizzle-orm";
import { createResponse, verifyPassword } from "utils";
import { SignJWT } from "jose";
import { PRIVATE_KEY } from "$constants/index";

export async function auth(req: Request) {
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
        return createResponse(401, "Invalid username or password");
    }

    const isValid = await verifyPassword(password, user.hashedPassword);
    if (!isValid) {
        return createResponse(401, "Invalid username or password");
    }

    const token = await new SignJWT({
        id: user.id,
        username: user.username
    })
        .setProtectedHeader({ alg: "RS256" })
        .setIssuedAt()
        .setExpirationTime("1d")
        .sign(PRIVATE_KEY);

    return createResponse(200, "Login successful", { token });

}