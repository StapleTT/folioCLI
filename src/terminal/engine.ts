export type CommandResult =
  | { type: 'text'; text: string }
  | { type: 'markdown'; documents: string[] }
  | { type: 'error'; text: string };

export type Command = {
  name: string;
  aliases?: string[];
  description: string;
  execute(args: string[]): CommandResult | Promise<CommandResult>;
  complete?(args: string[]): string[];
};

// Quotes group arguments; backslashes and shell operators are ordinary text.
export function parse(input: string): string[] {
  const words: string[] = [];
  let word = '';
  let quote = '';
  let started = false;
  for (const char of input) {
    if (quote) {
      if (char === quote) quote = '';
      else word += char;
    } else if (char === '"' || char === "'") {
      quote = char;
      started = true;
    } else if (/\s/u.test(char)) {
      if (started) words.push(word);
      word = '';
      started = false;
    } else {
      word += char;
      started = true;
    }
  }
  if (quote) throw new Error('Parse error: unterminated quote.');
  if (started) words.push(word);
  return words;
}

export function createRegistry(commands: readonly Command[]) {
  const lookup = new Map<string, Command>();
  for (const command of commands) {
    for (const name of [command.name, ...(command.aliases ?? [])]) {
      if (!name || /[\s'"\\]/u.test(name)) {
        throw new Error(`Invalid command name or alias: ${name}`);
      }
      if (lookup.has(name)) throw new Error(`Duplicate command name or alias: ${name}`);
      lookup.set(name, command);
    }
  }

  return {
    async execute(input: string): Promise<CommandResult | null> {
      let words: string[];
      try {
        words = parse(input);
      } catch (error) {
        return { type: 'error', text: (error as Error).message };
      }
      if (!words.length) return null;
      const [name, ...args] = words;
      const command = lookup.get(name);
      if (!command) return { type: 'error', text: `Unknown command: ${name}. Type "help" for available commands.` };
      try {
        return await command.execute(args);
      } catch {
        return { type: 'error', text: `Command failed: ${name}. Please try again.` };
      }
    },
  };
}

export function formatPrompt(format: string, user: { name: string; username: string; hostname: string }) {
  return format.replace(/\{(name|username|hostname)\}/g, (_, key: keyof typeof user) => user[key]);
}
