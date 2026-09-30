/**
 * font-widthに指定できるキーワード
 */
export type WebFontWidth =
  | 'normal'
  | 'ultra-condensed'
  | 'extra-condensed'
  | 'condensed'
  | 'semi-condensed'
  | 'semi-expanded'
  | 'expanded'
  | 'extra-expanded'
  | 'ultra-expanded';

/**
 * 対象のWebフォントを特定するためのオプション
 */
export type WebFontMatchOptions = {
  /**
   * フォントの太さ（font-weight）
   * @default 'normal'
   */
  weight?: number | 'normal' | 'bold';

  /**
   * フォントのスタイル（font-style）
   * @default 'normal'
   */
  style?: 'normal' | 'italic' | 'oblique' | `oblique ${number}deg`;

  /**
   * フォントの幅（font-width）\
   * `font`ショートハンドの制約により、キーワードのみ指定できる
   * @default 'normal'
   */
  width?: WebFontWidth;

  /**
   * 判定に使用する文字列\
   * `unicode-range`でファイルが分割されたWebフォントでは、この文字列を含むファイルが判定の対象となる\
   * 未指定の場合はブラウザのデフォルト（半角スペース）が使用される
   */
  text?: string;
};
