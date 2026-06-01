import { trace } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

let sdk: NodeSDK | undefined;

export function startTelemetry() {
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  if (!endpoint) {
    return;
  }

  const headers: Record<string, string> = {};
  if (process.env.PHOENIX_API_KEY) {
    headers.api_key = process.env.PHOENIX_API_KEY;
  }

  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: "tracecoach-agent"
    }),
    traceExporter: new OTLPTraceExporter({
      url: endpoint,
      headers
    })
  });

  sdk.start();
}

export async function shutdownTelemetry() {
  await sdk?.shutdown();
}

export const tracer = trace.getTracer("tracecoach-agent");
