# Nitro Web Redirect

A lightweight Nitro.js application that redirects all incoming requests to a specified target URL. Built with [Nitro](https://nitro.unjs.io/).

## Table of Contents
- [Features](#features)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Docker Usage](#docker-usage)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Testing](#testing)

## Features

- Simple HTTP/HTTPS redirection service
- Configurable redirect status code (301, 302, etc.)
- Preserves original request paths
- Available as a Docker image

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
| `REDIRECT_TARGET` | Yes | - | Target URL for redirection (with or without protocol) |
| `REDIRECT_STATUS_CODE` | No | 301 | HTTP status code for redirection (301, 302, etc.) |

### Examples

```bash
# Redirect to example.com with the same protocol as the request
REDIRECT_TARGET='example.com'

# Redirect to example.com with HTTPS protocol regardless of request protocol
REDIRECT_TARGET='https://example.com'

# Use a temporary redirect (302) instead of permanent (301)
REDIRECT_STATUS_CODE=302
```

## Docker Usage

### Using Pre-built Image from Docker Hub

The official Docker image is available on Docker Hub:

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

- Node.js v22.15.0 (or compatible version)
- pnpm v10.11.1 (recommended)

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
- `pnpm run test` - Run tests

## Production Deployment

### Build for Production

```bash
pnpm run build
```

### Start Production Server

```bash
pnpm start
```

For more deployment options, see the [Nitro deployment documentation](https://nitro.unjs.io/deploy).

## Testing

Run the test suite:

```bash
pnpm run test
```

---

## License

[MIT License](LICENSE)
