# ##################################################################################################
#                                                                                                 #
#   VSD-UI: Angular Single Page Application (SPA) served by Caddy                                 #
#                                                                                                 #
#   LOCAL BUILD & RUN INSTRUCTIONS                                                                #
#   --------------------------------------------------------------------------------------------  #
#   1. Build the Docker image:                                                                    #
#        docker build \                                                                           #
#          -t vsd-ui:local \                                                                      #
#          -f vsd-app/ClientApp/Dockerfile \                                                     #
#          --build-arg BUILD_IMAGE_NAME=vsd-ui \                                                 #
#          --build-arg BUILD_VERSION=local-dev \                                                 #
#          .                                                                                      #
#                                                                                                 #
#   2. Run the container:                                                                         #
#        docker run --rm -it -p 2015:2015 vsd-ui:local                                            #
#                                                                                                 #
#   3. Inspect the running container (in another terminal):                                       #
#        docker exec -it <container_id_or_name> bash                                              #
#        whoami            # should print 'appuser'                                               #
#        touch /site/testfile  # should succeed                                                   #
#        printenv BUILD_IMAGE_NAME                                                                #
#        printenv BUILD_VERSION                                                                   #
#                                                                                                 #
#   ARCHITECTURE & BUILD OVERVIEW                                                                 #
#   --------------------------------------------------------------------------------------------  #
#   - Multi-stage Docker build: Node.js for Angular build, Caddy for serving SPA                  #
#   - This image contains only the Angular SPA (no .NET backend)                                  #
#   - Angular is built in the build stage, output is served by Caddy from /site                   #
#   - Runtime container runs as non-root user (appuser) for security                              #
#   - All files in /site are owned by appuser:appgroup                                            #
#   - Build metadata (BUILD_IMAGE_NAME, BUILD_VERSION) available as env vars                      #
#                                                                                                 #
#   TECHNOLOGIES                                                                                  #
#   --------------------------------------------------------------------------------------------  #
#   - Frontend: Angular (in vsd-app/ClientApp)                                                    #
#   - Web Server: Caddy                                                                           #
#   - Build: Docker builds frontend separately                                                    #
#                                                                                                 #
# ##################################################################################################

# --- Build Stage ---
FROM node:22-alpine AS build
# upgraded from 8.9.4

# Python/build tools no longer needed since we replaced node-sass with dart-sass

# Build args for traceability
ARG BUILD_IMAGE_NAME
ARG BUILD_VERSION

WORKDIR /app
COPY ./vsd-app/ClientApp .

RUN npm install --legacy-peer-deps --ignore-scripts
RUN npm run build --configuration=production

FROM caddy:2-builder AS builder
RUN xcaddy build \
    --with github.com/caddyserver/replace-response

# --- Runtime Stage ---
FROM caddy:2 as final
RUN apk update && apk upgrade --no-cache

# Build args for traceability
ARG BUILD_IMAGE_NAME
ARG BUILD_VERSION

# Create non-root user and group
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Set as environment variables
ENV BUILD_IMAGE_NAME=${BUILD_IMAGE_NAME}
ENV BUILD_VERSION=${BUILD_VERSION}

COPY ./vsd-app/ClientApp/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist/browser/ /site

# Add version files
RUN echo "${BUILD_IMAGE_NAME}" > /site/build_image_name.txt && echo "${BUILD_VERSION}" > /site/version.txt

# But for OpenShift, these will be overridden by ConfigMap.
ENV BASE_URL=/cvapwebform
ENV API_URL=vsd-api-svc:8080

# Set ownership and switch to non-root user
RUN chown -R appuser:appgroup /site
USER appuser

EXPOSE 2015
