const isNode = typeof window === "undefined";

const isClearAccessTokenRequested = (): boolean =>
  !isNode &&
  new URLSearchParams(window.location.search).get("clear_access_token") ===
    "true";

const clearStoredAccessToken = (): void => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("usifizzy_access_token");
    window.localStorage.removeItem("token");
  }
};

interface AppParams {
  appId: string;
  token: string | null;
  functionsVersion: string;
  appBaseUrl: string;
}

const getAppParams = (): AppParams => {
  if (isClearAccessTokenRequested()) {
    clearStoredAccessToken();
  }

  const localToken =
    typeof window !== "undefined"
      ? window.localStorage.getItem("usifizzy_access_token") ||
        window.localStorage.getItem("token")
      : null;

  return {
    appId: process.env.NEXT_PUBLIC_USIFIZZY_APP_ID || "usifizzy_local_dev",
    token: localToken,
    functionsVersion:
      (!isNode &&
        new URLSearchParams(window.location.search)
          .get("functions_version")
          ?.trim()) ||
      process.env.NEXT_PUBLIC_USIFIZZY_FUNCTIONS_VERSION ||
      "v1",
    appBaseUrl:
      process.env.NEXT_PUBLIC_USIFIZZY_APP_BASE_URL || "http://localhost:5000",
  };
};

export const appParams: AppParams = {
  ...getAppParams(),
};
