#!/bin/sh

# This assumes you have the following dependencies installed on your system
# - nodeJS >= 12
# - yarn
# - docker
# - docker-compose


cd client
yarn install
yarn build
cd ../server
yarn install
docker-compose up

# RAVIS is running on http://localhost