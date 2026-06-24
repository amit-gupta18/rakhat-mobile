import { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { loadInvoicePdfBase64 } from "../utils/invoicePdf";
import {
  PDF_PREVIEW_HTML,
  buildPdfPreviewInjection,
} from "../utils/pdfPreviewHtml";

type InvoicePdfPreviewModalProps = {
  visible: boolean;
  invoiceId: string;
  invoiceNumber: string;
  onClose: () => void;
};

export function InvoicePdfPreviewModal({
  visible,
  invoiceId,
  invoiceNumber,
  onClose,
}: InvoicePdfPreviewModalProps) {
  const webViewRef = useRef<WebView>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [viewerKey, setViewerKey] = useState(0);
  const [webViewReady, setWebViewReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible || !invoiceId) {
      return;
    }

    let cancelled = false;

    async function loadPreview() {
      setLoading(true);
      setError(null);
      setPdfBase64(null);
      setWebViewReady(false);

      try {
        const base64 = await loadInvoicePdfBase64(invoiceId, invoiceNumber);
        if (cancelled) return;
        if (!base64) {
          throw new Error("Downloaded PDF was empty.");
        }
        setViewerKey((current) => current + 1);
        setPdfBase64(base64);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load invoice preview."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [visible, invoiceId, invoiceNumber]);

  useEffect(() => {
    if (!webViewReady || !pdfBase64 || !webViewRef.current) {
      return;
    }

    webViewRef.current.injectJavaScript(buildPdfPreviewInjection(pdfBase64));
  }, [webViewReady, pdfBase64]);

  function handleWebViewMessage(event: WebViewMessageEvent) {
    const message = event.nativeEvent.data;
    if (message.startsWith("error:")) {
      setError(message.slice("error:".length) || "Failed to render PDF.");
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-base font-semibold text-gray-900">
            Invoice Preview
          </Text>
          <View className="w-6" />
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0052CC" />
            <Text className="text-gray-500 mt-3">Loading PDF preview…</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="alert-circle-outline" size={40} color="#DE350B" />
            <Text className="text-gray-700 text-center mt-3">{error}</Text>
          </View>
        ) : pdfBase64 ? (
          <WebView
            key={viewerKey}
            ref={webViewRef}
            originWhitelist={["*"]}
            source={{ html: PDF_PREVIEW_HTML }}
            style={{ flex: 1, backgroundColor: "#f3f4f6" }}
            javaScriptEnabled
            domStorageEnabled
            mixedContentMode="always"
            allowFileAccess
            allowUniversalAccessFromFileURLs
            onLoadEnd={() => setWebViewReady(true)}
            onMessage={handleWebViewMessage}
            onError={() => setError("Unable to open PDF preview.")}
            onHttpError={() => setError("Unable to load PDF viewer.")}
          />
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}
