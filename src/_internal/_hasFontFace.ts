import { normalizeFamily } from './_toFont';

/**
 * 指定のフォントファミリーのFontFaceがFontFaceSetに登録されているかを判定する
 * @param fontFaceSet FontFaceSet
 * @param family フォントファミリー
 * @returns 登録されている場合はtrue
 */
export default function hasFontFace(
  fontFaceSet: FontFaceSet,
  family: string,
): boolean {
  // フォントファミリー名はASCIIの大文字小文字を区別しない
  const target = normalizeFamily(family).toLowerCase();
  let found = false;
  fontFaceSet.forEach((fontFace) => {
    if (!found && normalizeFamily(fontFace.family).toLowerCase() === target) {
      found = true;
    }
  });
  return found;
}
