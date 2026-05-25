import React from 'react';
import Svg, { G, Rect, Circle, Path } from 'react-native-svg';

/**
 * Ícone vetorial do app: dois cartões de figurinha empilhados + bola de futebol.
 * Bola com patches baseados em arcos reais da circunferência — sem xadrez, sem PNG.
 *
 * ViewBox 0 0 100 100. Bola: center(50,62) r=22.
 * Pontos na circunferência: (50 + 22·cosθ, 62 + 22·sinθ), θ em graus SVG (y↓).
 *   θ=-118° → (39.7, 42.6)   θ=-62° → (60.3, 42.6)   (topo)
 *   θ=-20°  → (70.7, 54.5)   θ= 50° → (64.1, 78.9)   (direita)
 *   θ= 70°  → (57.5, 82.7)   θ=110° → (42.5, 82.7)   (baixo)
 *   θ=130°  → (35.9, 78.9)   θ=200° → (29.3, 54.5)   (esquerda)
 */
export default function AppLogo({ size = 110 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">

      {/* ── Cartão de trás – âmbar, inclinado para a esquerda ── */}
      <G transform="rotate(-22, 43, 52)">
        <Rect x="13" y="12" width="50" height="68" rx="8" fill="#F59E0B" />
        {/* topo mais escuro para profundidade */}
        <Rect x="13" y="12" width="50" height="6" rx="8" fill="rgba(0,0,0,0.10)" />
        <Rect x="21" y="23" width="34" height="3" rx="1.5" fill="rgba(255,255,255,0.50)" />
        <Rect x="21" y="30" width="24" height="3" rx="1.5" fill="rgba(255,255,255,0.35)" />
        <Rect x="21" y="37" width="29" height="3" rx="1.5" fill="rgba(255,255,255,0.25)" />
      </G>

      {/* ── Cartão da frente – verde esmeralda, inclinado para a direita ── */}
      <G transform="rotate(10, 57, 47)">
        <Rect x="37" y="9" width="50" height="68" rx="8" fill="#059669" />
        <Rect x="37" y="9" width="50" height="6" rx="8" fill="rgba(0,0,0,0.10)" />
        <Rect x="45" y="20" width="34" height="3" rx="1.5" fill="rgba(255,255,255,0.50)" />
        <Rect x="45" y="27" width="24" height="3" rx="1.5" fill="rgba(255,255,255,0.35)" />
        <Rect x="45" y="34" width="29" height="3" rx="1.5" fill="rgba(255,255,255,0.25)" />
      </G>

      {/* ── Sombra sutil sob a bola ── */}
      <Circle cx="51" cy="64" r="22" fill="rgba(0,0,0,0.13)" />

      {/* ── Bola branca ── */}
      <Circle cx="50" cy="62" r="22" fill="white" />

      {/*
        ── Manchas da bola ──
        Cada mancha: arco na circunferência (borda externa) + polígono interno.
        Regra de varredura (sweep):
          - Centro fica à DIREITA do sentido de percurso → sweep=0
          - Centro fica à ESQUERDA                      → sweep=1
      */}

      {/* Topo: θ=-118° → θ=-62°, arco pelo ponto (50,40), sweep=1 */}
      <Path
        d="M39.7 42.6 A22 22 0 0 1 60.3 42.6 L56 50 L50 53 L44 50 Z"
        fill="#1E293B"
      />

      {/* Direita: θ=-20° → θ=50°, arco pelo ponto (72,62), sweep=1 */}
      <Path
        d="M70.7 54.5 A22 22 0 0 1 64.1 78.9 L62 73 L60 65 L63 58 Z"
        fill="#1E293B"
      />

      {/* Baixo: θ=70° → θ=110°, arco pelo ponto (50,84), sweep=0 */}
      <Path
        d="M57.5 82.7 A22 22 0 0 0 42.5 82.7 L44 77 L50 74 L56 77 Z"
        fill="#1E293B"
      />

      {/* Esquerda: θ=200° → θ=130°, arco pelo ponto (28,62), sweep=0 */}
      <Path
        d="M29.3 54.5 A22 22 0 0 0 35.9 78.9 L38 73 L40 65 L37 58 Z"
        fill="#1E293B"
      />

      {/* Contorno da bola por cima das manchas */}
      <Circle cx="50" cy="62" r="22" fill="none" stroke="#1E293B" strokeWidth="1.5" />
    </Svg>
  );
}
