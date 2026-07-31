import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CardPreview } from "@/components/CardPreview";
import type { Profile } from "@/types/card";

type Props = {
  params: { username: string };
};

async function getProfile(username: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();
  return data as Profile | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getProfile(params.username);
  if (!profile) {
    return { title: "名刺が見つかりません | meisi" };
  }
  const name = profile.full_name || profile.username;
  return {
    title: `${name} の名刺 | meisi`,
    description: profile.bio || `${name} さんの電子名刺です。`,
  };
}

export default async function PublicCardPage({ params }: Props) {
  const profile = await getProfile(params.username);

  if (!profile) {
    notFound();
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = user?.id === profile.id;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 py-12">
      <CardPreview profile={profile} />

      <div className="flex flex-wrap justify-center gap-3">
        {isOwner ? (
          <Link
            href="/dashboard/edit"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            この名刺を編集する
          </Link>
        ) : user ? (
          <Link
            href={`/exchange?with=${profile.username}`}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            名刺交換する
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            ログインして名刺交換する
          </Link>
        )}
      </div>
    </main>
  );
}
