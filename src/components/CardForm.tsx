"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CardPreview } from "@/components/CardPreview";
import { FormMessage } from "@/components/FormMessage";
import type { Profile } from "@/types/card";

type Props = {
  userId: string;
  initialProfile: Profile;
};

type FormState = Pick<
  Profile,
  "username" | "full_name" | "company" | "job_title" | "email" | "phone" | "website" | "bio"
>;

export function CardForm({ userId, initialProfile }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    username: initialProfile.username,
    full_name: initialProfile.full_name,
    company: initialProfile.company,
    job_title: initialProfile.job_title,
    email: initialProfile.email,
    phone: initialProfile.phone,
    website: initialProfile.website,
    bio: initialProfile.bio,
  });
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialProfile.avatar_url);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const supabase = createClient();
    let newAvatarUrl = avatarUrl;

    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });

      if (uploadError) {
        setLoading(false);
        setError(`画像のアップロードに失敗しました: ${uploadError.message}`);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
      newAvatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ ...form, avatar_url: newAvatarUrl })
      .eq("id", userId);

    setLoading(false);

    if (updateError) {
      setError(
        updateError.message.includes("username_format") || updateError.code === "23505"
          ? "この名刺IDはすでに使われているか、形式が正しくありません(英数字・_-のみ、3〜20文字)。"
          : updateError.message
      );
      return;
    }

    setAvatarUrl(newAvatarUrl);
    setSuccess("名刺を更新しました。");
    router.refresh();
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          プロフィール画像
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          名刺ID (公開URLに使われます・英数字と_-のみ)
          <input
            required
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_-]+"
            value={form.username}
            onChange={(e) => update("username", e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          氏名
          <input
            value={form.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            会社名
            <input
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            役職
            <input
              value={form.job_title}
              onChange={(e) => update("job_title", e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          メールアドレス
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            電話番号
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Webサイト
            <input
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          自己紹介
          <textarea
            rows={3}
            value={form.bio}
            onChange={(e) => update("bio", e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none"
          />
        </label>

        <FormMessage error={error} success={success} />

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand px-4 py-2 font-medium text-white transition hover:bg-brand-dark disabled:opacity-50"
        >
          {loading ? "保存中..." : "保存する"}
        </button>
      </form>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-500">プレビュー</p>
        <CardPreview
          profile={{
            ...form,
            avatar_url: avatarPreview,
          }}
        />
      </div>
    </div>
  );
}
