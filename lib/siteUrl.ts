function resolveSiteUrl(): URL {
  const configuredUrl = process.env.APP_BASE_URL?.trim();
  const deploymentHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const url = configuredUrl
    ? new URL(configuredUrl)
    : new URL(
        deploymentHost ? `https://${deploymentHost}` : "http://localhost:3000",
      );

  return new URL(url.origin);
}

export const siteUrl = resolveSiteUrl();
