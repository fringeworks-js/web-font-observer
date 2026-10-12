import _getFontFaceSet from '../_internal/_getFontFaceSet';
import _toFont from '../_internal/_toFont';
import { DEFAULT_TIMEOUT, POLLING_INTERVAL } from '../constants';
import type { WaitForWebFontOptions } from './types';

/**
 * 指定のWebフォントが利用可能になるまで待機する関数\
 * 対象は`@font-face`等で登録されたWebフォントで、システムフォントを指定した場合はタイムアウトする
 * @param family フォントファミリー
 * @param options オプション
 * @returns 利用可能になったFontFaceの配列で解決するPromise。
 * タイムアウト時は`TimeoutError`、中断時は`signal.reason`（未設定の場合は`AbortError`）、
 * FontFaceSetを利用できない環境では`NotSupportedError`でrejectする
 */
export default function waitForWebFont(
  family: string,
  options: WaitForWebFontOptions = {},
): Promise<FontFace[]> {
  const { timeout = DEFAULT_TIMEOUT, signal, text } = options;
  const fontFaceSet = _getFontFaceSet();
  if (!fontFaceSet) {
    return Promise.reject(
      new DOMException('FontFaceSet is not available.', 'NotSupportedError'),
    );
  }
  if (signal?.aborted) {
    return Promise.reject(getAbortReason(signal));
  }
  const font = _toFont(family, options);

  return new Promise((resolve, reject) => {
    let settled = false;
    let pollingId: ReturnType<typeof setTimeout>;
    let timeoutId: ReturnType<typeof setTimeout>;

    // 一度だけ確定させ、タイマーとイベントリスナーを後始末する
    const settle = (fn: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(pollingId);
      clearTimeout(timeoutId);
      signal?.removeEventListener('abort', onAbort);
      fn();
    };
    // signal があるときだけ登録するので、signal は必ずある
    const onAbort = () => settle(() => reject(getAbortReason(signal!)));

    const check = () => {
      fontFaceSet.load(font, text).then(
        (fontFaces) => {
          if (settled) {
            return;
          }
          if (fontFaces.length > 0) {
            settle(() => resolve(fontFaces));
          } else {
            // CSSの読み込み待ちなどで、まだFontFaceが登録されていない
            pollingId = setTimeout(check, POLLING_INTERVAL);
          }
        },
        (error) => settle(() => reject(error)),
      );
    };

    signal?.addEventListener('abort', onAbort);
    if (Number.isFinite(timeout)) {
      timeoutId = setTimeout(() => {
        settle(() =>
          reject(
            new DOMException(
              `Web font "${family}" was not available within ${timeout}ms.`,
              'TimeoutError',
            ),
          ),
        );
      }, timeout);
    }
    check();
  });
}

/**
 * 中断の理由を取得する
 * @param signal AbortSignal
 * @returns 中断の理由
 */
function getAbortReason(signal: AbortSignal): unknown {
  // reasonに対応していないブラウザ向けにAbortErrorを補う
  return signal.reason ?? new DOMException('Aborted.', 'AbortError');
}
