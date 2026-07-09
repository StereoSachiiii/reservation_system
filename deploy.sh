#!/bin/bash
set -e

RG="your-resource-group"
VM_NAME="web"

echo "🚀 Starting Azure VM Deployment Script..."

# 1. Ensure VM is running
echo "✓ Starting VM ($VM_NAME) if deallocated..."
az vm start --resource-group $RG --name $VM_NAME

# 2. Get public IP
IP=$(az vm list-ip-addresses --resource-group $RG --name $VM_NAME --query "[0].virtualMachines[0].ipAddresses[0].publicIpAddress" -o tsv)
echo "✓ VM IP: $IP"

# 3. Clone / Pull Latest on VM
echo "✓ Pulling latest repository..."
az vm run-command invoke --resource-group $RG --name $VM_NAME \
  --command-id RunShellScript --scripts "
    if [ ! -d ~/reservation_system ]; then
      cd ~ && git clone https://github.com/StereoSachiiii/reservation_system.git
    else
      cd ~/reservation_system && git pull
    fi
  "

# 4. Generate Certs & Deploy
echo "✓ Generating Certificates and Deploying Docker Compose..."
az vm run-command invoke --resource-group $RG --name $VM_NAME \
  --command-id RunShellScript --scripts "
    cd ~/reservation_system
    
    # Generate Certs if they don't exist
    chmod +x generate-ssl.sh
    ./generate-ssl.sh
    
    # Ensure logs directories exist
    mkdir -p logs/backend logs/frontend
    
    # Rename template if original .env does not exist
    if [ ! -f .env ]; then
      cp .env.production .env
    fi

    # Build and deploy
    docker-compose -f docker-compose.yml up -d --build
  "

echo "✅ Deployment complete!"
echo "Access your app at: http://reservation.$IP.nip.io:3000"
