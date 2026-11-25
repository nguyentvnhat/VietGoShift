"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createScanToken,
  verifyScanToken,
  type ScanAction,
  type ScanClaims,
} from "@/lib/scan-token";
import { DEMO_USERS, ROLES, SESSION_COOKIE, createSessionToken, type Role } from "@/lib/session";
import { getSession } from "@/lib/session-server";

export async function switchRole(role: Role) {
  if (!ROLES.includes(role)) throw new Error("Invalid role");
  const token = await createSessionToken({ userId: DEMO_USERS[role], role });
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/" });
  redirect(role === "worker" ? "/worker" : "/");
}

/** Khách tạo mã QR cho thợ quét. */
export async function issueScanToken(orderId: string, action: ScanAction): Promise<string> {
  const session = await getSession();
  if (session?.role !== "customer") throw new Error("Chỉ khách hàng mới tạo được mã QR");
  return createScanToken({ orderId, action, customerId: session.userId });
}

export type RedeemResult = { ok: true; claims: ScanClaims } | { ok: false; error: string };

/** Thợ gửi mã vừa quét để server xác thực chữ ký và hạn dùng. */
export async function redeemScanToken(token: string): Promise<RedeemResult> {
  const session = await getSession();
  if (session?.role !== "worker") return { ok: false, error: "Chỉ thợ mới quét được mã" };
  const claims = await verifyScanToken(token);
  if (!claims) return { ok: false, error: "Mã QR không hợp lệ hoặc đã hết hạn" };
  return { ok: true, claims };
}
