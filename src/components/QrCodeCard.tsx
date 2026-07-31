"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

type Props = {
  username: string;
};

export function QrCodeCard({ username }: Props) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    setUrl(`${window.location.origin}/exchange?with=${username}&via=qr`);
  }, [username]);

  if (!url) {
    return <div className="h-64 w-64 animate-pulse rounded-xl bg-gray-100" />;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <QRCodeSVG value={url} size={224} />
    </div>
  );
}
