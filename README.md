# Sorcel Shopify App

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)

This repository is the frontend for Shopify's app starter templates. **You probably don't want to use this repository directly**, but rather through one of the templates and the [Shopify CLI](https://github.com/Shopify/shopify-cli).

## Developer resources

- [Introduction to Shopify apps](https://shopify.dev/apps/getting-started)
- [App authentication](https://shopify.dev/apps/auth)
- [Shopify CLI command reference](https://shopify.dev/apps/tools/cli/app)
- [Shopify API Library documentation](https://github.com/Shopify/shopify-node-api/tree/main/docs)

## Project Structure
.
├── extensions
│   └── tokengate-src
│       ├── dist
│       ├── src
│       ├── assets
│       ├── package.json
│       └── vite.config.js
├── web
│   ├── frontend
│   │   ├── assets
│   │   ├── pages
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   └── package.json
│   ├── api
│   ├── index.js
│   ├── shopify.web.toml
│   └── package.json
├── .gitignore
├── .npmrc
├── Dockerfile
└── README.md

## Scripts

### Root

- `shopify`: `shopify`
- `build`: `shopify app build`
- `dev`: `shopify app dev`
- `info`: `shopify app info`
- `generate`: `shopify app generate`
- `deploy`: `shopify app deploy`

### Web Frontend

- `build`: `vite build`
- `dev`: `vite`
- `coverage`: `vitest run --coverage`

### Tokengate Extension

- `build`: `vite build`

## License

This repository is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).

