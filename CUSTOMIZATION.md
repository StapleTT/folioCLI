# Portfolio content and customization

These files establish the content contract for the first release. The current
placeholder page does not read them yet; later tasks add discovery and rendering.

## Identity, prompt, theme, and sections

Edit `src/config/portfolio.ts` for the owner's display name, username, hostname,
prompt format, theme name, and section visibility. The demo identity is John Doe,
username `john`, hostname `portfolio`, with the `default` theme. Role and biography
text belong in Markdown content rather than additional required configuration.

The prompt represents the configured owner, not a logged-in visitor. Supported
placeholders are `{name}`, `{username}`, and `{hostname}`, replaced with the
corresponding `user` values. Replace every occurrence once, without recursively
interpreting substituted values. Other text, including unknown placeholders, stays
literal. The default renders `john@portfolio:~$`; `~` is decorative and implies no
filesystem. Identity and prompt values are plain text, never HTML.

Set a section's `commands` flag to `false` to remove its command and aliases from
lookup, help, and completion, and hide all its content from browse mode. Set it
back to `true` to restore it. All four flags are explicit booleans. These flags
control only `about`, `projects`, `experience`, and `contact`; utility commands
`help`, `clear`, and `browse` remain available. Visibility is not access control:
do not place secrets in a static site's content, even in disabled sections.

## Markdown content

Edit or add `.md` files under `src/content/`. No frontmatter, IDs, dates, headings,
or other fields are required. The built-in section names form the convention:

| Section command | Content sources (both may coexist) |
| --- | --- |
| `about` | `about.md` and `about/**/*.md` |
| `projects` | `projects.md` and `projects/**/*.md` |
| `experience` | `experience.md` and `experience/**/*.md` |
| `contact` | `contact.md` and `contact/**/*.md` |

Names are case-sensitive. Inside each section, owners choose file names and any
folder nesting. Use one root file, many nested files, or both. Files outside these
four section paths and non-Markdown files are not portfolio content in this release.
This keeps section membership unambiguous without frontmatter or a second mapping.

Build-time discovery produces one content source shared by commands and browse.
A section command renders all its files in ascending relative-path order, each
as a separate Markdown document; a root section file comes before its folder's
files. Browse mirrors those same file paths as a nested tree and opens one file
at a time. File and folder names provide navigation labels, so headings are optional.
Editing, adding, or removing content requires a rebuild before deployment.

An enabled section with no files remains a valid command that produces no content;
it has no browse entries. Empty files remain selectable and render an empty document.
Empty folders contribute no document or error and need no synthetic tree node
(Git does not preserve empty directories). Disabling a section hides it regardless
of whether its files exist. There is no per-file visibility flag; remove a file
from the content directory to omit it from an enabled section.

Markdown must render safely in both modes, without executing raw HTML or scripts.
Use descriptive link labels and `https://` or `mailto:` links for the demo's
projects and contact details.

## Included examples

- `src/content/about.md`: owner name, role, and introduction.
- `src/content/projects/task-board.md`: project description and web link.
- `src/content/projects/tools/markdown-notes.md`: nested project and source link.
- `src/content/experience/demo-studio.md`: fictional role and accomplishments.
- `src/content/contact.md`: email and profile links.

Replace all demo text and example links before publishing. Keep the name in the
about content consistent with the configured display name; Markdown is not a
template and does not substitute configuration placeholders. Normal customization
does not require changes to terminal logic or React components.
