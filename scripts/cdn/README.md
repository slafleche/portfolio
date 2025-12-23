# CDN tooling

Isolated helper package for CDN uploads (e.g., Cloudflare R2) so we keep app deps clean.

- Install once inside this folder: `yarn --cwd scripts/cdn install`
- Run scripts from root: `yarn --cwd scripts/cdn <script>`
- Expected envs (set in `.env.local` here or exported): `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `SELF_HOSTED_FONTS_BASE_URL`
- Add your actual upload scripts under this package; `@aws-sdk/client-s3` + `dotenv` are prewired, `tsx`/`tsc` are for TypeScript entrypoints.
