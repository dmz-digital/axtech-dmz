import { useState, useCallback, useRef } from 'react';
import { SearchResult } from './useSemanticSearch';
import { AI_CONFIG } from '../config/ai';

export interface AnswerSource {
  title: string;
  slug: string;
}

export interface AnswerParagraph {
  text: string;
  sources: AnswerSource[];
}

export interface GeneratedAnswer {
  paragraphs: AnswerParagraph[];
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function useAnswerGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [answer, setAnswer] = useState<GeneratedAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generateAnswer = useCallback(async (query: string, results: SearchResult[], language: string = 'pt') => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    abortRef.current = new AbortController();
    setIsGenerating(true);
    setAnswer(null);
    setError(null);

    try {
      const sources = results.map((r) => ({
        title: r.title,
        slug: r.slug,
        summary: r.summary,
      }));

      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          query,
          sources,
          model: AI_CONFIG.model,
          promptTemplate: AI_CONFIG.promptTemplate,
          language,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate answer');
      }

      const data: GeneratedAnswer = await response.json();
      setAnswer(data);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError((err as Error).message || 'Erro ao gerar resposta');
      }
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setAnswer(null);
    setError(null);
    setIsGenerating(false);
  }, []);

  return { generateAnswer, isGenerating, answer, error, reset };
}
