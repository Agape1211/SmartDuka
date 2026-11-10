export const siteOrigin =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://dukasmart.online";
export const appOrigin =
  process.env.NEXT_PUBLIC_APP_URL ?? siteOrigin;

export const siteHostname = new URL(siteOrigin).hostname;
export const appHostname = new URL(appOrigin).hostname;

export function appUrl(path: string): string {
  return new URL(path, appOrigin).toString();
}
