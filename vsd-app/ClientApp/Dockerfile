# Create build image layer
FROM node:8.9.4 AS build

COPY ./vsd-app/ClientApp ./vsd-app/ClientApp

WORKDIR /vsd-app/ClientApp

RUN npm install
RUN npm run build -- --base-href /cvapwebform --prod

# Create runtime image layer, copy build image contents into this image
FROM caddy:latest AS final

# Inject version and build info ---
ARG BUILD_ID
ARG BUILD_VERSION

ENV BUILD_ID=${BUILD_ID}
ENV BUILD_VERSION=${BUILD_VERSION}


COPY ./vsd-app/ClientApp/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /vsd-app/ClientApp/dist/ /site

# Add version files
RUN echo "${BUILD_ID}" > /app/build_id.txt && echo "${BUILD_VERSION}" > /app/version.txt


ENV BASE_URL=
ENV API_URL=
EXPOSE 2015
