"use client";

export function BackLink() {
  return (
    <a
      href="/"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 14,
        fontWeight: 600,
        color: "var(--color-crumb-teal)",
        textDecoration: "none",
        fontFamily: "inherit",
        transition: "color 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-crumb-teal-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-crumb-teal)";
      }}
    >
      <span style={{ fontSize: 16 }}>&#8592;</span> Back to home
    </a>
  );
}
