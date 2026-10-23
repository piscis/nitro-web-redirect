# Nitro Web Redirect

A lightweight Nitro.js application that redirects all incoming requests to a specified target URL. Built with [Nitro](https://nitro.build/).

## Table of Contents
- [Features](#features)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Docker Usage](#docker-usage)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Testing](#testing)
- [Releasing](#releasing)

## Features

- Redirects every request to one configured target
- Configurable redirect status code: 301, 302, 303, 307 or 308
- Keeps the requested path and query string, with an optional base path on the target
- Validates its configuration at startup and refuses to start if it is invalid
- Available as a Docker image for `linux/amd64` and `linux/arm64`

## Quick Start

### Using Docker (Recommended)

```bash
docker run -d \
  -e REDIRECT_TARGET=example.com \
  -e REDIRECT_STATUS_CODE=301 \
  -p 3000:3000 \
  piscis/nitro-web-redirect:latest
```

### Local Installation

```bash
# Clone the repository
git clone https://github.com/piscis/nitro-web-redirect.git
cd nitro-web-redirect

# Install dependencies (using pnpm, the recommended package manager)
pnpm install

# Configure environment variables
echo 'REDIRECT_TARGET=example.com' > .env

# Start the server
pnpm run dev
```

## Configuration

Configure the application using environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIRECT_TARGET` | Yes | - | The redirect target: a host, optionally with a protocol and a base path |
| `REDIRECT_STATUS_CODE` | No | 301 | The redirect status code: one of `301`, `302`, `303`, `307`, `308` |

### Startup validation

The configuration is checked once when the server starts. On success it logs the configuration it serves:

```
ℹ Redirecting to https://example.com with 301
```

If the configuration is invalid, the server logs the reason and exits with code 1 instead of starting:

- `REDIRECT_TARGET` is missing, empty, or the string `undefined` or `null`.
- `REDIRECT_STATUS_CODE` is set to anything other than `301`, `302`, `303`, `307` or `308` (for example `200`, `404` or `abc`). An empty value counts as unset and gives `301`.

```
 ERROR  Invalid configuration: REDIRECT_STATUS_CODE "abc" is not one of 301, 302, 303, 307, 308
```

Each redirect is logged as one line, e.g. `301 GET /foo?x=1 → https://example.com/foo?x=1`.

### How the location is built

Every request is answered with a redirect to the target followed by the requested path and query string:

- **Protocol**: the target has a protocol only if it starts with `http://` or `https://`. Otherwise the request's protocol is used, honouring the `X-Forwarded-Proto` header set by a reverse proxy. A host such as `httpbin.org` counts as having no protocol.
- **Trailing slashes** on the target are trimmed, so `https://example.com/` and `/foo` give `https://example.com/foo`.
- **Base path**: a path in the target is placed in front of the requested path, so `https://example.com/base` and `/foo?x=1` give `https://example.com/base/foo?x=1`.
- **Path and query** of the request are kept unchanged, including percent-encoding.

| `REDIRECT_TARGET` | Request | Location |
|-------------------|---------|----------|
| `https://example.com` | `http://redirect.local/foo?x=1` | `https://example.com/foo?x=1` |
| `example.com` | `http://redirect.local/foo` | `http://example.com/foo` |
| `example.com` | `/foo` with `X-Forwarded-Proto: https` | `https://example.com/foo` |
| `https://example.com/` | `/foo` | `https://example.com/foo` |
| `https://example.com/base` | `/foo?x=1` | `https://example.com/base/foo?x=1` |

### Examples

```bash
# Redirect to example.com with the same protocol as the request
REDIRECT_TARGET='example.com'

# Redirect to example.com with HTTPS protocol regardless of request protocol
REDIRECT_TARGET='https://example.com'

# Redirect into a base path on the target
REDIRECT_TARGET='https://example.com/base'

# Use a temporary redirect (302) instead of permanent (301)
REDIRECT_STATUS_CODE=302
```

## Docker Usage

### Using Pre-built Image from Docker Hub

The official Docker image is available on Docker Hub for `linux/amd64` and `linux/arm64`. Every tag covers both platforms, and Docker pulls the one that fits the host:

```bash
docker pull piscis/nitro-web-redirect:latest
```

### Running the Docker Container

```bash
docker run -d \
  -e REDIRECT_TARGET=example.com \
  -e REDIRECT_STATUS_CODE=301 \
  -p 3000:3000 \
  piscis/nitro-web-redirect:latest
```

### Building Your Own Docker Image

```bash
# Build the image
docker build -t nitro-web-redirect .

# Run the container
docker run -d \
  -e REDIRECT_TARGET=example.com \
  -p 3000:3000 \
  nitro-web-redirect
```

### Docker Compose Example

```yaml
version: '3'
services:
  redirect:
    image: piscis/nitro-web-redirect:latest
    environment:
      REDIRECT_TARGET: example.com
      REDIRECT_STATUS_CODE: 301
    ports:
      - '3000:3000'
    restart: unless-stopped
```

## Local Development

### Prerequisites

- Node.js 24 (see `.nvmrc`)
- pnpm 12.11.2 (pinned in `package.json`; `corepack enable` picks it up)

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

The development server will be available at http://localhost:3000

### Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build locally
- `pnpm run lint` - Run linting
- `pnpm run test` - Run tests in watch mode
- `pnpm run test:run` - Run tests once

## Production Deployment

### Build for Production

```bash
pnpm run build
```

### Start Production Server

```bash
pnpm start
```

For more deployment options, see the [Nitro deployment documentation](https://nitro.build/deploy).

## Testing

Run the test suite:

```bash
pnpm run test:run
```

Unit tests in `test/unit/` cover the configuration and location rules without a server. The tests in `test/e2e/` build the server and send requests to it in-process with [nitro-test-utils](https://github.com/johannschopplich/nitro-test-utils); each file runs one configuration, because the server reads it once at startup.

## Releasing

Versions come from the conventional-commit titles on `main`: `pnpm release` writes `CHANGELOG.md` and bumps `package.json` on a release branch, a `v*` tag creates the release, and the GitHub mirror publishes the image to Docker Hub after a smoke test. The steps are in [docs/agents/releasing.md](docs/agents/releasing.md).

---

## License

[MIT License](LICENSE)
