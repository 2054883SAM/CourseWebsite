export function getBaseUrl(): string {
  // Client-side: prefer NEXT_PUBLIC_URL_LINK in production, else window.origin
  if (typeof window !== 'undefined') {
    const configured = process.env.NEXT_PUBLIC_URL_LINK;
    if (process.env.NODE_ENV === 'production' && configured) {
      return configured.replace(/\/$/, '');
    }
    return window.location.origin;
  }

  // Server-side: use URL_LINK (or NEXT_PUBLIC_URL_LINK), else localhost
  const nodeEnv = process.env.NODE_ENV;
  const configuredUrl = process.env.URL_LINK || process.env.NEXT_PUBLIC_URL_LINK;
  if (nodeEnv === 'production' && configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }
  return 'http://localhost:3000';
}

export function getAbsoluteUrl(path: string = '/'): string {
  const base = getBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
