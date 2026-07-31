import Image from "next/image";
import type { Profile } from "@/types/card";

type Props = {
  profile: Pick<
    Profile,
    | "full_name"
    | "company"
    | "job_title"
    | "email"
    | "phone"
    | "website"
    | "bio"
    | "avatar_url"
    | "username"
  >;
};

export function CardPreview({ profile }: Props) {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="h-16 bg-gradient-to-r from-brand to-brand-light" />
      <div className="-mt-8 flex items-end gap-4 px-6">
        <div className="h-16 w-16 overflow-hidden rounded-full border-4 border-white bg-gray-100">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name || profile.username}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl font-bold text-gray-400">
              {(profile.full_name || profile.username || "?").slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pb-6 pt-3">
        <h2 className="text-lg font-bold text-gray-900">
          {profile.full_name || "(氏名未設定)"}
        </h2>
        {(profile.job_title || profile.company) && (
          <p className="text-sm text-gray-600">
            {profile.job_title}
            {profile.job_title && profile.company ? " @ " : ""}
            {profile.company}
          </p>
        )}

        {profile.bio && <p className="mt-3 text-sm text-gray-700">{profile.bio}</p>}

        <dl className="mt-4 space-y-1 text-sm text-gray-600">
          {profile.email && (
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-gray-400">Email</dt>
              <dd className="truncate">{profile.email}</dd>
            </div>
          )}
          {profile.phone && (
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-gray-400">Tel</dt>
              <dd>{profile.phone}</dd>
            </div>
          )}
          {profile.website && (
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-gray-400">Web</dt>
              <dd className="truncate">{profile.website}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
