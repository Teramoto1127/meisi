"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const READER_ID = "qr-reader";

export function QrScanner() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scannedText, setScannedText] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "starting" | "running">("idle");

  useEffect(() => {
    let cancelled = false;

    async function start() {
      setStatus("starting");
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;

        const scanner = new Html5Qrcode(READER_ID);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 240 },
          (decodedText) => {
            handleDecoded(decodedText);
          },
          () => {
            // フレームごとの読み取り失敗は無視(継続してスキャン)
          }
        );
        if (!cancelled) setStatus("running");
      } catch {
        if (!cancelled) {
          setError("カメラを起動できませんでした。ブラウザのカメラ権限を確認してください。");
          setStatus("idle");
        }
      }
    }

    function handleDecoded(decodedText: string) {
      if (scannedText) return; // 二重処理防止
      setScannedText(decodedText);
      void scannerRef.current?.stop().catch(() => {});

      try {
        const url = new URL(decodedText);
        if (url.origin === window.location.origin) {
          router.push(url.pathname + url.search);
          return;
        }
      } catch {
        // URLとして解釈できない場合はテキストをそのまま表示するのみ
      }
    }

    start();

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      if (scanner) {
        scanner.stop().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full">
      <div
        id={READER_ID}
        ref={containerRef}
        className="mx-auto w-full max-w-xs overflow-hidden rounded-xl border border-gray-200 bg-black"
      />
      {status === "starting" && (
        <p className="mt-3 text-sm text-gray-500">カメラを起動しています...</p>
      )}
      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      {scannedText && !error && (
        <p className="mt-3 text-sm text-gray-500">
          読み取った内容:{" "}
          <a href={scannedText} className="text-brand hover:underline">
            {scannedText}
          </a>
        </p>
      )}
    </div>
  );
}
