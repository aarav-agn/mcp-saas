import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";

export const initTelemetry = () => {
  const exporter = new OTLPLogExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    headers: {
      Authorization: process.env.OTEL_EXPORTER_OTLP_HEADERS || "",
    },
  });

  const sdk = new NodeSDK({
    logRecordProcessor: new (require("@opentelemetry/sdk-logs")).SimpleLogRecordProcessor(exporter),
  });

  sdk.start();
};
