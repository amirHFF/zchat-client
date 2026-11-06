const ocrBaseUrl = import.meta.env.VITE_OCR_BASE_URL;
const maxFileSizeMb = Number(import.meta.env.VITE_OCR_MAX_FILE_SIZE_MB) || 5;
const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export type OcrErrorCode =
  | "unsupportedImage"
  | "fileTooLarge"
  | "missingBaseUrl"
  | "requestFailed"
  | "invalidResponse"
  | "emptyContext"
  | "timeout"
  | "network"
  | "unknown";

export class OcrRequestError extends Error {
  readonly code: OcrErrorCode;
  readonly maxFileSizeMb?: number;

  constructor(
    code: OcrErrorCode,
    maxFileSizeMb?: number,
  ) {
    super(code);
    this.name = "OcrRequestError";
    this.code = code;
    this.maxFileSizeMb = maxFileSizeMb;
  }
}

function isSupportedImage(file: File): boolean {
  const mimeType = file.type.toLowerCase();
  if (allowedMimeTypes.has(mimeType)) return true;
  return (
    /\.jfif$/i.test(file.name) &&
    ["", "image/jpeg", "image/jfif"].includes(mimeType)
  );
}

export async function uploadImageForOcr(file: File): Promise<string> {
  if (!isSupportedImage(file)) throw new OcrRequestError("unsupportedImage");
  if (file.size > maxFileSizeBytes) {
    throw new OcrRequestError("fileTooLarge", maxFileSizeMb);
  }
  if (!ocrBaseUrl?.trim()) throw new OcrRequestError("missingBaseUrl");

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 30_000);
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(
      `${ocrBaseUrl.replace(/\/+$/, "")}/ai/ocr/text`,
      { method: "POST", body: formData, signal: controller.signal },
    );
    if (!response.ok) throw new OcrRequestError("requestFailed");

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new OcrRequestError("invalidResponse");
    }

    const context =
      typeof payload === "object" && payload !== null && "context" in payload
        ? (payload as { context?: unknown }).context
        : undefined;
    if (typeof context !== "string" || !context.trim()) {
      throw new OcrRequestError("emptyContext");
    }
    return context;
  } catch (error) {
    if (error instanceof OcrRequestError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new OcrRequestError("timeout");
    }
    if (error instanceof TypeError) throw new OcrRequestError("network");
    throw new OcrRequestError("unknown");
  } finally {
    window.clearTimeout(timeoutId);
  }
}
