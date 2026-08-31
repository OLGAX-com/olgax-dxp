// Optional self-hosted Umami integration (https://umami.is) - broader analytics
// (countries, sessions, devices, browsers, referrers, UTM campaigns) than the
// built-in PageViews collection, without olgax-dxp reimplementing any of that
// itself. Entirely opt-in: unset env vars means zero script, zero extra network
// calls, same zero-config default experience as before.
export function getUmamiConfig() {
  const scriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const dashboardUrl = process.env.NEXT_PUBLIC_UMAMI_DASHBOARD_URL;

  return {
    enabled: Boolean(scriptUrl && websiteId),
    scriptUrl,
    websiteId,
    dashboardUrl,
  };
}
