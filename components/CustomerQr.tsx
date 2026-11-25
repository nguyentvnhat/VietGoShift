"use client";

import QRCode from "qrcode";
import { useCallback, useEffect, useState } from "react";
import { issueScanToken } from "@/app/actions";
import { useNow } from "@/hooks/useNow";
import { SCAN_TOKEN_TTL_SECONDS, type ScanAction } from "@/lib/scan-token";
import { Button } from "./ui";

const COPY: Record<ScanAction, { title: string; hint: string }> = {
  check_in: {
    title: "Mã check-in",
    hint: "Khi thợ tới nơi, đưa mã này cho thợ quét để xác nhận thợ đã có mặt.",
  },
  check_out: {
    title: "Mã check-out & nghiệm thu",
    hint: "Kiểm tra bàn giao xong, đưa mã này cho thợ quét để xác nhận hoàn thành.",
  },
};

type Qr = { token: string; image: string; expiresAt: number };

export function CustomerQr({ orderId, action }: { orderId: string; action: ScanAction }) {
  const now = useNow(1_000);
  const [qr, setQr] = useState<Qr>();
  const [error, setError] = useState<string>();
  const [copied, setCopied] = useState(false);

  const generate = useCallback(async () => {
    setError(undefined);
    try {
      const token = await issueScanToken(orderId, action);
      const image = await QRCode.toDataURL(token, { width: 480, margin: 1 });
      setQr({ token, image, expiresAt: Date.now() + SCAN_TOKEN_TTL_SECONDS * 1000 });
    } catch {
      setError("Không tạo được mã. Hãy đảm bảo bạn đang ở vai Khách.");
    }
  }, [orderId, action]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tạo mã một lần khi mở thẻ
    generate();
  }, [generate]);

  const secondsLeft = qr ? Math.max(0, Math.round((qr.expiresAt - now.getTime()) / 1000)) : 0;
  const expired = qr && secondsLeft === 0;

  return (
    <div className="flex flex-col items-center gap-3 text-center" data-testid={`qr-${action}`}>
      <div>
        <h2 className="font-semibold">{COPY[action].title}</h2>
        <p className="text-sm text-slate-500">{COPY[action].hint}</p>
      </div>

      <div className="relative size-56 rounded-2xl bg-white p-2 ring-1 ring-slate-200">
        {qr && (
          // eslint-disable-next-line @next/next/no-img-element -- QR tạo cục bộ dạng data URL
          <img
            src={qr.image}
            alt={COPY[action].title}
            className={`size-full ${expired ? "opacity-20" : ""}`}
          />
        )}
        {expired && (
          <span className="absolute inset-0 flex items-center justify-center font-semibold text-slate-700">
            Mã đã hết hạn
          </span>
        )}
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}

      {qr && !expired && (
        <p className="text-xs text-slate-500">
          Hết hạn sau {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
        </p>
      )}

      <div className="flex w-full gap-2">
        <Button variant="secondary" onClick={generate}>
          Tạo mã mới
        </Button>
        {qr && !expired && (
          <Button
            variant="secondary"
            onClick={async () => {
              await navigator.clipboard.writeText(qr.token);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? "Đã sao chép ✓" : "Sao chép mã"}
          </Button>
        )}
      </div>
    </div>
  );
}
