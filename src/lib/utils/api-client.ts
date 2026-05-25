export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string; rawText?: string };

export async function readApiResponse<T>(response: Response): Promise<ApiResult<T>> {
  const rawText = await response.text();
  let parsed: any = null;

  if (rawText) {
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error:
        parsed?.error ||
        parsed?.message ||
        rawText ||
        `Request failed with status ${response.status}`,
      rawText,
    };
  }

  if (parsed === null) {
    return {
      ok: false,
      status: response.status,
      error: 'Server returned an invalid JSON response.',
      rawText,
    };
  }

  return { ok: true, status: response.status, data: parsed as T };
}
