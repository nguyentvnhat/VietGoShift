import { RecentOrders } from "@/components/RecentOrders";
import { ServiceCard } from "@/components/ServiceCard";
import { SERVICES } from "@/lib/services";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-5">
      <section>
        <h1 className="text-2xl font-bold">Cần người làm theo ca?</h1>
        <p className="text-slate-600">Đặt trong 1 phút — thợ xác minh, có bảo hành.</p>
      </section>

      <div className="grid gap-3">
        {SERVICES.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      <RecentOrders />
    </div>
  );
}
