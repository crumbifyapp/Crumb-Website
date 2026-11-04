'use client';

import { useState } from 'react';

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 rounded-md border border-crumb-teal/30 px-2.5 py-1 text-xs font-semibold text-crumb-teal transition hover:bg-crumb-teal/10"
    >
      {copied ? 'Copied' : 'Copy link'}
    </button>
  );
}
