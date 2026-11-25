import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "vgs_session";
export const ROLES = ["customer", "worker"] as const;
export type Role = (typeof ROLES)[number];
export type Session = { userId: string; role: Role };

// Demo user cố định cho từng vai trò — không có backend thật.
export const DEMO_USERS: Record<Role, string> = {
  customer: "cus-001",
  worker: "wrk-001",
};

export const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "vietgoshift-demo-secret-do-not-use-in-prod",
);

export async function createSessionToken(session: Session): Promise<string> {
  return new SignJWT({ role: session.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    const role = payload.role;
    if (!payload.sub || !ROLES.includes(role as Role)) return null;
    return { userId: payload.sub, role: role as Role };
  } catch {
    return null;
  }
}
