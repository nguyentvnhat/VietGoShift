export type Service = {
  id: "cleaning" | "kitchen" | "loading";
  name: string;
  description: string;
  pricePerHour: number;
  icon: string;
};

export const SERVICES = [
  {
    id: "cleaning",
    name: "Dọn dẹp theo ca",
    description: "Vệ sinh nhà ở, văn phòng, căn hộ. Thợ mang theo dụng cụ cơ bản.",
    pricePerHour: 80_000,
    icon: "🧹",
  },
  {
    id: "kitchen",
    name: "Phụ bếp theo ca",
    description: "Sơ chế, rửa bát, hỗ trợ bếp chính cho nhà hàng và tiệc gia đình.",
    pricePerHour: 70_000,
    icon: "🍳",
  },
  {
    id: "loading",
    name: "Bốc xếp sự kiện",
    description: "Khuân vác, dựng và dọn sân khấu, bàn ghế cho sự kiện.",
    pricePerHour: 100_000,
    icon: "📦",
  },
] as const satisfies readonly Service[];

export const SERVICE_IDS = SERVICES.map((s) => s.id) as [Service["id"], ...Service["id"][]];

export function getService(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}
