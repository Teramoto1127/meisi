"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SearchConnectionPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    router.push(`/exchange?with=${encodeURIComponent(trimmed)}&via=search`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">名刺IDで交換</h1>
        <p className="mt-1 text-sm text-gray-500">
          相手の名刺ID(ユーザー名)を入力して名刺交換できます。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          名刺ID
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="例: taro123"
            className="rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-2 font-medium text-white transition hover:bg-brand-dark"
        >
          検索して交換する
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        <Link href="/scan" className="text-brand hover:underline">
          QRコードで交換する →
        </Link>
      </p>
    </main>
  );
}
