# VietGoShift — Prototype đặt thợ theo ca (Mobile First)

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Zod 4 · jose · Vitest · Husky + lint-staged

## Hành trình demo

Khách đặt lịch → Thợ nhận → Đang đến (thông tin thợ + ETA) → **Thợ quét QR check-in của khách** → Đang làm → Thợ gửi ghi chú/ảnh bàn giao → **Thợ quét QR check-out của khách** (= nghiệm thu, tính giờ làm thực tế) → Hoàn thành → Đánh giá 2 chiều → Yêu cầu bảo hành.

- `/` — 3 thẻ dịch vụ + danh sách đơn của bạn
- `/booking?service=cleaning` — 4 bước: dịch vụ → ngày/giờ → địa chỉ → xác nhận (Zod validate từng bước)
- `/tracking/[id]` — timeline trạng thái, nút **Giả lập →** để chuyển bước
- `/complete/[id]` — đánh giá 2 chiều + yêu cầu bảo hành ("Đang xử lý")
- `/worker` — góc nhìn thợ: nhận đơn, check-in, hoàn thành

Bấm **"đổi vai"** trên header để đổi giữa Khách/Thợ (server action ký lại JWT). Mở 2 tab — một vai Khách ở `/tracking/[id]`, một vai Thợ ở `/worker` — trạng thái đồng bộ realtime qua sự kiện `storage`.

> Cookie session dùng chung giữa các tab, nên để xem 2 vai cùng lúc hãy dùng 1 cửa sổ thường + 1 cửa sổ ẩn danh… nhưng localStorage không chia sẻ với ẩn danh. Cách đơn giản nhất: dùng nút **Giả lập** ở màn theo dõi, rồi đổi vai để xem màn thợ.

## Check-in / check-out bằng QR

- Khách mở màn theo dõi → hiện QR (JWT ký bằng jose phía server, hạn 5 phút, gắn `orderId` + `check_in|check_out`).
- Thợ bấm **Quét QR** ở `/worker` → camera đọc mã (jsQR) → server action `redeemScanToken` xác thực chữ ký/hạn → client kiểm tra đúng đơn, đúng thợ, đúng bước (`scanError`) rồi mới đổi trạng thái. Quét lại mã cũ bị chặn vì đơn đã qua bước đó.
- Mã QR check-out chỉ hiện khi thợ đã gửi bàn giao.

**Demo trên 1 máy** (dữ liệu ở localStorage nên 2 điện thoại thật không dùng chung được):
1. Tab A (vai Khách) mở `/tracking/[id]` khi đơn ở "Đang đến" → QR hiện ra, bấm **Sao chép mã**.
2. Tab B bấm "đổi vai" → Thợ → `/worker` → **Quét QR check-in** → dán mã (hoặc giơ QR ở tab A/điện thoại trước webcam).
3. Lưu ý cookie vai dùng chung giữa các tab: tạo QR ở tab A *trước* khi đổi vai ở tab B.

## Cấu trúc

```
app/
  layout.tsx            # đọc JWT, cấp SessionProvider + header
  page.tsx              # trang chủ
  actions.ts            # server action switchRole (ký JWT mới)
  booking/page.tsx
  tracking/[id]/page.tsx
  complete/[id]/page.tsx
  worker/page.tsx
components/             # BookingForm, StatusTimeline, RatingForm, WarrantyForm, WorkerJobs, ui...
hooks/                  # useOrders (useSyncExternalStore), useSession (context)
lib/
  services.ts           # danh mục dịch vụ
  orders.ts             # kiểu Order, trạng thái, advanceOrder (pure)
  order-store.ts        # store localStorage (client)
  session.ts            # jose: tạo/verify JWT { sub: userId, role }
  session-server.ts     # getSession() đọc cookie
schemas/                # Zod: booking.ts, review.ts
proxy.ts                # Next 16 "proxy" (trước là middleware): cấp session khách mặc định
tests/unit/             # Vitest
```

## Chạy

```bash
npm install
git init              # husky cần repo git
npx husky init        # LƯU Ý: lệnh này ghi đè .husky/pre-commit thành "npm test"
echo "npx lint-staged" > .husky/pre-commit   # khôi phục hook của dự án
npm run dev           # http://localhost:3000 — mở DevTools ở chế độ mobile 375px
```

(Thực ra script `prepare: husky` đã tự cài hook khi `npm install` trong một repo git, nên có thể bỏ qua `husky init`.)

| Lệnh                                 | Mô tả                                      |
| ------------------------------------ | ------------------------------------------ |
| `npm test`                           | Vitest (schema Zod, luồng trạng thái, JWT) |
| `npm run lint` / `npm run typecheck` | ESLint / tsc                               |

**Pre-commit**: lint-staged chạy `eslint --fix` + `prettier --write` + `vitest related --run` (chỉ test liên quan tới file .ts/.tsx đang staged).

Biến môi trường: `SESSION_SECRET` (xem `.env.example`), không đặt sẽ dùng secret demo.

## Mở rộng sau này

- **Thêm dịch vụ**: thêm 1 phần tử vào `SERVICES` trong `lib/services.ts` — enum Zod (`SERVICE_IDS`) và trang chủ tự cập nhật.
- **Thêm trạng thái** (vd `paid`, `cancelled`): thêm vào `ORDER_STATUSES`, `STATUS_LABEL`, `WORKER_ACTION` trong `lib/orders.ts`. TypeScript sẽ báo các chỗ `Record<OrderStatus, …>` còn thiếu. Nếu có nhánh rẽ (huỷ đơn), thay `nextStatus` tuyến tính bằng bảng chuyển trạng thái `{ from: to[] }`.
- **Backend thật**: thay `lib/order-store.ts` bằng Route Handlers / Server Actions gọi DB (Postgres + Prisma/Drizzle); giữ nguyên `schemas/` để validate cả client lẫn server. Realtime: SSE/WebSocket hoặc Supabase Realtime thay cho sự kiện `storage`.
- **Auth thật**: thay `switchRole` bằng đăng nhập OTP qua SĐT; `lib/session.ts` vẫn dùng được, chỉ cần đổi nguồn `userId` và đặt `SESSION_SECRET` mạnh. Kiểm tra quyền (thợ chỉ cập nhật đơn của mình) phải chuyển lên server.
- **Bản đồ & check-in GPS**: thay ô địa chỉ bằng autocomplete (Goong/Google Places), check-in so khoảng cách vị trí thợ với địa chỉ đơn.
