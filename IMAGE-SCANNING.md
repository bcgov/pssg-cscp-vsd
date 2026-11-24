# Image Scanning (Trivy + Grype) for pssg-cscp-vsd

Build each image locally with Podman and scan it the same way CI does (`.github/workflows/cd.yml` and `scan.yml`), plus Grype as a second opinion. Run from WSL (Ubuntu).

| Image                      | Dockerfile                     | Local tag       | CI build args                               |
| -------------------------- | ------------------------------ | --------------- | ------------------------------------------- |
| `vsd-api` (.NET API)       | `vsd-app/Dockerfile`           | `vsd-api:local` | `BUILD_IMAGE_NAME=vsd-api`, `BUILD_VERSION` |
| `vsd-ui` (Angular + Caddy) | `vsd-app/ClientApp/Dockerfile` | `vsd-ui:local`  | `BUILD_IMAGE_NAME=vsd-ui`, `BUILD_VERSION`  |

The build context is always the repo root (`pssg-cscp-vsd/`). Both Dockerfiles fail or lose metadata if `BUILD_IMAGE_NAME` / `BUILD_VERSION` are missing (the API Dockerfile exits when they are empty).

CI settings to mirror: `severity: HIGH,CRITICAL`, `ignore-unfixed: true`. Anything that CI reports must be fixed; unfixed findings are informational only.

---

## 1. Prerequisites (one-time)

```bash
# Grype
curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin

# Trivy
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin

# OC CLI (only to scan images already pushed to OpenShift, see section 7)
cp /mnt/c/Users/<YourUsername>/Downloads/oc.tar ~/ && cd ~ && tar -xvf oc.tar
sudo mv oc /usr/local/bin/ && sudo chmod +x /usr/local/bin/oc

grype version; trivy --version; podman --version
```

## 2. Podman socket (every new WSL session)

```bash
podman system service --time=0 unix:///run/user/$(id -u)/podman/podman.sock &
export DOCKER_HOST=unix:///run/user/$(id -u)/podman/podman.sock
```

Persist:

```bash
echo 'export DOCKER_HOST=unix:///run/user/$(id -u)/podman/podman.sock' >> ~/.bashrc
echo 'podman system service --time=0 unix:///run/user/$(id -u)/podman/podman.sock &' >> ~/.bashrc
```

## 3. Refresh the vulnerability databases (before every scan session)

Stale databases give misleading results (Grype refuses to trust a DB older than 5 days).

```bash
grype db update
trivy image --download-db-only
```

## 4. Build one image (repo root)

```bash
cd /mnt/c/git/DevOps/COAST/pssg-cscp-vsd

# vsd-api
podman build --pull=always -t vsd-api:local \
  -f vsd-app/Dockerfile \
  --build-arg BUILD_IMAGE_NAME=vsd-api --build-arg BUILD_VERSION=local-dev .

# vsd-ui
podman build --pull=always -t vsd-ui:local \
  -f vsd-app/ClientApp/Dockerfile \
  --build-arg BUILD_IMAGE_NAME=vsd-ui --build-arg BUILD_VERSION=local-dev .
```

`--pull=always` is required: the base images use floating tags (`aspnet:10.0-alpine`, `sdk:10.0-alpine`) and Podman otherwise reuses a stale local copy, which reports already-fixed runtime CVEs (for example `Microsoft.AspNetCore.App.Runtime.linux-musl-x64` 10.0.8). CI always pulls fresh. Add `--no-cache` as well if `apk upgrade` must be re-resolved.

The repo-root `.dockerignore` excludes `.git`, `node_modules`, `bin`, `obj`, `dist` and `.angular`. Without it the context is ~500 MB and builds from `/mnt/c` take 25+ minutes; with it, about 1.5 minutes.

## 5. Scan

Pick the image, save it to a tar once, then scan the tar with both tools:

```bash
APP=vsd-api        # vsd-api | vsd-ui

podman save $APP:local -o ~/$APP-local.tar
```

### 5a. Trivy, exactly what CI reports (fixable HIGH/CRITICAL)

```bash
trivy image --skip-version-check --input ~/$APP-local.tar \
  --scanners vuln --severity HIGH,CRITICAL --ignore-unfixed \
  --format table -o ~/$APP-trivy-ci.txt
cat ~/$APP-trivy-ci.txt
```

### 5b. Trivy, full picture (vulnerabilities, secrets, misconfigurations, including unfixed)

```bash
trivy image --skip-version-check --input ~/$APP-local.tar \
  --scanners vuln,secret,misconfig --severity HIGH,CRITICAL \
  --format table -o ~/$APP-trivy-full.txt
cat ~/$APP-trivy-full.txt
```

### 5c. Grype

```bash
# Everything High/Critical
grype docker-archive:$HOME/$APP-local.tar -o table | grep -E 'NAME|High|Critical'

# Only findings that have a fix available (these must be addressed)
grype docker-archive:$HOME/$APP-local.tar --only-fixed -o table | grep -E 'NAME|High|Critical'
```

### 5d. Group Trivy findings by package (easier to plan fixes)

```bash
trivy image --skip-version-check --input ~/$APP-local.tar \
  --scanners vuln --severity HIGH,CRITICAL --ignore-unfixed \
  --format template --template '{{ range . }}{{ $t := .Target }}{{ range .Vulnerabilities }}{{ $t }} | {{ .PkgName }} | {{ .InstalledVersion }} | {{ .FixedVersion }} | {{ .Severity }} | {{ .VulnerabilityID }}{{ "\n" }}{{ end }}{{ end }}' | sort -u
```

## 6. Interpreting findings

| Target type in Trivy output                                        | Where the fix goes                                                                                                                                                                         |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `alpine` OS packages (`libssl3`, `libcrypto3`, `busybox`, ...)     | Rebuild so `apk upgrade --no-cache` picks up the latest patch. Both Dockerfiles already run it in the final stage.                                                                         |
| `dotnet-core` (`*.deps.json`) under `/usr/share/dotnet/shared/...` | ASP.NET runtime in the base image. Rebuild with `--pull=always` to pull the latest `aspnet:10.0-alpine`.                                                                                   |
| `dotnet-core` (`app/vsd-app.deps.json`)                            | NuGet package. Update the version in the owning `.csproj` (`vsd-app`, `Manager`, `Database`, `Shared.Database`, ...). Use `dotnet list package --vulnerable --include-transitive` locally. |
| `node-pkg` / `npm` (`package-lock.json`)                           | Only relevant when the lock file is copied into the final image. Fix with `npm audit` / `ng update` in `vsd-app/ClientApp`.                                                                |
| `gobinary` (`usr/bin/caddy`)                                       | Go dependency compiled into Caddy. Fix with the `xcaddy build --replace <module>=<module>@<version>` line in the `builder` stage of `vsd-app/ClientApp/Dockerfile`, or a newer Caddy tag.  |

Out of scope by agreement: **AutoMapper** findings are not addressed.

### Status at last scan (2026-11-24)

| Image     | Fixable HIGH/CRITICAL left                                                              | Unfixable (no upstream fix yet)                                                                                                   |
| --------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `vsd-api` | AutoMapper 14.0.0 only (CVE-2026-32933, CVE-2026-128081, CVE-2026-128082), out of scope | none                                                                                                                              |
| `vsd-ui`  | none (`klauspost/compress` pinned to v1.20.2 via `xcaddy --replace`)                    | `go-jose/v3` v3.0.5 in Caddy (CVE-2026-116587), OpenSSL `libssl3`/`libcrypto3` CVE-2026-124709, -107494, -121482, -84786, -107493 |

Re-check the unfixable ones when Caddy or Alpine ships a new release.

## 7. Scan an image already in OpenShift

```bash
oc login https://api.silver.devops.gov.bc.ca:6443 --token=<your-token>
podman login -u $(oc whoami) -p $(oc whoami --show-token) image-registry.apps.silver.devops.gov.bc.ca

IMAGE="image-registry.apps.silver.devops.gov.bc.ca/<namespace>/vsd-api@sha256:<digest>"   # or vsd-ui
podman pull $IMAGE
trivy image --scanners vuln --severity HIGH,CRITICAL --ignore-unfixed $IMAGE
grype $IMAGE --only-fixed
```

Get the pull URL from the OpenShift console: namespace -> Builds -> ImageStreams -> the image -> copy the pull spec including the digest. The token expires; re-run `oc login` and `podman login` when it does.

## 8. Clean up

```bash
rm -f ~/vsd-api-local.tar ~/vsd-ui-local.tar ~/vsd-*-trivy*.*
podman image prune -f
```
