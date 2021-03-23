# Use the base image from ../openresty
FROM openresty/openresty:alpine

# Copy nginx configuration files
COPY ./config/nginx.conf /usr/local/openresty/nginx/conf/nginx.conf
COPY ./config/default.conf /etc/nginx/conf.d/default.conf
COPY ./config/nginx.cyber.conf /etc/nginx/conf.d/cyber.conf

# Copy application build directory
COPY ./build/ /usr/local/openresty/nginx/html/

CMD ["/usr/local/openresty/bin/openresty", "-g", "daemon off;"]

# Use SIGQUIT instead of default SIGTERM to cleanly drain requests
# See https://github.com/openresty/docker-openresty/blob/master/README.md#tips--pitfalls
STOPSIGNAL SIGQUIT
