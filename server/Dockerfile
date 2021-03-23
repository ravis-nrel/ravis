# Use the base image from ../openresty
FROM node:10-alpine

# Install yarn
RUN set -ex && apk add --no-cache yarn

# Install logrotate
RUN set -ex && apk add --no-cache logrotate

# Install sudo to alpine
# RUN set -ex && apk add --no-cache sudo

# Create the api code directory in the image
RUN mkdir -p /srv/www

# Copy the app src to the api directory
WORKDIR /srv/www
COPY . .

# Create the underprivileged runtime user
RUN adduser -S www-data-local
RUN chown -R www-data-local /srv/www
# Operate as the runtime user
USER www-data-local

# Set up environment variable defaults
ENV NODE_ENV="staging"
ENV PORT=3000

# Install all the dependencies excluding dev deps
RUN yarn install --production=true --network-timeout=240000

# Run the server
CMD ["/usr/bin/yarn", "start"]
