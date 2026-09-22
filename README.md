# folioCLI

Your portfolio, from the command line.

Minimal TypeScript, React, and Vite foundation. The current page is a placeholder;
terminal and browse features are defined in [BRIEF.md](BRIEF.md) and [TASKS.md](TASKS.md).

## Local development

Install a current Node.js LTS release (22.12+ or 24+) with npm, then run:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The page lives in `src/App.tsx`, with styles
in `src/styles.css`.

## Checks and production build

```sh
npm run typecheck
npm run build
npm run preview
```

The build includes type-checking and writes static files to `dist/`. Preview
serves that build locally; it is not a production server.

For a host serving the site under a repository subpath, set Vite's base at build time:

```sh
npm run build -- --base=/folioCLI/
npm run preview
```

Use your actual repository name in place of `folioCLI`, and visit that subpath
when previewing. Full deployment instructions will follow with the deployment task.
