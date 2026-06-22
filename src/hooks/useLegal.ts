import { useState, useEffect } from 'react';
import { fetchLegalContent } from '../services/legal';

const FALLBACK_PRIVACY = 'Não foi possível carregar a Política de Privacidade. Verifique sua conexão e tente novamente.';
const FALLBACK_TERMS = 'Não foi possível carregar os Termos de Uso. Verifique sua conexão e tente novamente.';

export function useLegal(): { privacyContent: string; termsContent: string } {
  const [privacyContent, setPrivacyContent] = useState(FALLBACK_PRIVACY);
  const [termsContent, setTermsContent] = useState(FALLBACK_TERMS);

  useEffect(() => {
    let cancelled = false;
    fetchLegalContent()
      .then(content => {
        if (!cancelled && content) {
          setPrivacyContent(content.privacy);
          setTermsContent(content.terms);
        }
      })
      .catch(() => {
        // Silently fall back to hardcoded content already in state
      });
    return () => { cancelled = true; };
  }, []);

  return { privacyContent, termsContent };
}
