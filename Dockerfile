#
# A daily updated common KTH Alpine based image.
# Versions: https://hub.docker.com/r/kthse/kth-nodejs/tags
#
FROM kthse/kth-nodejs:16.0.0
LABEL maintainer="KTH Webb <web-developers@kth.se>"

#
# During integration-tests running with docker-compose in the pipeline
# this application might have to wait for other services to be ready
# before it is started itself. This can be done with the following
# script and its environment variables WAIT_HOSTS and WAIT_HOSTS_TIMEOUT.
#
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait /wait
RUN chmod +x /wait

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
    npm ci  --no-optional --unsafe-perm

#
# Copy the files needed for the application to run.
#
COPY --chown=node:node ["tsconfig.json", "tsconfig.json"]
COPY --chown=node:node ["webpack.config.js", "webpack.config.js"]
COPY --chown=node:node ["config", "config"]
COPY --chown=node:node [".env.ini", ".env.ini"]
COPY --chown=node:node ["swagger.json", "swagger.json"]
COPY --chown=node:node ["src", "src"]

RUN npm run build && \
    npm prune --production 

#
# Port that the application will expose.
#
EXPOSE 3001

#
# The command that is executed when an instance of this image is run.
#
CMD ["npm", "start"]
