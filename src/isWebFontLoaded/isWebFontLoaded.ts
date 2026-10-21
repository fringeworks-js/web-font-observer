import _findFontFaces from '../_internal/_findFontFaces';
import _getFontFaceSet from '../_internal/_getFontFaceSet';
import _toFont from '../_internal/_toFont';
import type { IsWebFontLoadedOptions } from './types';

/**
 * 指定のWebフォントがロード済みで、すぐに利用できるかを同期的に判定する関数\
 * 対象は`@font-face`等で登録されたWebフォントで、システムフォントは常にfalseになる
 * @param family フォントファミリー
 * @param options オプション
 * @returns ロード済みの場合はtrue。SSR時など判定できない環境ではfalse
 */
export default function isWebFontLoaded(
  family: string,
  options: IsWebFontLoadedOptions = {},
): boolean {
  const fontFaceSet = _getFontFaceSet();
  if (!fontFaceSet) {
    return false;
  }
  // check()は該当するFontFaceが無い場合（未登録のファミリーや、textを収録したファイルが無い場合）にも
  // trueを返すため、ロード済みのFontFaceが1つ以上あることを先に確認する
  const fontFaces = _findFontFaces(fontFaceSet, family);
  if (!fontFaces.some((fontFace) => fontFace.status === 'loaded')) {
    return false;
  }
  try {
    return fontFaceSet.check(_toFont(family, options), options.text);
  } catch {
    // 不正な指定の場合はロード済みとはみなさない
    return false;
  }
}
