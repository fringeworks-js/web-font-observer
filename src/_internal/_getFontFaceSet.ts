/**
 * documentのFontFaceSetを取得する
 * @returns FontFaceSet。SSR時など利用できない環境ではundefined
 */
export default function getFontFaceSet(): FontFaceSet | undefined {
  return typeof document === 'undefined' ? undefined : document.fonts;
}
