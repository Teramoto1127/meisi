import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold text-brand-dark">ページが見つかりません</h1>
      <p className="text-gray-600">お探しの名刺またはページは存在しないか、削除された可能性があります。</p>
      <Link href="/" className="text-brand hover:underline">
        トップへ戻る
      </Link>
    </main>
  );
}
