# Nitro Web Redirect

Look at the [Nitro documentation](https://nitro.unjs.io/) to learn more.

## Setup

Make sure environment variables are set, via `.env` file or environment:

```bash
REDIRECT_TARGET='https://example.com' # will redirect to the target url rewrite the request protocol to https
REDIRECT_TARGET='example.com' # will prefix the request protocol (http/https) to the target url
REDIRECT_STATUS_CODE=302
```

Make sure to install the dependencies:

```bash
# npm
npm install

# yarn
yarn install

# pnpm
pnpm install
```

## Development Server

Start the development server on <http://localhost:3000>

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Check out the [deployment documentation](https://nitro.unjs.io/deploy) for more information.


## Build and run Docker Image

```bash
docker build . -t latest
docker run \
  -e REDIRECT_TARGET=https://example.com \
  -e REDIRECT_STATUS_CODE=302 \
  -p 3000:3000 $(docker build -q .)
```

## Use pre-build image from Docker Hub

```bash
piscis/nitro-web-redirect:latest
```
