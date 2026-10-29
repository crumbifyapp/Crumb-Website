import type { FaqEntry } from "@/lib/structured-data";

/** Single source for the visible FAQ and its FAQPage JSON-LD. Facts from /support. */
export const FAQS: readonly FaqEntry[] = [
  {
    question: "What is Crumbify?",
    answer:
      "Crumbify is a social food app for iPhone. You follow friends, see the restaurants they post and how they score them out of ten, keep lists of places you have visited and places you have saved to try, and discover new spots on a map.",
  },
  {
    question: "Is Crumbify free?",
    answer:
      "Yes. Crumbify is free to download and use. Crumbify Premium is optional: it gives you Monthly Wrapped, removes Google ads (clearly labelled sponsored restaurant picks still appear, about half as often), and unlocks unlimited profile collections with a premium cover library plus a premium profile badge.",
  },
  {
    question: "Which phones does Crumbify work on?",
    answer: "Crumbify is out now on iPhone (iOS 16 or later). Android is coming soon.",
  },
  {
    question: "How do I add restaurants?",
    answer:
      "Share a TikTok or Instagram post into Crumbify from the share sheet, paste a Google Maps list link, or search for a place by name.",
  },
  {
    question: "How is Crumbify different from Google reviews?",
    answer:
      "Scores on Crumbify come from friends you choose to follow, not from strangers. You see where the people you trust actually eat and how they rate it.",
  },
];
