import Link from "next/link";

export function OrderNotFound() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-4xl">🔍</p>
      <p className="font-semibold">Không tìm thấy đơn</p>
      <p className="text-sm text-slate-500">
        Dữ liệu demo lưu trong trình duyệt này (localStorage).
      </p>
      <Link href="/" className="font-semibold text-emerald-700">
        Về trang chủ
      </Link>
    </div>
  );
}
