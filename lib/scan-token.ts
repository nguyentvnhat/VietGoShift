import { SignJWT, jwtVerify } from "jose";
import { secret } from "./session";

export const SCAN_ACTIONS = ["check_in", "check_out"] as const;
export type ScanAction = (typeof SCAN_ACTIONS)[number];
export type ScanClaims = { orderId: string; action: ScanAction; customerId: string };

/** Mã QR hết hạn sau 5 phút để không chụp lại dùng sau được. */
export const SCAN_TOKEN_TTL_SECONDS = 300;

export async function createScanToken(claims: ScanClaims, now = new Date()): Promise<string> {
  const iat = Math.floor(now.getTime() / 1000);
  return new SignJWT({ oid: claims.orderId, act: claims.action })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.customerId)
    .setAudience("vgs:scan")
    .setIssuedAt(iat)
    .setExpirationTime(iat + SCAN_TOKEN_TTL_SECONDS)
    .sign(secret);
}

export async function verifyScanToken(token: string, now = new Date()): Promise<ScanClaims | null> {
  try {
    const { payload } = await jwtVerify(token.trim(), secret, {
      algorithms: ["HS256"],
      audience: "vgs:scan",
      currentDate: now,
    });
    const { oid, act, sub } = payload;
    if (typeof oid !== "string" || !sub || !SCAN_ACTIONS.includes(act as ScanAction)) return null;
    return { orderId: oid, action: act as ScanAction, customerId: sub };
  } catch {
    return null;
  }
}
