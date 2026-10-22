import { NextResponse } from "next/server";
import { isValidReferralCode } from "@/lib/referral-code";
import {
  detectPlatform,
  recordReferralClick,
  type Platform,
} from "@/lib/referral-click";

export const dynamic = "force-dynamic";

function resolveDestination(platform: Platform): string {
  if (platform === "ios") {
    return process.env.NEXT_PUBLIC_APP_STORE_URL || "/";
  }
  if (platform === "android") {
    return process.env.NEXT_PUBLIC_PLAY_STORE_URL || "/";
  }
  return "/";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code || !isValidReferralCode(code)) {
    return NextResponse.redirect(new URL("/", request.url), 302);
  }

  const platform = detectPlatform(request.headers.get("user-agent"));
  await recordReferralClick(request, code, platform);

  const destination = resolveDestination(platform);
  return NextResponse.redirect(new URL(destination, request.url), 302);
}
