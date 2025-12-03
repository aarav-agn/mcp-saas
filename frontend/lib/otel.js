// init OpenTelemetry for frontend (optional)
// This uses SDK Web to export traces to OTLP HTTP endpoint.
// Configure OTEL endpoint in env: NEXT_PUBLIC_OTEL_ENDPOINT and NEXT_PUBLIC_OTEL_HEADERS

export function initOtel() {
    if (typeof window === "undefined") return;
    if (!process.env.NEXT_PUBLIC_OTEL_ENDPOINT) return;
  
    try {
      // dynamic import to avoid bundling if not used
      import("@opentelemetry/sdk-trace-web").then((sdk) => {
        const { WebTracerProvider } = sdk;
        const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
        const { BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");
        const { ZoneContextManager } = require("@opentelemetry/context-zone");
  
        const exporter = new OTLPTraceExporter({
          url: process.env.NEXT_PUBLIC_OTEL_ENDPOINT,
          headers: process.env.NEXT_PUBLIC_OTEL_HEADERS ? JSON.parse(process.env.NEXT_PUBLIC_OTEL_HEADERS) : {}
        });
  
        const provider = new WebTracerProvider();
        provider.addSpanProcessor(new BatchSpanProcessor(exporter));
        provider.register({
          contextManager: new ZoneContextManager()
        });
        console.info("OTEL WebTracerProvider started");
      });
    } catch (err) {
      console.warn("OpenTelemetry init failed", err);
    }
  }
  