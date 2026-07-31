import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CardPreview } from "@/components/CardPreview";
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

      {profile && (
        <div className="mt-6">
          <CardPreview profile={profile} />
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link
              href="/dashboard/edit"
              className="rounded-lg bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark"
            >
              名刺を編集
            </Link>
            <Link
              href={`/card/${profile.username}`}
              className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
              公開ページを見る
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
