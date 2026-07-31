import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CardPreview } from "@/components/CardPreview";
import { ExchangeButton } from "@/components/ExchangeButton";
import type { Profile } from "@/types/card";

type Props = {
  searchParams: { with?: string; via?: string };
};

export default async function ExchangePage({ searchParams }: Props) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/exchange${searchParams.with ? `?with=${searchParams.with}` : ""}`);
  }

  const username = searchParams.with;

  if (!username) {
    redirect("/connections/search");
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();
  const target = data as Profile | null;

  if (!target) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-gray-600">名刺ID「{username}」は見つかりませんでした。</p>
      </main>
    );
  }

  if (target.id === user.id) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-gray-600">これはあなた自身の名刺です。</p>
      </main>
    );
  }

  const via = searchParams.via === "qr" ? "qr" : "link";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 py-12">
      <p className="text-sm text-gray-500">この名刺と交換しますか？</p>
      <CardPreview profile={target} />
      <ExchangeButton username={target.username} via={via} />
    </main>
  );
}
