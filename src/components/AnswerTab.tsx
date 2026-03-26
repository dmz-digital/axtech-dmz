import { useEffect, useRef, useState, useCallback } from 'react';
import { AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { AnswerSkeleton } from './Skeleton';
import { SearchResult } from '../hooks/useSemanticSearch';
import { useAnswerGeneration, AnswerParagraph } from '../hooks/useAnswerGeneration';
import { useTranslation } from 'react-i18next';
import AnswerActions from './AnswerActions';

const TYPING_SPEED_MS = 18;

interface TypingParagraphProps {
  paragraph: AnswerParagraph;
  onDone: () => void;
}

function TypingParagraph({ paragraph, onDone }: TypingParagraphProps) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasCompletedRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (hasCompletedRef.current) return;

    indexRef.current = 0;
    setDisplayed('');
    setDone(false);

    const tick = () => {
      indexRef.current += 1;
      setDisplayed(paragraph.text.slice(0, indexRef.current));
      if (indexRef.current >= paragraph.text.length) {
        hasCompletedRef.current = true;
        setDone(true);
        onDoneRef.current();
      } else {
        timerRef.current = setTimeout(tick, TYPING_SPEED_MS);
      }
    };

    timerRef.current = setTimeout(tick, TYPING_SPEED_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [paragraph.text]);

  return (
    <div className="mb-6">
      <p className="text-gray-700 leading-relaxed mb-3">
        {displayed}
        {!done && (
          <span
            className="inline-block w-0.5 h-4 bg-teal-600 ml-0.5 align-middle"
            style={{ animation: 'blink 0.8s step-end infinite' }}
          />
        )}
      </p>
      {done && paragraph.sources.length > 0 && (
        <div
          className="flex flex-wrap gap-2"
          style={{ animation: 'fadeIn 0.4s ease-out both' }}
        >
          {paragraph.sources.map((source) => (
            <a
              key={source.slug}
              href={`/articles/${source.slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-teal-200 text-teal-700 bg-teal-50 hover:bg-teal-100 hover:border-teal-300 transition-colors"
            >
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
              <span className="truncate max-w-[200px]">{source.title}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

interface AnswerTabProps {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
}

export default function AnswerTab({ query, results, isLoading }: AnswerTabProps) {
  const { t, i18n } = useTranslation();
  const { generateAnswer, isGenerating, answer, error, reset } = useAnswerGeneration();
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(0);
  const [isAllDone, setIsAllDone] = useState(false);
  const lastQueryRef = useRef('');
  const language = i18n.language.startsWith('pt') ? 'pt' : 'en';

  useEffect(() => {
    if (!isLoading && results.length > 0 && query && query !== lastQueryRef.current) {
      lastQueryRef.current = query;
      setActiveParagraphIndex(0);
      setIsAllDone(false);
      generateAnswer(query, results, language);
    }
  }, [isLoading, results, query, language, generateAnswer]);

  const handleParagraphDone = useCallback((index: number, total: number) => {
    if (index < total - 1) {
      setActiveParagraphIndex(index + 1);
    } else {
      setIsAllDone(true);
    }
  }, []);

  const handleRegenerate = useCallback(() => {
    lastQueryRef.current = '';
    reset();
    setActiveParagraphIndex(0);
    setIsAllDone(false);
    generateAnswer(query, results, language);
  }, [query, results, language, generateAnswer, reset]);

  if (isLoading) {
    return <AnswerSkeleton />;
  }

  if (results.length === 0 && !isGenerating && !answer) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            {t('answer.no_results')}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">
            <p className="font-medium mb-1">{t('answer.error_title')}</p>
            <p>{error}</p>
          </div>
        </div>
        <button
          onClick={handleRegenerate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: '#1B5E7B' }}
        >
          <RefreshCw className="w-4 h-4" />
          {t('answer.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      {isGenerating && !answer && (
        <div className="flex items-center gap-3 text-sm text-gray-500 py-2">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-teal-400"
                style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
          <span>{t('answer.generating')}</span>
        </div>
      )}

      {answer && (
        <div>
          {answer.paragraphs.map((paragraph, index) =>
            index <= activeParagraphIndex ? (
              <TypingParagraph
                key={`${query}-${index}`}
                paragraph={paragraph}
                onDone={() => handleParagraphDone(index, answer.paragraphs.length)}
              />
            ) : null
          )}
          {isAllDone && (
            <div style={{ animation: 'fadeIn 0.4s ease-out both' }}>
              <AnswerActions
                answer={answer}
                query={query}
                onRegenerate={handleRegenerate}
              />
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
