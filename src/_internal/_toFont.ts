import type { WebFontMatchOptions } from '../types';

/**
 * フォントファミリーとオプションから、FontFaceSetのメソッドに渡す`font`ショートハンドを作成する
 * @param family フォントファミリー
 * @param options オプション
 * @returns `font`ショートハンド
 */
export default function toFont(
  family: string,
  options: WebFontMatchOptions,
): string {
  const { weight, style, width } = options;
  return [style, weight, width, '16px', quoteFamily(family)]
    .filter((value) => value != null)
    .join(' ');
}

/**
 * フォントファミリーの前後の空白とクォートを取り除く
 * @param family フォントファミリー
 * @returns 正規化されたフォントファミリー
 */
export function normalizeFamily(family: string): string {
  const trimmed = family.trim();
  const match = /^(["'])(.*)\1$/.exec(trimmed);
  return match ? match[2]! : trimmed;
}

/**
 * フォントファミリーをCSSの文字列として扱えるようにクォートする
 * @param family フォントファミリー
 * @returns クォートされたフォントファミリー
 */
function quoteFamily(family: string): string {
  const escaped = normalizeFamily(family)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
  return `"${escaped}"`;
}
