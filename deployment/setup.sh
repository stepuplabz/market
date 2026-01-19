#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Create app directory
mkdir -p market-backend
cd market-backend

# Instructions for user
echo "----------------------------------------------------------------"
echo "Setup complete!"
echo "Now, please upload your backend files to $(pwd)"
echo "You can use SCP or FileZilla."
echo "----------------------------------------------------------------"
