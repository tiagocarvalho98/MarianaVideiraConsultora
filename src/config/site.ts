function normalizeSiteUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredUrl) {
    return normalizeSiteUrl(configuredUrl);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_SITE_URL");
  }

  return "http://localhost:3000";
}
