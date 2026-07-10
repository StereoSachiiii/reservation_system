#!/bin/bash
docker stop royal_liquor_app
sudo docker run --rm -p 80:80 -v /etc/letsencrypt:/etc/letsencrypt certbot/certbot renew --standalone --non-interactive
sudo cp /etc/letsencrypt/live/reservation.20.244.0.92.nip.io/fullchain.pem ~/reservation_system/certs/server.crt
sudo cp /etc/letsencrypt/live/reservation.20.244.0.92.nip.io/privkey.pem ~/reservation_system/certs/server.key
sudo chown -R azureuser:azureuser ~/reservation_system/certs
docker start royal_liquor_app
cd ~/reservation_system && docker-compose restart frontend
