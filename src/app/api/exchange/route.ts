import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 名刺交換を実行するAPI。ログイン中のユーザーと指定usernameの相手を
// 双方向に connections テーブルへ登録する(exchange_cards RPCを利用)。
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const username = body?.username as string | undefined;
  const via = (body?.via as string | undefined) ?? "link";

  if (!username) {
    return NextResponse.json({ error: "相手の名刺IDが指定されていません。" }, { status: 400 });
  }

  const { data: target, error: targetError } = await supabase
    .from("profiles")
    .select("id, username, full_name")
    .eq("username", username)
    .single();

  if (targetError || !target) {
    return NextResponse.json({ error: "指定された名刺が見つかりません。" }, { status: 404 });
  }

  if (target.id === user.id) {
    return NextResponse.json({ error: "自分の名刺とは交換できません。" }, { status: 400 });
  }

  const { error: exchangeError } = await supabase.rpc("exchange_cards", {
    other_user_id: target.id,
    via,
  });

  if (exchangeError) {
    return NextResponse.json({ error: exchangeError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, profile: target });
}
