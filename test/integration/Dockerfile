FROM kthregistry.azurecr.io/kth-nodejs-24:latest
LABEL maintainer="KTH Webb <web-developers@kth.se>"

RUN apk add --no-cache curl bash

COPY * /

CMD ["bash", "-c", "/all-tests.sh"]
