import { CRUMBIFY_LOGO_PATHS } from "./crumbify-logo-paths";

export function CrumbifyLogo() {
  return (
    <svg
      className="logo"
      viewBox="0 0 1158 1163"
      fill="currentColor"
      fillRule="evenodd"
      role="img"
      aria-label="Crumbify"
    >
      {CRUMBIFY_LOGO_PATHS.map((d) => (
        <path key={d} d={d} fill="currentColor" fillRule="evenodd" />
      ))}
    </svg>
  );
}
