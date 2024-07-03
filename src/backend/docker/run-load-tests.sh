docker-compose -f docker/docker-compose.grafana.yaml \
  -f docker/docker-compose.otel.yml \
  --project-directory . run --rm k6 run /scripts/checkout.js