/** Minimal PDF.js viewer HTML for react-native-webview (Android cannot render PDF embeds). */
export const PDF_PREVIEW_HTML = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
    />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <style>
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        padding: 0;
        min-height: 100%;
        background: #f3f4f6;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      #status {
        padding: 24px 16px;
        text-align: center;
        color: #6b7280;
        font-size: 14px;
      }
      #pages {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 12px 8px 24px;
      }
      canvas {
        display: block;
        width: 100%;
        max-width: 100%;
        height: auto;
        background: #fff;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
      }
      .error {
        color: #b42318;
      }
    </style>
  </head>
  <body>
    <div id="status">Loading PDF…</div>
    <div id="pages"></div>
    <script>
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

      function setStatus(message, isError) {
        var status = document.getElementById("status");
        status.textContent = message;
        status.className = isError ? "error" : "";
      }

      function renderAllPages(pdf) {
        var pages = document.getElementById("pages");
        pages.innerHTML = "";
        setStatus("");

        var renderNext = function(pageNumber) {
          if (pageNumber > pdf.numPages) {
            return Promise.resolve();
          }

          return pdf.getPage(pageNumber).then(function(page) {
            var containerWidth = Math.max(document.body.clientWidth - 16, 280);
            var viewport = page.getViewport({ scale: 1 });
            var scale = containerWidth / viewport.width;
            var scaledViewport = page.getViewport({ scale: scale });

            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");
            canvas.width = scaledViewport.width;
            canvas.height = scaledViewport.height;
            pages.appendChild(canvas);

            return page.render({
              canvasContext: context,
              viewport: scaledViewport,
            }).promise.then(function() {
              return renderNext(pageNumber + 1);
            });
          });
        };

        return renderNext(1);
      }

      window.renderPdf = function(base64) {
        try {
          if (!base64) {
            setStatus("No PDF data received.", true);
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage("error:empty");
            return;
          }

          var binary = atob(base64);
          var bytes = new Uint8Array(binary.length);
          for (var i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }

          pdfjsLib.getDocument({ data: bytes }).promise
            .then(renderAllPages)
            .catch(function(err) {
              var message = err && err.message ? err.message : "Failed to render PDF.";
              setStatus(message, true);
              window.ReactNativeWebView && window.ReactNativeWebView.postMessage("error:" + message);
            });
        } catch (err) {
          var message = err && err.message ? err.message : "Failed to decode PDF.";
          setStatus(message, true);
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage("error:" + message);
        }
      };
    </script>
  </body>
</html>`;

export function buildPdfPreviewInjection(base64: string): string {
  return `window.renderPdf(${JSON.stringify(base64)}); true;`;
}
