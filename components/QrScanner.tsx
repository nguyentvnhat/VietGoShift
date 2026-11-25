"use client";

import jsQR from "jsqr";
import { useEffect, useRef, useState } from "react";
import { Button, inputClass } from "./ui";

type Props = {
  title: string;
  onScan: (text: string) => Promise<string | null>; // trả về lỗi để quét tiếp, null nếu thành công
  onClose: () => void;
};

export function QrScanner({ title, onScan, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const busy = useRef(false);
  const onScanRef = useRef(onScan);
  const [cameraError, setCameraError] = useState<string>();
  const [error, setError] = useState<string>();
  const [manual, setManual] = useState("");

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  async function submit(text: string) {
    if (busy.current) return;
    busy.current = true;
    const err = await onScanRef.current(text);
    setError(err ?? undefined);
    // Chờ chút trước khi quét lại để không spam cùng một mã lỗi.
    setTimeout(() => (busy.current = false), err ? 1500 : 0);
  }
  const submitRef = useRef(submit);
  useEffect(() => {
    submitRef.current = submit;
  });

  useEffect(() => {
    let stream: MediaStream | undefined;
    let frame = 0;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    function tick() {
      const video = videoRef.current;
      if (video && ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const code = jsQR(
          ctx.getImageData(0, 0, canvas.width, canvas.height).data,
          canvas.width,
          canvas.height,
        );
        if (code?.data) submitRef.current(code.data);
      }
      frame = requestAnimationFrame(tick);
    }

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment" } })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
        }
        frame = requestAnimationFrame(tick);
      })
      .catch(() => setCameraError("Không mở được camera — dán mã bên dưới để thay thế."));

    if (!navigator.mediaDevices) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- trình duyệt không hỗ trợ camera
      setCameraError("Trình duyệt không hỗ trợ camera (cần HTTPS hoặc localhost).");
    }

    return () => {
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-30 flex flex-col bg-slate-950/95 text-white"
      role="dialog"
      aria-label={title}
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="text-2xl">
            ×
          </button>
        </div>

        <div className="relative aspect-square overflow-hidden rounded-2xl bg-black">
          <video ref={videoRef} muted playsInline className="size-full object-cover" />
          <div className="pointer-events-none absolute inset-10 rounded-xl border-2 border-emerald-400" />
          {cameraError && (
            <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-slate-300">
              {cameraError}
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-500/20 p-2 text-center text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2">
          <label htmlFor="manual-code" className="text-xs text-slate-400">
            Hoặc dán mã (demo trên 1 máy)
          </label>
          <textarea
            id="manual-code"
            rows={2}
            className={`${inputClass} text-slate-900`}
            value={manual}
            onChange={(e) => setManual(e.target.value)}
          />
          <Button disabled={!manual.trim()} onClick={() => submit(manual)}>
            Xác nhận mã
          </Button>
        </div>
      </div>
    </div>
  );
}
