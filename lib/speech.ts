/**
 * Speech synthesis utility for converting Markdown-heavy AI messages
 * into clean, natural speech via the browser's Web Speech API.
 */

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/**
 * Strips markdown formatting, code syntax, tables, and raw markup
 * to produce clean, natural text suitable for audio speech synthesis.
 */
export function stripMarkdownForSpeech(markdown: string): string {
  if (!markdown) return '';

  return markdown
    // Replace multi-line code blocks with an auditory announcement
    .replace(/```([a-zA-Z0-9_-]+)?[\s\S]*?```/g, (_match, lang) => {
      const languageName = lang ? `${lang} code example` : 'code block';
      return ` [${languageName} omitted from audio] `;
    })
    // Replace inline code `variable` with just variable
    .replace(/`([^`]+)`/g, '$1')
    // Remove headers (#, ##, ###)
    .replace(/^#{1,6}\s+/gm, '')
    // Clean markdown table dividers (|---|---|)
    .replace(/^\s*\|?[-:| ]+\|?\s*$/gm, '')
    // Clean markdown table cells (| Cell 1 | Cell 2 |) -> Cell 1, Cell 2
    .replace(/^\s*\|(.+)\|\s*$/gm, (_match, rowContent: string) => {
      return rowContent
        .split('|')
        .map((cell) => cell.trim())
        .filter(Boolean)
        .join(', ');
    })
    // Remove bold and italics (**text**, *text*, __text__, _text_)
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove strikethrough (~~text~~)
    .replace(/~~(.*?)~~/g, '$1')
    // Replace markdown links [label](url) with just label
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove blockquotes (> quote)
    .replace(/^\s*>\s+/gm, '')
    // Remove horizontal rules (---, ***, ___)
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Clean unordered list bullets (- , * , + )
    .replace(/^\s*[-*+]\s+/gm, '')
    // Clean ordered list numbers (1. , 2. )
    .replace(/^\s*\d+\.\s+/gm, '')
    // Remove HTML tags if present
    .replace(/<[^>]+>/g, '')
    // Convert multiple newlines into sentence pauses
    .replace(/\n\s*\n/g, '. ')
    .replace(/\n/g, ' ')
    // Collapse redundant spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Attempts to select a natural-sounding English voice if available in the browser.
 */
export function getPreferredSpeechVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSynthesisSupported()) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Prefer high-quality/natural English voices if available
  const preferred = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      (v.name.includes('Natural') ||
        v.name.includes('Google') ||
        v.name.includes('Samantha') ||
        v.name.includes('Daniel') ||
        v.name.includes('Karen'))
  );

  if (preferred) return preferred;

  // Fallback to any English voice
  const anyEnglish = voices.find((v) => v.lang.startsWith('en'));
  if (anyEnglish) return anyEnglish;

  // Fallback to default voice
  return voices.find((v) => v.default) || voices[0] || null;
}
