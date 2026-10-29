/**
 * src/app/not-found.tsx
 *
 * Global 404. The share pages (place, review, post, u) call notFound() for a
 * malformed id so crawlers and link checkers get a real 404 status instead of
 * a 200 "not found" block.
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found - Crumbify",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4ECE1] px-6 py-16 text-center text-[#1A1208]">
      <h1 className="mb-4 text-2xl font-semibold">Page not found</h1>
      <p className="mb-6 max-w-sm text-base text-[#4a3f33]">
        This link doesn&apos;t go anywhere on Crumbify.
      </p>
      <Link href="/" className="text-base font-semibold underline underline-offset-4">
        Back to Crumbify
      </Link>
    </div>
  );
}
