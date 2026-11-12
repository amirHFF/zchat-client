const ocrBaseUrl = import.meta.env.VITE_OCR_BASE_URL;
const maxFileSizeMb = Number(import.meta.env.VITE_OCR_MAX_FILE_SIZE_MB) || 5;
const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
// nginx on the OCR server rejects request bodies over 1MB with a 413 that has
// no CORS headers, which the browser reports as a network error. Phone camera
// photos are usually several MB, so they are shrunk below this size first.
const uploadTargetBytes = 900 * 1024;
const maxImageDimension = 2000;

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

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image could not be decoded"));
    };
    image.src = url;
  });
}

function canvasToJpeg(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

// Resizes and re-encodes large images as JPEG so they fit the server's upload
// limit. Returns the original file if it is already small enough or if the
// browser cannot decode it.
async function shrinkImageForUpload(file: File): Promise<File> {
  if (file.size <= uploadTargetBytes) return file;

  let image: HTMLImageElement;
  try {
    image = await loadImage(file);
  } catch {
    return file;
  }
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  if (!width || !height) return file;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return file;

  let scale = Math.min(1, maxImageDimension / Math.max(width, height));
  for (let attempt = 0; attempt < 6; attempt++) {
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    // JPEG has no transparency; paint white so transparent PNG areas stay light.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await canvasToJpeg(canvas, 0.85);
    if (blob && blob.size <= uploadTargetBytes) {
      const name = `${file.name.replace(/\.[^.]*$/, "") || "image"}.jpg`;
      return new File([blob], name, { type: "image/jpeg" });
    }
    scale *= 0.8;
  }
  return file;
}

export async function uploadImageForOcr(originalFile: File): Promise<string> {
  if (!isSupportedImage(originalFile)) {
    throw new OcrRequestError("unsupportedImage");
  }
  if (!ocrBaseUrl?.trim()) throw new OcrRequestError("missingBaseUrl");
  const file = await shrinkImageForUpload(originalFile);
  if (file.size > maxFileSizeBytes) {
    throw new OcrRequestError("fileTooLarge", maxFileSizeMb);
  }

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
