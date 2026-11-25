import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { SessionProvider } from "@/hooks/useSession";
import { DEMO_USERS } from "@/lib/session";
import { getSession } from "@/lib/session-server";
import "./globals.css";

const font = Be_Vietnam_Pro({ subsets: ["vietnamese"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "VietGoShift – Đặt thợ theo ca",
  description: "Prototype đặt dịch vụ theo ca: dọn dẹp, phụ bếp, bốc xếp sự kiện.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#059669" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // proxy.ts luôn cấp session; fallback chỉ để an toàn.
  const session = (await getSession()) ?? {
    userId: DEMO_USERS.customer,
    role: "customer" as const,
  };

  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={font.className} suppressHydrationWarning>
        <SessionProvider session={session}>
          <AppHeader session={session} />
          <main className="mx-auto max-w-md px-4 pt-5 pb-24 md:max-w-2xl">{children}</main>
          <BottomNav role={session.role} />
        </SessionProvider>
      </body>
    </html>
  );
}
