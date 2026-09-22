import Markdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import type { CommandResult } from '../terminal/engine';

export default function Output({ result }: { result: CommandResult }) {
  if (result.type === 'clear') return null;
  if (result.type === 'markdown') return result.documents.map((document, index) => (
    <div className="markdown" key={index}>
      <Markdown skipHtml rehypePlugins={[rehypeSanitize]}>{document}</Markdown>
    </div>
  ));
  return <pre className={result.type === 'error' ? 'error' : undefined}>{result.text}</pre>;
}
