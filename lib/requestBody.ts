export type JsonBodyResult =
  | { ok: true; value: unknown }
  | { ok: false; status: 400 | 413; error: string };

export async function readBoundedText(
  source: {
    headers: Headers;
    body: ReadableStream<Uint8Array> | null;
  },
  maxBytes: number,
): Promise<string | null> {
  const contentLength = Number(source.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return null;
  }

  const reader = source.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

export async function readJsonBody(
  request: Request,
  maxBytes: number,
): Promise<JsonBodyResult> {
  let text: string;
  try {
    const body = await readBoundedText(request, maxBytes);
    if (body === null) {
      return { ok: false, status: 413, error: "Request body is too large" };
    }
    text = body;
  } catch {
    return { ok: false, status: 400, error: "Unable to read request body" };
  }
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON request" };
  }
}
