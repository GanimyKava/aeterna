#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="${ROOT_DIR}/frontend"
BACKEND_DIR="${ROOT_DIR}/backend"
CERT_DIR="${ROOT_DIR}/certs"
PORT="${PORT:-8443}"
HOST="${HOST:-0.0.0.0}"

echo "🏛️  Echoes of Eternity AR - FastAPI + React SPA"
echo "   HOST=${HOST}"
echo "   PORT=${PORT}"
echo ""

if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ Python 3 is required."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "❌ npm is required to build the React application."
  exit 1
fi

mkdir -p "${CERT_DIR}"

if [ ! -f "${CERT_DIR}/cert.pem" ] || [ ! -f "${CERT_DIR}/key.pem" ]; then
  if command -v openssl >/dev/null 2>&1; then
    echo "Generating self-signed TLS certificate in ${CERT_DIR}..."
    cat > "${CERT_DIR}/openssl.cnf" <<'EOF'
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = localhost

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
EOF
    openssl req -x509 -newkey rsa:2048 -nodes \
      -keyout "${CERT_DIR}/key.pem" -out "${CERT_DIR}/cert.pem" \
      -days 365 -config "${CERT_DIR}/openssl.cnf"
    rm -f "${CERT_DIR}/openssl.cnf"
  else
    echo "❌ openssl is required to generate TLS certificates."
    exit 1
  fi
fi

VENV_DIR="${BACKEND_DIR}/.venv"
if [ ! -d "${VENV_DIR}" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv "${VENV_DIR}"
fi

source "${VENV_DIR}/bin/activate"
python -m pip install --upgrade pip wheel >/dev/null
python -m pip install -e "${BACKEND_DIR}" >/dev/null

if [ ! -d "${FRONTEND_DIR}/node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm --prefix "${FRONTEND_DIR}" install >/dev/null
fi

echo "Building React application..."
npm --prefix "${FRONTEND_DIR}" run build >/dev/null

echo ""
echo "Serving on https://${HOST}:${PORT}"
echo "Press Ctrl+C to stop."
exec uvicorn backend.app.main:app \
  --host "${HOST}" \
  --port "${PORT}" \
  --ssl-keyfile "${CERT_DIR}/key.pem" \
  --ssl-certfile "${CERT_DIR}/cert.pem"
