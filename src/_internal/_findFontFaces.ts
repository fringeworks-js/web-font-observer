import { normalizeFamily } from './_toFont';

/**
 * FontFaceSetに登録されている、指定のフォントファミリーのFontFaceを取得する
 * @param fontFaceSet FontFaceSet
 * @param family フォントファミリー
 * @returns 該当するFontFaceの配列。登録されていない場合は空配列
 */
export default function findFontFaces(
  fontFaceSet: FontFaceSet,
  family: string,
): FontFace[] {
  // フォントファミリー名はASCIIの大文字小文字を区別しない
  const target = normalizeFamily(family).toLowerCase();
  const fontFaces: FontFace[] = [];
  fontFaceSet.forEach((fontFace) => {
    if (normalizeFamily(fontFace.family).toLowerCase() === target) {
      fontFaces.push(fontFace);
    }
  });
  return fontFaces;
}
