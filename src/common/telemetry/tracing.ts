import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

let sdk: NodeSDK | null = null;

export const startTracing = async (serviceName: string, endpoint?: string): Promise<void> => {
  if (sdk) {
    return;
  }

  const exporter = endpoint ? new OTLPTraceExporter({ url: endpoint }) : undefined;

  sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
    traceExporter: exporter,
    instrumentations: [getNodeAutoInstrumentations()],
  });

  await sdk.start();
};

export const stopTracing = async (): Promise<void> => {
  if (sdk) {
    await sdk.shutdown();
  }
};
