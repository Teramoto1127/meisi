import Link from "next/link";
import { QrScanner } from "@/components/QrScanner";

export default function ScanPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <div>
        <h1 className="text-xl font-bold text-brand-dark">QRコードを読み取る</h1>
        <p className="mt-1 text-sm text-gray-500">
          相手の名刺QRコードにカメラを向けてください。
        </p>
      </div>

      <QrScanner />

      <Link href="/dashboard/qr" className="text-sm text-gray-500 hover:underline">
        ← 自分のQRコードを表示する
      </Link>
    </main>
  );
}
