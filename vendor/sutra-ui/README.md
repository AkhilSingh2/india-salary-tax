# Vendored Sutra UI

Built `@sutra-ui/tokens` and `@sutra-ui/react` from [AkhilSingh2/sutra-ui](https://github.com/AkhilSingh2/sutra-ui) commit `ba0f4b4510f93ad44ac77e41d99d27e031895763` (“Restyle Sutra UI as a restrained gallery”) on `main`.

The packages are not on npm. This repo depends on these folders with `file:`, so `npm ci` does not need pnpm, Style Dictionary, or a clone of the design-system repo.

`react/dist/styles.css` already includes the token CSS. `tokens/dist/tailwind-preset.js` is the Tailwind preset. Do not edit `dist/` by hand. The Aayam app reads semantic token variables and Sutra components only, so a later token build can replace these `dist` folders without rewriting the pages.

To refresh: check out the new commit, run `pnpm install && pnpm build:libs`, replace `tokens/dist` and `react/dist`, and update the commit above. The license is MIT, copied in `LICENSE`.
