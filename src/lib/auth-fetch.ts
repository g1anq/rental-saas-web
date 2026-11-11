export function resolveBrowserApiUrl(url: string): string {
  if (typeof window === "undefined") {
    return url;
  }

  const requestUrl = new URL(url, window.location.origin);
  const isLoopback = (hostname: string) =>
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "[::1]";

  if (isLoopback(requestUrl.hostname) && !isLoopback(window.location.hostname)) {
    requestUrl.hostname = window.location.hostname;
  }

  return requestUrl.toString();
}

function resolveInternalRequestUrl(url: string): string {
  const internalApiUrl = process.env.INTERNAL_API_URL;
  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!internalApiUrl || !publicApiUrl) return url;

  const requestUrl = new URL(url);
  const publicBase = new URL(publicApiUrl);
  const publicPath = publicBase.pathname.replace(/\/$/, "");
  if (
    requestUrl.origin !== publicBase.origin ||
    (publicPath && requestUrl.pathname !== publicPath && !requestUrl.pathname.startsWith(`${publicPath}/`))
  ) {
    return url;
  }

  const apiPath = requestUrl.pathname.slice(publicPath.length) || "/";
  return new URL(`${apiPath}${requestUrl.search}${requestUrl.hash}`, internalApiUrl).toString();
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let token = "";

  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    token = cookieStore.get("rental_session")?.value || "";
  }

  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const requestUrl = typeof window === "undefined"
    ? resolveInternalRequestUrl(url)
    : resolveBrowserApiUrl(url);

  return fetch(requestUrl, {
    ...options,
    credentials: options.credentials ?? "include",
    headers,
  });
}
