export type QueryValue = string | number | boolean | null | undefined;

/** Appends a query string, skipping empty values. */
export function withQuery(path: string, query: Readonly<Record<string, QueryValue>>): string {
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(name, String(value));
  }
  const text = params.toString();
  return text ? `${path}${path.includes('?') ? '&' : '?'}${text}` : path;
}

/** Encodes one path segment (an id) so it can never add segments. */
export function seg(value: string | number): string {
  return encodeURIComponent(String(value));
}
