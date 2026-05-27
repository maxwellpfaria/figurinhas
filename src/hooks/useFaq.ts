import { useState, useEffect } from 'react';
import { FaqItem, fetchFaqItems } from '../services/faq';

// ─── Hardcoded fallback ───────────────────────────────────────────────────────
// Shown while fetching or when Firestore/network is unavailable.
// Keep this in sync with the content seeded to /config/faq in Firestore.

const FALLBACK_FAQ: FaqItem[] = [
  {
    id: '1',
    order: 1,
    q: 'Como adicionar uma figurinha?',
    a: 'Na aba Meu Álbum, toque na seleção desejada para abrir a grade de figurinhas. Depois, toque 1× em um card cinza para marcá-lo como coletado. Cada toque adiciona 1 cópia. O progresso é salvo automaticamente na nuvem.',
  },
  {
    id: '2',
    order: 2,
    q: 'Como editar ou remover uma figurinha?',
    a: 'Pressione e segure (long press) um card para abrir o editor de quantidade — defina o número exato de cópias ou zere para remover. Para edições rápidas em lote, use o botão ✏️ no cabeçalho: em modo edição cada toque alterna a figurinha entre ter 0 e 1 cópia.',
  },
  {
    id: '3',
    order: 3,
    q: 'Como navegar entre as seleções?',
    a: 'Na tela Meu Álbum, use os filtros de grupo (FWC, A–L, CC) ou a busca para localizar uma seleção rapidamente. Toque na seleção para abrir sua grade de figurinhas. Dentro da grade, deslize horizontalmente para avançar ou voltar à seleção seguinte ou anterior.',
  },
  {
    id: '4',
    order: 4,
    q: 'O que são figurinhas especiais?',
    a: 'São as 20 figurinhas holográficas da seção FWC e os 48 escudos (figurinha nº 1 de cada seleção). Total: 68 figurinhas especiais — identificadas pela borda dourada no álbum.',
  },
  {
    id: '5',
    order: 5,
    q: 'Como funciona a contagem de repetidas?',
    a: 'Conta o total de cópias extras. Exemplo: 3 cópias da mesma figurinha = 2 repetidas. A soma de todas as repetidas aparece nos stats da tela Início.',
  },
  {
    id: '6',
    order: 6,
    q: 'Como adicionar amigos?',
    a: 'Na aba Amigos, informe o código de convite do seu amigo no campo "Adicionar amigo". O seu próprio código aparece aqui na tela de Perfil, abaixo do seu nome.',
  },
  {
    id: '7',
    order: 7,
    q: 'O álbum é salvo automaticamente?',
    a: 'Sim. Cada alteração é sincronizada com a nuvem automaticamente cerca de 1,5 segundos após a última mudança. Um indicador de sincronização aparece no cabeçalho do álbum enquanto o salvamento ocorre.',
  },
  {
    id: '8',
    order: 8,
    q: 'Como funciona a troca via QR Code?',
    a: 'Na aba Troca QR, toque em "Gerar" para exibir o seu QR Code. O amigo escaneia pela aba "Escanear" com a câmera. O app calcula automaticamente quais figurinhas vocês podem trocar e apresenta o resultado numa tela de match com as listas de cada lado.',
  },
  {
    id: '9',
    order: 9,
    q: 'Como exportar minha lista de figurinhas?',
    a: 'Na aba Exportar, veja um resumo do seu álbum com faltantes e repetidas. Compartilhe direto no WhatsApp, pelo menu de compartilhamento nativo do sistema ou copie o texto para colar onde quiser.',
  },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseFaqResult {
  items: FaqItem[];
  /** True only during the initial remote fetch (fallback is already shown). */
  loading: boolean;
}

/**
 * Returns FAQ items from Firestore (cached) with instant fallback to
 * hardcoded content while the network request is in progress.
 */
export function useFaq(): UseFaqResult {
  const [items, setItems] = useState<FaqItem[]>(FALLBACK_FAQ);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchFaqItems()
      .then(fetched => {
        if (!cancelled && fetched && fetched.length > 0) {
          setItems(fetched);
        }
      })
      .catch(() => {
        // Silently fall back to FALLBACK_FAQ already in state
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { items, loading };
}
