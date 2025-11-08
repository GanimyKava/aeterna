#!/bin/bash
set -euo pipefail

CERT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/certs"
KEY_FILE="${CERT_DIR}/localhost-key.pem"
CERT_FILE="${CERT_DIR}/localhost-cert.pem"
CSR_FILE="${CERT_DIR}/localhost.csr"

ROOT_CERT_DIR="${CERT_DIR}/root"
ROOT_KEY="${ROOT_CERT_DIR}/rootCA.key"
ROOT_CERT="${ROOT_CERT_DIR}/rootCA.pem"

mkdir -p "${CERT_DIR}"
mkdir -p "${ROOT_CERT_DIR}"

if ! command -v openssl >/dev/null 2>&1; then
  echo "❌ openssl is required to generate certificates."
  exit 1
fi

if [ ! -f "${ROOT_KEY}" ] || [ ! -f "${ROOT_CERT}" ]; then
  echo "⚙️  Generating local root CA under ${ROOT_CERT_DIR}"
  openssl genrsa -out "${ROOT_KEY}" 4096
  openssl req -x509 -new -nodes \
    -key "${ROOT_KEY}" \
    -sha256 \
    -days 825 \
    -out "${ROOT_CERT}" \
    -subj "/C=AU/ST=Local/L=Local/O=EchoesOfEternity/OU=Dev/CN=EchoesOfEternity-Local-CA"
else
  echo "✅ Root CA already present at ${ROOT_CERT_DIR}"
fi

if [ -f "${KEY_FILE}" ] && [ -f "${CERT_FILE}" ]; then
  echo "🔁 Server certificate already exists at ${CERT_DIR}"
  exit 0
fi

cat > "${CERT_DIR}/openssl.cnf" <<'EOF'
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = localhost

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
EOF

openssl genrsa -out "${KEY_FILE}" 2048

openssl req -new \
  -key "${KEY_FILE}" \
  -out "${CSR_FILE}" \
  -config "${CERT_DIR}/openssl.cnf"

openssl x509 -req \
  -in "${CSR_FILE}" \
  -CA "${ROOT_CERT}" \
  -CAkey "${ROOT_KEY}" \
  -CAcreateserial \
  -out "${CERT_FILE}" \
  -days 365 \
  -sha256 \
  -extensions v3_req \
  -extfile "${CERT_DIR}/openssl.cnf"

rm -f "${CERT_DIR}/openssl.cnf" "${CSR_FILE}" "${CERT_DIR}/rootCA.srl"

echo "✅ Generated server certificate signed by local CA:"
echo "   Key : ${KEY_FILE}"
echo "   Cert: ${CERT_FILE}"
echo "📌 Trust ${ROOT_CERT} in your browser/system for HTTPS without warnings."

