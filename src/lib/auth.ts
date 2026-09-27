import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "resqlink-default-hackathon-secret-key-32-chars-long";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
  role: "CITIZEN" | "VOLUNTEER" | "ADMIN";
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Resolves the JWT token payload against the live database.
 * If the user's ID changed due to a database re-seed/migration,
 * it safely matches by email to heal the active session and prevent
 * foreign key violations.
 */
async function resolveDbUser(payload: TokenPayload | null): Promise<TokenPayload | null> {
  if (!payload) return null;

  try {
    // 1. Direct match on ID
    if (payload.id) {
      const dbUserById = await prisma.user.findUnique({
        where: { id: payload.id },
        select: { id: true, email: true, name: true, role: true },
      });
      if (dbUserById) {
        return {
          id: dbUserById.id,
          email: dbUserById.email,
          name: dbUserById.name,
          role: dbUserById.role as "CITIZEN" | "VOLUNTEER" | "ADMIN",
        };
      }
    }

    // 2. Database was re-seeded or migrated; match on email to heal stale session
    if (payload.email) {
      const dbUserByEmail = await prisma.user.findUnique({
        where: { email: payload.email },
        select: { id: true, email: true, name: true, role: true },
      });
      if (dbUserByEmail) {
        return {
          id: dbUserByEmail.id,
          email: dbUserByEmail.email,
          name: dbUserByEmail.name,
          role: dbUserByEmail.role as "CITIZEN" | "VOLUNTEER" | "ADMIN",
        };
      }
    }

    // User no longer exists in database
    return null;
  } catch (err) {
    console.error("resolveDbUser error:", err);
    // If DB is temporarily unreachable in edge test runner, return payload
    return payload;
  }
}

export async function getCurrentUserFromCookies(): Promise<TokenPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("resqlink_token")?.value;
    if (!token) return null;
    const verified = await verifyToken(token);
    return await resolveDbUser(verified);
  } catch {
    return null;
  }
}

export async function getCurrentUser(request?: Request): Promise<TokenPayload | null> {
  let verified: TokenPayload | null = null;

  // Try Authorization header first if request provided
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      verified = await verifyToken(token);
    }
  }

  // Fallback to cookie
  if (!verified) {
    try {
      const cookieStore = cookies();
      const token = cookieStore.get("resqlink_token")?.value;
      if (token) {
        verified = await verifyToken(token);
      }
    } catch {
      // If outside Next.js request context
    }
  }

  if (!verified) return null;

  return await resolveDbUser(verified);
}

export async function requireAuth(roles?: string | string[]): Promise<{ user: TokenPayload } | { error: string; status: number }> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Authentication required", status: 401 };
  }

  if (roles) {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(user.role)) {
      return { error: "Insufficient permissions for this action", status: 403 };
    }
  }

  return { user };
}
