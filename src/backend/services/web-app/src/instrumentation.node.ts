import { NodeSDK } from '@opentelemetry/sdk-node';
// import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import {
    PeriodicExportingMetricReader,
    ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const sdk = new NodeSDK({
    instrumentations: [
        new HttpInstrumentation(),
    ],
    resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'web-app',
        [SemanticResourceAttributes.SERVICE_VERSION]: '1.0',
    }),
    traceExporter: new OTLPTraceExporter({
        url: 'http://otel-collector:4318/v1/traces',
    }),
    metricReader: new PeriodicExportingMetricReader({
        exporter: new ConsoleMetricExporter(),
    }),
});

sdk.start();
