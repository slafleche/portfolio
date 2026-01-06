# CDN Scripts

This folder contains the CDN helper package (R2 + cache tooling) and the
generated asset pipelines. The goal is to generate assets locally, sync them
to the CDN, and then write manifests/artifacts back into the app so runtime
assets are stable and versioned.

- Install once: `yarn --cwd cdn install`
- Run scripts: `yarn --cwd cdn <script>`
- Env vars (set in `cdn/.env.local` or exported as needed):
  - R2 actions (sync, delete): `R2_ENDPOINT`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
  - Manifest URL rewriting: `CDN_PUBLIC_BASE_URL` (falls back to `R2_ENDPOINT`)
  - Cache purge: `CF_API_TOKEN`, `CF_ZONE_ID`, `CDN_PUBLIC_BASE_URL`

## Generate

Generate files locally first, then sync them to the CDN. After syncing, generate
artifacts/manifests so the app can reference the CDN outputs with stable URLs.
All generated files land in `tmp/cdn/<target>/<kind>/<version>/` before sync,
where `<target>` is `_staging` or `release`, and `<kind>` is `images`, `fonts`,
or `videos`.

### Fonts

There are three font paths:
1) Self-hosted font files
2) Google Fonts URL generation
3) Local artifacts (font config + font-face outputs)

Pipeline flow:
- Self-hosted fonts are prepared locally and staged under `tmp/cdn`.
- Artifacts are generated for the app (font-face CSS + config JSON).
- Google Fonts URLs are generated for remote loading.

Commands:
- Full pipeline: `yarn generate:fonts`
- Self-hosted only: `yarn --cwd cdn generate:selfHostedFonts`
- Artifacts only: `yarn --cwd cdn generate:fonts:artifacts`
- Google URLs only: `yarn --cwd cdn generate:googleFonts`

### Images

Sources come from:
- Local files in `cdn/media/images/localImageSrc`
- Optional remote map in `cdn/media/images/imageSources.json`

The pipeline produces resized formats, stores outputs in the CDN temp area, and
writes a manifest used by the app. Outputs are separated by target under
`tmp/cdn/_staging/images/...` or `tmp/cdn/release/images/...`.

Commands:
- Full pipeline: `yarn generate:img`
- Generate files: `yarn --cwd cdn generate:img:files`
- Generate artifacts: `yarn --cwd cdn generate:img:artifacts`

### Videos

Sources come from:
- Local files in `cdn/media/videos/localVideoSrc`
- Remote map in `cdn/media/videos/videoSources.json`

The pipeline generates HLS ladders and posters, syncs them to the CDN, and then
creates the video manifest used by the app. Outputs are separated by target
under `tmp/cdn/_staging/videos/...` or `tmp/cdn/release/videos/...`.

Commands:
- Full pipeline: `yarn generate:videos`
- Generate files: `yarn --cwd cdn generate:videos:files`
- Generate posters: `yarn --cwd cdn generate:videos:posters`
- Generate artifacts: `yarn --cwd cdn generate:videos:artifacts`

### Syncing with CDN

Use the CDN client to list, sync, purge cache, or delete objects. The scripts
prompt before destructive actions. Targets map to top-level CDN prefixes:
`_staging/` and `release/`.

List:
- `yarn --cwd cdn cdn:ls`
- `yarn --cwd cdn cdn:ls _staging/images/v1`

Sync:
- `yarn --cwd cdn cdn:sync --images --target=_staging`
- `yarn --cwd cdn cdn:sync --videos --target=release`

Purge cache:
- `yarn --cwd cdn cdn:cache --fonts --target=_staging --prefix`

Delete a file:
- `yarn --cwd cdn cdn:delete images/v1/SomeFolder/some-file.png`

Delete a folder/prefix:
- `yarn --cwd cdn cdn:delete:prefix images/v1/SomeFolder`

Delete a version:
- `yarn --cwd cdn cdn:delete:version _staging images v1`
- `yarn --cwd cdn cdn:delete:version release images v1`
