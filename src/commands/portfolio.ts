import { createRegistry, type Command } from '../terminal/engine';

const descriptions = {
  about: 'Read about the portfolio owner.',
  projects: 'Explore projects.',
  experience: 'Read work experience.',
  contact: 'Find contact information.',
};
type Section = keyof typeof descriptions;

export function createPortfolioRegistry(
  enabled: Record<Section, boolean>,
  files: Record<string, string>,
  customCommands: readonly Command[] = [],
) {
  const commands: Command[] = [{
    name: 'help',
    description: 'List available commands.',
    execute: () => ({
      type: 'text',
      text: registry.commands.map(command => {
        const aliases = command.aliases?.length ? ` (${command.aliases.join(', ')})` : '';
        return `${command.name}${aliases} — ${command.description}`;
      }).join('\n'),
    }),
  }];

  for (const section of Object.keys(descriptions) as Section[]) {
    if (!enabled[section]) continue;
    const documents = Object.keys(files)
      .filter(path => path === `${section}.md` || (path.startsWith(`${section}/`) && path.endsWith('.md')))
      .sort()
      .map(path => files[path]);
    commands.push({
      name: section,
      aliases: section === 'about' ? ['whoami'] : undefined,
      description: descriptions[section],
      execute: () => ({ type: 'markdown', documents }),
    });
  }

  commands.push({
    name: 'clear',
    description: 'Clear the terminal screen.',
    execute: () => ({ type: 'clear' }),
  }, ...customCommands);
  const registry = createRegistry(commands);
  return registry;
}
