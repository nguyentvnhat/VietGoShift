import Link from "next/link";
import { BookingForm } from "@/components/BookingForm";

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link href="/" aria-label="Về trang chủ" className="text-xl">
          ←
        </Link>
        <h1 className="text-xl font-bold">Đặt lịch</h1>
      </div>
      <BookingForm initialServiceId={service} />
    </div>
  );
}
