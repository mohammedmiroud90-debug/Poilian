# Cloudflare Workers deployment

This application uses Next.js App Router and route handlers, so deploy it to **Cloudflare Workers** using Cloudflare's recommended vinext workflow rather than a static Pages export.

## One-time local setup

Run these commands from the project root after the repository is pushed to GitHub:

```bash
npx vinext check
npx vinext init
```

When `vinext init` asks for a deployment target, choose **Cloudflare Workers**. The initializer adds the Workers/Vite configuration and deployment scripts without replacing the existing Next.js application structure.

Then validate the Worker build locally:

```bash
npm run dev:vinext
npm run build:vinext
```

`build:vinext`, `dev:vinext`, and the Worker configuration are created by `npx vinext init`. Do not set Cloudflare's build command until that initializer has completed and the new scripts are present in `package.json`.

To authenticate and create the Worker on your Cloudflare account:

```bash
npx wrangler login
npx @vinext/cloudflare deploy
```

The final command creates or updates the Worker and prints its `workers.dev` URL. Do not copy local `.env` files into Git.

## GitHub continuous deployment

1. Push this repository to GitHub, keeping `.env.local` untracked.
2. In Cloudflare, open **Workers & Pages** → **Create application** → **Connect to Git**.
3. Select the GitHub repository and production branch (`main`).
4. Confirm that `package.json` contains the `build:vinext` script created by the initializer.
5. Set the build command to `npm run build:vinext`.
6. Set the deploy command to `npx @vinext/cloudflare deploy`.
7. Add runtime secrets and build variables in the Cloudflare dashboard. Use the same variable names already consumed by the app; never commit their values.

Cloudflare will create preview builds for pull requests and deploy the production Worker when the production branch changes.

## Pre-deploy checklist

```bash
npm ci
npm run lint
npm run build
npx vinext check
npm run build:vinext
```

Review vinext's compatibility report before the first deploy. The project uses remote images and external API routes, so test the Workers preview before pointing a custom domain at it.
