docker-compose -f docker/docker-compose.load-tests.yaml \
  --project-directory . run k6 run /scripts/checkout.js