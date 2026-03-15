#!/bin/bash
# Run this ONCE after: docker compose up -d (from this directory)
# Creates the Frappe site, enables CORS, and migrates the database.
set -e

SITE_NAME="localhost"
DB_ROOT_PASSWORD="${DB_PASSWORD:-admin}"
ADMIN_PASSWORD="admin"

echo "Waiting for backend to be ready..."
until docker compose exec backend bench --help > /dev/null 2>&1; do
  sleep 2
done

echo ""
echo "Creating site: $SITE_NAME"
docker compose exec backend bench new-site "$SITE_NAME" \
  --mariadb-root-password "$DB_ROOT_PASSWORD" \
  --admin-password "$ADMIN_PASSWORD" \
  --no-mariadb-socket \
  --force

echo ""
echo "Configuring site..."
docker compose exec backend bench --site "$SITE_NAME" set-config allow_cors_origin "*"
docker compose exec backend bench --site "$SITE_NAME" set-config server_script_enabled 1

echo ""
echo "Migrating..."
docker compose exec backend bench --site "$SITE_NAME" migrate

echo ""
echo "========================================="
echo "Frappe is ready at: http://localhost:8080"
echo "Login: administrator / $ADMIN_PASSWORD"
echo ""
echo "Next steps:"
echo "  1. Log in at http://localhost:8080"
echo "  2. Go to: top-right menu > My Profile > API Access"
echo "  3. Click 'Generate Keys' and copy the API Key and API Secret"
echo "  4. Copy apps/api/.env.example to apps/api/.env and fill in:"
echo "       FRAPPE_URL=http://localhost:8080"
echo "       FRAPPE_API_KEY=<your key>"
echo "       FRAPPE_API_SECRET=<your secret>"
echo "  5. Initialize DocTypes (from repository root):"
echo "       docker compose -f infra/local-dev/docker-compose.yml cp \\"
echo "         apps/api/scripts/init-production-db.py \\"
echo "         backend:/home/frappe/frappe-bench/apps/frappe/frappe/init_production_db.py"
echo "       docker compose -f infra/local-dev/docker-compose.yml exec backend \\"
echo "         bench --site localhost execute frappe.init_production_db.run_from_bench"
echo "       docker compose -f infra/local-dev/docker-compose.yml exec backend \\"
echo "         bench --site localhost migrate"
echo "  6. Start all services: npm run dev (from repository root)"
echo "========================================="
