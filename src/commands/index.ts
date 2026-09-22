import config from '../config/portfolio';
import { createPortfolioRegistry } from './portfolio';

const sources = import.meta.glob<string>('../content/**/*.md', {
  query: '?raw', import: 'default', eager: true,
});
const files = Object.fromEntries(Object.entries(sources).map(([path, content]) => [
  path.slice('../content/'.length), content,
]));

// Add source-level custom commands as the third argument; the engine stays unchanged.
export const registry = createPortfolioRegistry(config.commands, files);
