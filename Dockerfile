#
# A daily updated common KTH Alpine based image.
# Versions: https://hub.docker.com/r/kthse/kth-nodejs/tags
#
FROM kthregistry.azurecr.io/kth-nodejs-18:latest
LABEL maintainer="KTH Webb <web-developers@kth.se>"

#
# Put the application into a directory in the root.
# This will prevent file polution and possible overwriting of files.
#
WORKDIR /application
ENV NODE_PATH /application

#
# Set timezone
#
ENV TZ Europe/Stockholm

#
# Set user to node
#
RUN chown -R node:node /application
USER node

#
# Copy the files needed to install the production dependencies
# and install them using npm.
#
# Remember to only install production dependencies.
#
COPY --chown=node:node ["package.json", "package.json"]
COPY --chown=node:node ["package-lock.json", "package-lock.json"]

RUN npm pkg delete scripts.prepare && \
    npm ci --production --no-optional --unsafe-perm

#
# Copy the files needed for the application to run.
#
COPY --chown=node:node ["config", "config"]
COPY --chown=node:node ["server", "server"]
COPY --chown=node:node ["app.js", "app.js"]
COPY --chown=node:node ["swagger.json", "swagger.json"]
COPY --chown=node:node [".env.ini", ".env.ini"]

#
# Port that the application will expose.
#
EXPOSE 3001

#
# The command that is executed when an instance of this image is run.
#
CMD ["bash", "-c", "cat /KTH_NODEJS; NODE_ENV=production node app.js"]
