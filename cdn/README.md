# CDN tooling

Isolated helper package for CDN uploads (e.g., Cloudflare R2) so we keep app deps clean.

- Install once inside this folder: `yarn --cwd scripts/cdn install`
- Run scripts from root: `yarn --cwd scripts/cdn <script>`
- Expected envs (set in `.env.local` here or exported): `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `CDN_PUBLIC_BASE_URL`, `CF_API_TOKEN`, `CF_ZONE_ID`
- Cache purge: `yarn --cwd cdn cdn:cache --fonts --target=_staging --prefix`
- Add your actual upload scripts under this package; `@aws-sdk/client-s3` + `dotenv` are prewired, `tsx`/`tsc` are for TypeScript entrypoints.
