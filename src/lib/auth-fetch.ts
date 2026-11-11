function resolveRequestUrl(url: string): string {
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

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let token = "";

  // Check if we are running on the server
  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    token = cookieStore.get("rental_token")?.value || "";
  } else {
    // We are running on the client
    const match = document.cookie.match(new RegExp("(^| )rental_token=([^;]+)"));
    if (match) {
      token = match[2];
    }
  }

  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(resolveRequestUrl(url), {
    ...options,
    headers,
  });
}
