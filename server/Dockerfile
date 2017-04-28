FROM geerd/drbd

RUN apk update && apk add nodejs openssl && mkdir -p /var/lib/node /src && openssl req \
    -new \
    -newkey rsa:4096 \
    -days 365 \
    -nodes \
    -x509 \
    -subj "/C=US/ST=Washington/L=Woodinville/O=Cloud/CN=drbd-motion" \
    -keyout /var/lib/node/drbd-motion.key \
    -out /var/lib/node/drbd-motion.crt

WORKDIR /src
ADD webserver.js .

EXPOSE 8445
CMD ["node", "webserver.js"]
