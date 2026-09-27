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

export async function getCurrentUserFromCookies(): Promise<TokenPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("resqlink_token")?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function getCurrentUser(request?: Request): Promise<TokenPayload | null> {
  // Try Authorization header first if request provided
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const verified = await verifyToken(token);
      if (verified) return verified;
    }
  }

  // Fallback to cookie
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("resqlink_token")?.value;
    if (token) {
      return await verifyToken(token);
    }
  } catch {
    // If outside Next.js request context
  }

  return null;
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
