import { RecentOrders } from "@/components/RecentOrders";

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Đơn hàng</h1>
      <RecentOrders showEmpty />
    </div>
  );
}
