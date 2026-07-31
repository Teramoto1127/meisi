import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CardForm } from "@/components/CardForm";
import type { Profile } from "@/types/card";

export default async function EditCardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const profile = data as Profile | null;

  if (!profile) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-dark">名刺を編集</h1>
        <Link href="/dashboard" className="text-sm text-brand hover:underline">
          ← マイページに戻る
        </Link>
      </div>
      <CardForm userId={user.id} initialProfile={profile} />
    </main>
  );
}
