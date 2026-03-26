import { useState, useRef, useEffect } from 'react';
import {
  Share2,
  Download,
  Copy,
  RefreshCw,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Check,
  Link,
  FileText,
} from 'lucide-react';
import { GeneratedAnswer } from '../hooks/useAnswerGeneration';

interface AnswerActionsProps {
  answer: GeneratedAnswer;
  query: string;
  onRegenerate: () => void;
}

function getFullAnswerText(answer: GeneratedAnswer, query: string): string {
  const lines = [`Pergunta: ${query}`, ''];
  for (const paragraph of answer.paragraphs) {
    lines.push(paragraph.text);
    if (paragraph.sources.length > 0) {
      lines.push('');
      lines.push('Fontes:');
      for (const s of paragraph.sources) {
        lines.push(`- ${s.title}`);
      }
    }
    lines.push('');
  }
  return lines.join('\n').trim();
}

function getUniqueSources(answer: GeneratedAnswer) {
  const seen = new Set<string>();
  const sources = [];
  for (const paragraph of answer.paragraphs) {
    for (const source of paragraph.sources) {
      if (!seen.has(source.slug)) {
        seen.add(source.slug);
        sources.push(source);
      }
    }
  }
  return sources;
}

export default function AnswerActions({ answer, query, onRegenerate }: AnswerActionsProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const sourcesRef = useRef<HTMLDivElement>(null);

  const uniqueSources = getUniqueSources(answer);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
      if (sourcesRef.current && !sourcesRef.current.contains(e.target as Node)) {
        setShowSources(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = async () => {
    const text = getFullAnswerText(answer, query);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = getFullAnswerText(answer, query);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resposta-${query.slice(0, 40).replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: query, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div
      className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl mt-4"
      style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
    >
      <div className="flex items-center gap-1">
        <ActionButton onClick={handleShare} tooltip="Compartilhar">
          <Share2 className="w-4 h-4" />
        </ActionButton>

        <ActionButton onClick={handleDownload} tooltip="Baixar resposta">
          <Download className="w-4 h-4" />
        </ActionButton>

        <ActionButton onClick={handleCopy} tooltip={copied ? 'Copiado!' : 'Copiar resposta'}>
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
        </ActionButton>

        <ActionButton onClick={onRegenerate} tooltip="Regerar resposta">
          <RefreshCw className="w-4 h-4" />
        </ActionButton>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        <div className="relative" ref={sourcesRef}>
          <button
            onClick={() => setShowSources((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors text-xs font-medium"
          >
            <BookOpen className="w-4 h-4 text-teal-600" />
            <span className="text-teal-600">{uniqueSources.length}</span>
            <span>fontes</span>
          </button>

          {showSources && uniqueSources.length > 0 && (
            <div
              className="absolute bottom-full left-0 mb-2 w-72 rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
              style={{ backgroundColor: '#ffffff' }}
            >
              <div className="px-3 py-2 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fontes</p>
              </div>
              <div className="max-h-56 overflow-y-auto">
                {uniqueSources.map((source) => (
                  <a
                    key={source.slug}
                    href={`/articles/${source.slug}`}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-gray-600 hover:text-gray-900"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    <span className="text-xs truncate">{source.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <ActionButton
          onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
          tooltip="Resposta útil"
          active={feedback === 'up'}
          activeColor="text-green-600"
        >
          <ThumbsUp className="w-4 h-4" />
        </ActionButton>

        <ActionButton
          onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
          tooltip="Resposta não útil"
          active={feedback === 'down'}
          activeColor="text-red-500"
        >
          <ThumbsDown className="w-4 h-4" />
        </ActionButton>

        <div className="relative" ref={moreRef}>
          <ActionButton onClick={() => setShowMore((v) => !v)} tooltip="Mais opções">
            <MoreHorizontal className="w-4 h-4" />
          </ActionButton>

          {showMore && (
            <div
              className="absolute bottom-full right-0 mb-2 w-48 rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
              style={{ backgroundColor: '#ffffff' }}
            >
              <button
                onClick={() => { handleCopy(); setShowMore(false); }}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors text-left"
              >
                <Copy className="w-4 h-4" />
                Copiar texto
              </button>
              <button
                onClick={() => { handleDownload(); setShowMore(false); }}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors text-left"
              >
                <Download className="w-4 h-4" />
                Baixar como .txt
              </button>
              <button
                onClick={() => { handleShare(); setShowMore(false); }}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors text-left"
              >
                <Link className="w-4 h-4" />
                Copiar link
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ActionButtonProps {
  onClick: () => void;
  tooltip: string;
  children: React.ReactNode;
  active?: boolean;
  activeColor?: string;
}

function ActionButton({ onClick, tooltip, children, active, activeColor }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`p-2 rounded-lg transition-colors ${
        active
          ? `${activeColor || 'text-gray-900'} bg-gray-100`
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}
