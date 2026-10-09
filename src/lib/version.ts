export const appVersion =
  process.env.NEXT_PUBLIC_APP_VERSION ??
  process.env.GITHUB_REF_NAME ??
  process.env.npm_package_version ??
  "dev";
