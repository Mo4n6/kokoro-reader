# codextest

## GitHub Pages deployment

This repository is configured to deploy the built Vite app to GitHub Pages via GitHub Actions using `.github/workflows/deploy-pages.yml`.

### Required build environment values

Set the following environment variable for Pages builds:

- `VITE_ENABLE_URL_INGEST=false`

For environments that support backend URL extraction, configure:

- `VITE_EXTRACT_API_BASE_URL=/api/extract`

### Optional model/runtime flags

If you need to tune runtime behavior at build/deploy time, you can optionally set model/runtime-related `VITE_*` flags as repository secrets/variables and expose them to the build step.

## Repository settings required

In GitHub repository settings:

1. Go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
