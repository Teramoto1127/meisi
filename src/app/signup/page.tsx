"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FormMessage } from "@/components/FormMessage";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setSuccess("確認メールを送信しました。メール内のリンクから登録を完了してください。");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">アカウント作成</h1>
        <p className="mt-1 text-sm text-gray-500">
          メールアドレスとパスワードで登録すると、自動的にあなたの名刺が作成されます。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          メールアドレス
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          パスワード
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none"
          />
        </label>

        <FormMessage error={error} success={success} />

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand px-4 py-2 font-medium text-white transition hover:bg-brand-dark disabled:opacity-50"
        >
          {loading ? "登録中..." : "登録する"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        すでにアカウントをお持ちですか？{" "}
        <Link href="/login" className="text-brand hover:underline">
          ログイン
        </Link>
      </p>
    </main>
  );
}
