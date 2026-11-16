/** Lowercase, trimmed and without accents, so searches ignore case and diacritics. */
export function foldText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}
