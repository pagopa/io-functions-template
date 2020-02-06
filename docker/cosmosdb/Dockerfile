FROM node:10.14.2-alpine

ENV COSMOSDB_PORT "3000"

WORKDIR /opt/cosmosdb

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

RUN npm install -g @zeit/cosmosdb-server

CMD ["cosmosdb-server", "-p", "${COSMOSDB_PORT}"]
