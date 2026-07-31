import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Connection, Profile } from "@/types/card";

export default async function ConnectionsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/connections");
  }

  const { data: connectionsData } = await supabase
    .from("connections")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const connections = (connectionsData ?? []) as Connection[];

  const ids = connections.map((c) => c.connected_user_id);
  let profiles: Profile[] = [];
  if (ids.length > 0) {
    const { data: profilesData } = await supabase.from("profiles").select("*").in("id", ids);
    profiles = (profilesData ?? []) as Profile[];
  }
  const profileById = new Map(profiles.map((p) => [p.id, p]));

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-dark">交換した名刺一覧</h1>
        <Link href="/dashboard" className="text-sm text-brand hover:underline">
          ← マイページに戻る
        </Link>
      </div>

      <div className="mb-6 flex gap-3 text-sm">
        <Link
          href="/scan"
          className="rounded-lg bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark"
        >
          QRコードで交換
        </Link>
        <Link
          href="/connections/search"
          className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          IDで交換
        </Link>
      </div>

      {connections.length === 0 ? (
        <p className="text-sm text-gray-500">
          まだ名刺交換をしていません。QRコードまたは名刺IDで交換してみましょう。
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {connections.map((conn) => {
            const profile = profileById.get(conn.connected_user_id);
            if (!profile) return null;
            return (
              <li key={conn.id}>
                <Link
                  href={`/card/${profile.username}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {profile.full_name || profile.username}
                    </p>
                    <p className="text-sm text-gray-500">
                      {profile.job_title}
                      {profile.job_title && profile.company ? " @ " : ""}
                      {profile.company}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(conn.created_at).toLocaleDateString("ja-JP")}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
