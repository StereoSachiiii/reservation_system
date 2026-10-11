#!/bin/bash
# /home/azureuser/monitor.sh

while true; do
    # Check if containers are running
    docker ps | grep -q bookfair-backend || docker-compose -f ~/reservation_system/docker-compose.yml up -d backend
    docker ps | grep -q bookfair-frontend || docker-compose -f ~/reservation_system/docker-compose.yml up -d frontend
    
    # Check disk space
    DISK=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $DISK -gt 90 ]; then
        echo "ALERT: Disk usage at ${DISK}%" | mail -s "Disk Alert" admin@example.com
    fi
    
    # Check memory
    MEM=$(free | awk 'NR==2 {print int($3/$2 * 100)}')
    if [ $MEM -gt 80 ]; then
        echo "ALERT: Memory usage at ${MEM}%" | mail -s "Memory Alert" admin@example.com
    fi
    
    sleep 60
done
