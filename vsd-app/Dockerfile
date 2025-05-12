#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.
ARG BUILD_ID
ARG BUILD_VERSION

# Retrieve and set base image layer
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

# Create build image for runtime
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
COPY . .

# Restore as distinct layers
RUN dotnet restore ./vsd-app/
RUN dotnet build "vsd-app/vsd-app.csproj" -c Release -o /app/build

# Create publish image layer
FROM build AS publish
ARG BUILD_ID
ARG BUILD_VERSION
COPY . .

# Build and publish a release
RUN dotnet publish ./vsd-app -c Release -o /app/publish

# Build runtime image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Inject version metadata
ARG BUILD_ID
ARG BUILD_VERSION

ENV BUILD_ID=${BUILD_ID}
ENV BUILD_VERSION=${BUILD_VERSION}

# Write to text files for inspection.
RUN echo "${BUILD_ID}" > /app/build_id.txt && echo "${BUILD_VERSION}" > /app/version.txt

EXPOSE 8080
ENV ASPNETCORE_URLS=http://*:8080
ENTRYPOINT ["dotnet", "vsd-app.dll"]