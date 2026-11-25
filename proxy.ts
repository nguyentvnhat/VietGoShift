import { NextResponse, type NextRequest } from "next/server";
import { DEMO_USERS, SESSION_COOKIE, createSessionToken, verifySessionToken } from "@/lib/session";

// Cấp session "customer" mặc định nếu chưa có JWT hợp lệ.
export async function proxy(request: NextRequest) {
  if (await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next();
  }
  const token = await createSessionToken({ userId: DEMO_USERS.customer, role: "customer" });
  request.cookies.set(SESSION_COOKIE, token);
  const response = NextResponse.next({ request });
  response.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/" });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
