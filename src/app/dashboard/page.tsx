import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/card";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  const profile = data as Profile | null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-dark">マイページ</h1>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            ログアウト
          </button>
        </form>
      </div>

      <p className="mt-6 text-gray-600">
        ようこそ、{profile?.full_name || user.email} さん。
      </p>
      <p className="mt-2 text-sm text-gray-500">
        あなたの名刺ID: <span className="font-mono">{profile?.username}</span>
      </p>
    </main>
  );
}
