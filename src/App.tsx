import { useRef, useState, type FormEvent } from 'react';
import config from './config/portfolio';
import { registry } from './commands';
import Output from './components/Output';
import { formatPrompt, type CommandResult } from './terminal/engine';

const prompt = formatPrompt(config.prompt.format, config.user);
type Entry = { input: string; result: CommandResult };

export default function App() {
  const [input, setInput] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(false);
  const executing = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (executing.current || !input.trim()) return;
    const submitted = input;
    executing.current = true;
    setBusy(true);
    setInput('');
    try {
      const result = await registry.execute(submitted);
      if (result) setEntries(previous => [...previous, { input: submitted, result }]);
    } finally {
      executing.current = false;
      setBusy(false);
    }
  }

  return (
    <main>
      <header>
        <h1>{config.user.name}</h1>
        <p>Type "help" to see available commands.</p>
      </header>
      <div role="log" aria-label="Terminal output" aria-live="polite" aria-relevant="additions">
        {entries.map((entry, index) => (
          <section className="entry" key={index}>
            <p className="submitted"><span className="prompt">{prompt}</span> {entry.input}</p>
            <Output result={entry.result} />
          </section>
        ))}
      </div>
      <form className="command-line" onSubmit={submit} aria-busy={busy}>
        <label htmlFor="command" className="prompt"><span className="sr-only">Command </span>{prompt}</label>
        <input id="command" value={input} onChange={event => setInput(event.target.value)}
          readOnly={busy} autoFocus autoComplete="off" autoCapitalize="off" spellCheck={false}
          onKeyDown={event => { if (event.key === 'Enter' && event.nativeEvent.isComposing) event.preventDefault(); }} />
      </form>
    </main>
  );
}
