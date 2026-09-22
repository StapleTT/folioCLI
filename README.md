# folioCLI

Your portfolio, from the command line.

TypeScript, React, and Vite portfolio starter. The terminal currently supports
`help` and `about`; the remaining terminal and browse features are tracked in
[BRIEF.md](BRIEF.md) and [TASKS.md](TASKS.md).

See [CUSTOMIZATION.md](CUSTOMIZATION.md) for the configuration and sample Markdown
content, including section visibility and prompt conventions. Configured identity,
prompt, and enabled about content are connected to the terminal.

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
npm test
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

## Current command behavior

Type a command and press Enter or use Run. `help` lists registered commands;
`about` renders `src/content/about.md` and any `src/content/about/**/*.md` files
in path order as separate Markdown documents. Set `commands.about` to `false`
to remove it from lookup and help.

Names are case-sensitive. Whitespace separates arguments; single or double quotes
group words, preserve empty arguments, and can appear within a word. Backslashes
and shell operators are literal characters: there is no shell execution, escape
syntax, piping, redirection, or chaining. Unclosed quotes produce a visible parse
error without executing. The current built-ins ignore arguments. Blank input
adds no transcript entry; unknown commands and thrown/rejected executions show
an error, and subsequent commands still work. Duplicate names or aliases and
invalid names fail during registry creation instead of silently replacing a command.

`src/terminal/engine.ts` owns parsing and sync/async execution independently of
React. Register source-level commands in `src/commands/index.ts`; return
`{ type: 'text', text }` by default, or `{ type: 'markdown', documents }` for
Markdown content. The UI escapes plain text and renders Markdown through
`react-markdown` and `rehype-sanitize`, ignoring raw HTML. Input remains focused
and read-only while a command runs; submissions are serialized. Tab retains
normal browser focus navigation. History and completion come in later tasks.

`npm test` checks parsing, lookup, aliases, failures, prompt substitution, built-in
content, and safe output using Node's test runner and Vite's existing module loader.
