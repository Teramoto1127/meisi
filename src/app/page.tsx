import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-brand-dark">meisi</h1>
        <p className="max-w-md text-gray-600">
          名刺の作成から交換まで、すべてアプリ内で完結する電子名刺サービスです。
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/signup"
          className="rounded-lg bg-brand px-6 py-3 font-medium text-white transition hover:bg-brand-dark"
        >
          はじめる
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-brand px-6 py-3 font-medium text-brand transition hover:bg-brand/10"
        >
          ログイン
        </Link>
      </div>
    </main>
  );
}
