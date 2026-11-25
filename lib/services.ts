export type Service = {
  id: "electric" | "plumbing" | "painting" | "repair";
  name: string;
  description: string;
  pricePerHour: number;
  icon: string;
};

export const SERVICES = [
  {
    id: "electric",
    name: "Thợ điện",
    description: "Sửa chập điện, thay ổ cắm, công tắc, đèn, đi lại dây điện trong nhà.",
    pricePerHour: 150_000,
    icon: "⚡",
  },
  {
    id: "plumbing",
    name: "Thợ nước",
    description: "Sửa rò rỉ, thông tắc, lắp đặt vòi, bồn rửa, máy bơm, đường ống nước.",
    pricePerHour: 150_000,
    icon: "🚰",
  },
  {
    id: "painting",
    name: "Thợ sơn",
    description: "Sơn tường, sơn lại phòng, xử lý ẩm mốc, bong tróc cho nhà ở và văn phòng.",
    pricePerHour: 120_000,
    icon: "🎨",
  },
  {
    id: "repair",
    name: "Sửa chữa",
    description: "Sửa chữa nhỏ trong nhà: cửa, bản lề, kệ tủ, lắp đặt đồ nội thất.",
    pricePerHour: 130_000,
    icon: "🔧",
  },
] as const satisfies readonly Service[];

export const SERVICE_IDS = SERVICES.map((s) => s.id) as [Service["id"], ...Service["id"][]];

export function getService(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}
