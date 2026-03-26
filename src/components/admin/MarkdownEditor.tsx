import { useState } from 'react';
import { Eye, CreditCard as Edit3 } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

function parseMarkdown(text: string): string {
  let html = text;
  html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>');
  html = html.replace(/^\- (.*$)/gm, '<li class="ml-4">$1</li>');
  html = html.replace(/(<li.*<\/li>)/s, '<ul class="list-disc my-2">$1</ul>');
  html = html.replace(/^\d+\. (.*$)/gm, '<li class="ml-4">$1</li>');
  html = html.replace(/\n\n/g, '</p><p class="my-3">');
  html = '<p class="my-3">' + html + '</p>';
  return html;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Escreva seu conteudo em Markdown...',
  rows = 15,
}: MarkdownEditorProps) {
  const [preview, setPreview] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-600">
          {preview ? 'Preview' : 'Markdown'}
        </span>
        <button
          type="button"
          onClick={() => setPreview(!preview)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
        >
          {preview ? (
            <>
              <Edit3 className="w-4 h-4" />
              Editar
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Preview
            </>
          )}
        </button>
      </div>

      {preview ? (
        <div
          className="p-4 prose prose-sm max-w-none min-h-[300px] bg-white"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(value) }}
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full p-4 border-0 focus:outline-none focus:ring-0 resize-none font-mono text-sm"
        />
      )}

      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Suporta Markdown: **negrito**, *italico*, # titulos, - listas, `codigo`
        </p>
      </div>
    </div>
  );
}
