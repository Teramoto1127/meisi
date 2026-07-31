import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { QrCodeCard } from "@/components/QrCodeCard";
import type { Profile } from "@/types/card";

export default async function MyQrPage() {
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
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <div>
        <h1 className="text-xl font-bold text-brand-dark">あなたの名刺QRコード</h1>
        <p className="mt-1 text-sm text-gray-500">
          相手にこのQRコードを読み取ってもらうと名刺交換できます。
        </p>
      </div>

      <QrCodeCard username={profile.username} />

      <div className="flex gap-4 text-sm">
        <Link href="/scan" className="text-brand hover:underline">
          相手のQRコードを読み取る →
        </Link>
        <Link href="/dashboard" className="text-gray-500 hover:underline">
          ← マイページ
        </Link>
      </div>
    </main>
  );
}
