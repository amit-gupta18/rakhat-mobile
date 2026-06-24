import { Directory, File as ExpoFile, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { getInvoicePdf } from "../api/endpoints/invoices";

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9-]/g, "_");
}

/** Always fetch a new presigned URL from the server (source of truth). */
export async function fetchFreshInvoicePdfUrl(invoiceId: string): Promise<string> {
  const { url } = await getInvoicePdf(invoiceId);
  if (!url) {
    throw new Error("PDF is not available for this invoice.");
  }
  return url;
}

/** Download the server-generated PDF to a unique cache file. */
export async function downloadInvoicePdfToFile(
  invoiceId: string,
  invoiceNumber: string
): Promise<ExpoFile> {
  const url = await fetchFreshInvoicePdfUrl(invoiceId);
  const pdfDir = new Directory(Paths.cache, "pdfs");

  if (!pdfDir.exists) {
    pdfDir.create();
  }

  const target = new ExpoFile(
    pdfDir,
    `${sanitizeFileName(invoiceNumber)}-${Date.now()}.pdf`
  );

  return (await ExpoFile.downloadFileAsync(url, target, {
    idempotent: true,
  })) as ExpoFile;
}

/** Open the native share sheet (WhatsApp, Telegram, etc.) with the server PDF. */
export async function shareInvoicePdf(
  invoiceId: string,
  invoiceNumber: string
): Promise<void> {
  const file = await downloadInvoicePdfToFile(invoiceId, invoiceNumber);

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Sharing is not available on this device.");
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: "application/pdf",
    dialogTitle: `Share invoice ${invoiceNumber}`,
    UTI: "com.adobe.pdf",
  });
}

/** Load server PDF as base64 for in-app WebView preview. */
export async function loadInvoicePdfBase64(
  invoiceId: string,
  invoiceNumber: string
): Promise<string> {
  const file = await downloadInvoicePdfToFile(invoiceId, invoiceNumber);
  const base64 = await file.base64();
  if (!base64 || base64.length < 16) {
    throw new Error("Downloaded PDF was empty or invalid.");
  }
  return base64;
}
