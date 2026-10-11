#!/bin/bash
set -e

echo "Generating SSL Certificates for localhost/nip.io..."
mkdir -p ./certs

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./certs/server.key \
  -out ./certs/server.crt \
  -subj "/C=US/ST=State/L=City/O=BookFair/CN=reservation.20.244.0.92.nip.io"

echo "Certificates generated successfully in ./certs"
