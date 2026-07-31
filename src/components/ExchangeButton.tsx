"use client";

import { useState } from "react";
import Link from "next/link";
import { FormMessage } from "@/components/FormMessage";

type Props = {
  username: string;
  via: "qr" | "link" | "search";
};

export function ExchangeButton({ username, via }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleExchange() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, via }),
    });
    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "名刺交換に失敗しました。");
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="rounded-md bg-green-50 px-4 py-2 text-sm text-green-700">
          名刺交換が完了しました！
        </p>
        <Link href="/connections" className="text-sm text-brand hover:underline">
          交換した名刺一覧を見る →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleExchange}
        disabled={loading}
        className="rounded-lg bg-brand px-6 py-3 font-medium text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        {loading ? "交換中..." : "名刺交換する"}
      </button>
      <FormMessage error={error} />
    </div>
  );
}
