# Create build image layer
FROM node:8.9.4 AS build

COPY ./vsd-app/ClientApp ./vsd-app/ClientApp

WORKDIR /vsd-app/ClientApp

RUN npm install
RUN npm run build -- --base-href /cvapwebform --prod

# Create runtime image layer, copy build image contents into this image
FROM caddy:latest AS final
COPY ./vsd-app/ClientApp/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /vsd-app/ClientApp/dist/ /site
ENV BASE_URL=
ENV API_URL=
EXPOSE 2015
