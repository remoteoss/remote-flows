// The example app does not use PostCSS/Tailwind — the SDK ships prebuilt CSS.
// This empty config exists to stop Vite's upward config search from reaching
// the repo-root postcss.config.mjs (the SDK's), whose @tailwindcss/postcss
// plugin is not installed in the example's dependency tree (it fails on
// Vercel, where only example/ gets an install).
export default {
  plugins: {},
};
