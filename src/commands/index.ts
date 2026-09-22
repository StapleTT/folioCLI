import config from '../config/portfolio';
import { createRegistry, type Command } from '../terminal/engine';

const aboutFiles = import.meta.glob<string>(['../content/about.md', '../content/about/**/*.md'], {
  query: '?raw', import: 'default', eager: true,
});

const commands: Command[] = [{
  name: 'help',
  description: 'List available commands.',
  execute: () => ({
    type: 'text',
    text: commands.map(command => `${command.name} — ${command.description}`).join('\n'),
  }),
}];

if (config.commands.about) commands.push({
  name: 'about',
  description: 'Read about the portfolio owner.',
  execute: () => ({
    type: 'markdown',
    documents: Object.keys(aboutFiles).sort().map(path => aboutFiles[path]),
  }),
});

export const registry = createRegistry(commands);
