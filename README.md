# Nitro Web Redirect

Look at the [Nitro documentation](https://nitro.unjs.io/) to learn more.

## Setup

Make sure environment variables are set, via `.env` file or environment:

```bash
REDIRECT_TARGET='https://example.com'
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
