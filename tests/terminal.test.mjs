import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
after(() => server.close());
const { parse, createRegistry, formatPrompt } = await server.ssrLoadModule('/src/terminal/engine.ts');
const { default: Output } = await server.ssrLoadModule('/src/components/Output.tsx');
const { createPortfolioRegistry } = await server.ssrLoadModule('/src/commands/portfolio.ts');
const { registry } = await server.ssrLoadModule('/src/commands/index.ts');

test('parsing preserves arguments and rejects incomplete quotes before execution', async () => {
  assert.deepEqual(parse('  about\t"two words" \'three words\' "" ab"cd"  '), ['about', 'two words', 'three words', '', 'abcd']);
  assert.deepEqual(parse('echo a|b > c;d \\path'), ['echo', 'a|b', '>', 'c;d', '\\path']);
  assert.deepEqual(parse(' \n\t'), []);
  assert.throws(() => parse("about 'unfinished"), /unterminated quote/);
  let calls = 0;
  const core = createRegistry([{ name: 'about', description: '', execute: () => { calls++; return { type: 'text', text: '' }; } }]);
  assert.equal((await core.execute('about "unfinished')).type, 'error');
  assert.equal(await core.execute('  '), null);
  assert.equal(calls, 0);
});

test('lookup, aliases, sync/async failures and recovery', async () => {
  const echo = { name: 'echo', aliases: ['say'], description: '', execute: args => ({ type: 'text', text: args.join('|') }) };
  const core = createRegistry([echo,
    { name: 'async', description: '', execute: async () => ({ type: 'text', text: 'done' }) },
    { name: 'throw', description: '', execute: () => { throw new Error('private'); } },
    { name: 'reject', description: '', execute: async () => { throw new Error('private'); } },
  ]);
  assert.deepEqual(await core.execute('say "two words" tail'), { type: 'text', text: 'two words|tail' });
  assert.equal((await core.execute('async')).text, 'done');
  for (const command of ['missing', 'constructor', 'throw', 'reject']) {
    const result = await core.execute(command);
    assert.equal(result.type, 'error');
    assert.ok(!result.text.includes('private'));
  }
  assert.equal((await core.execute('echo recovered')).text, 'recovered');
  for (const duplicate of ['echo', 'say']) assert.throws(() => createRegistry([echo, { ...echo, name: duplicate, aliases: [] }]), /Duplicate/);
  assert.throws(() => createRegistry([{ ...echo, aliases: ['echo'] }]), /Duplicate/);
  assert.throws(() => createRegistry([{ ...echo, name: 'two words' }]), /Invalid/);
});

test('prompt replacements are literal, repeated and nonrecursive', () => {
  assert.equal(formatPrompt('{name} {username}@{hostname} {username} {unknown}', {
    name: '<script>', username: '{hostname}', hostname: 'portfolio',
  }), '<script> {hostname}@portfolio {hostname} {unknown}');
});

test('built-ins list registered commands and render discovered about content', async () => {
  assert.match((await registry.execute('help')).text, /^help — .+\nabout \(whoami\) — /);
  const result = await registry.execute('about');
  assert.equal(result.type, 'markdown');
  assert.match(result.documents[0], /# John Doe/);
});

test('output escapes plain text and sanitizes Markdown while retaining safe links', () => {
  const render = result => renderToStaticMarkup(createElement(Output, { result }));
  assert.equal(render({ type: 'text', text: '<script>alert(1)</script>' }), '<pre>&lt;script&gt;alert(1)&lt;/script&gt;</pre>');
  const html = render({ type: 'markdown', documents: [
    '# Heading\n\n**bold** [site](https://example.com) [mail](mailto:hello@example.com)\n\n<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[bad](javascript:alert%281%29)\n\n![bad](data:text/html,evil)',
    '[site][ref]\n\n[ref]: https://example.com',
    '[site][ref]',
  ] });
  assert.match(html, /<h1>Heading<\/h1>/);
  assert.match(html, /<strong>bold<\/strong>/);
  assert.match(html, /href="https:\/\/example.com"/);
  assert.match(html, /href="mailto:hello@example.com"/);
  assert.doesNotMatch(html, /<script|onerror|javascript:|data:text\/html/);
  assert.match(html, /\[site\]\[ref\]/);
});


test('enabled sections share lookup, aliases, help and ordered content; custom commands extend the registry', async () => {
  const enabled = { about: true, projects: true, experience: true, contact: true };
  const files = {
    'projects/z.md': 'last', 'projects.md': 'root', 'projects/tools/a.md': 'nested',
    'projects/empty.md': '', 'projects/no.txt': 'excluded', 'Projects.md': 'excluded',
    'projectstuff.md': 'excluded', 'about.md': 'owner', 'contact.md': 'email',
  };
  const custom = { name: 'hello', aliases: ['hi'], description: 'Say hello.', execute: async args => ({ type: 'text', text: args.join(' ') }) };
  const core = createPortfolioRegistry(enabled, files, [custom]);
  assert.deepEqual(await core.execute('projects'), { type: 'markdown', documents: ['root', '', 'nested', 'last'] });
  assert.deepEqual(await core.execute('experience'), { type: 'markdown', documents: [] });
  assert.deepEqual(await core.execute('whoami'), await core.execute('about'));
  assert.equal((await core.execute('hi "hello world"')).text, 'hello world');
  const help = (await core.execute('help')).text;
  for (const command of core.commands) {
    assert.ok(help.includes(command.name));
    for (const alias of command.aliases ?? []) assert.ok(help.includes(alias));
  }
  assert.deepEqual(await core.execute('clear'), { type: 'clear' });
  for (const section of Object.keys(enabled)) {
    const disabled = createPortfolioRegistry({ ...enabled, [section]: false }, files);
    assert.equal((await disabled.execute(section)).type, 'error');
    assert.ok(!disabled.commands.some(command => command.name === section));
    assert.ok(!(await disabled.execute('help')).text.includes(section));
    if (section === 'about') {
      assert.equal((await disabled.execute('whoami')).type, 'error');
      assert.ok(!(await disabled.execute('help')).text.includes('whoami'));
    }
    assert.deepEqual(await disabled.execute('clear'), { type: 'clear' });
  }
  assert.throws(() => createPortfolioRegistry(enabled, files, [{ ...custom, name: 'whoami' }]), /Duplicate/);
});

test('demo project and contact output contain labeled safe links', async () => {
  for (const [command, url] of [['projects', 'https://example.com/task-board'], ['contact', 'mailto:john@example.com']]) {
    const html = renderToStaticMarkup(createElement(Output, { result: await registry.execute(command) }));
    assert.ok(html.includes(`href="${url}"`));
    assert.match(html, /<a href="[^"]+">[^<]+<\/a>/);
  }
  assert.equal(renderToStaticMarkup(createElement(Output, { result: { type: 'clear' } })), '');
});
